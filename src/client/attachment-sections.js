'use strict';
import Vue from 'vue/dist/vue.min.js';

// const Promise = TrelloPowerUp.Promise;
const t = TrelloPowerUp.iframe();

// const statuses = {
//   '-3': 'Задача почти просрочена',
//   '-2': 'Новая задача (не просмотрена)',
//   '-1': 'Задача просрочена',
//   '1': 'Новая задача. (Не используется)',
//   '2': 'Ждет выполнения',
//   '3': 'Задача выполняется',
//   '4': 'Условно завершена (ждет контроля постановщиком)',
//   '5': 'Задача завершена',
//   '6': 'Задача отложена',
//   '7': 'Задача отклонена ответственным. (Не используется)'
// };

const statuses = {
  '-3': 'Почти просрочена',
  '-2': 'Новая',
  '-1': 'Просрочена',
  '1': 'Новая',
  '2': 'Ожидание',
  '3': 'Выполняется',
  '4': 'Ждет контроля',
  '5': 'Завершена',
  '6': 'Отложена',
  '7': 'Отклонена'
};

const mainComponent = {
    data() {
      return {
        isLoading: false,
        taskId: t.arg('taskId'),
        taskUrl: t.arg('taskUrl'),
        bxLink: t.arg('bxLink'),
        task: {
          title: null,
          status: {id: null, title: null},
          creator: null,
          responsible: null,
          creatorLink: null,
          responsibleLink: null,
          deadline: null
        },
      };
    },

    methods: {
      async getTaskData() {
        const url = `${this.bxLink}tasks.task.get?taskId=${this.taskId}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          return data.result.task;
        } catch (error) {
          console.error(error);
        }
      },

    },

    async created() {
      await t.render();
      const task = await t.get('card', 'shared', 'task');
      if (task) {
        this.task = task;
      }

      if (this.task.status.id === '5') {
        await t.sizeTo('#content');
        return;
      }

      this.isLoading = true;

      const baseUrl = new URL(this.bxLink).origin;
      const taskData = await this.getTaskData();

      this.task.title = taskData.title;
      this.task.creator = taskData.creator.name;
      this.task.responsible = taskData.responsible.name;
      this.task.creatorLink = baseUrl + taskData.creator.link;
      this.task.responsibleLink = baseUrl + taskData.responsible.link;
      this.task.deadline = taskData.deadline;
      this.task.status = {id: taskData.status, title: statuses[taskData.status]};

      if (this.task.status.id !== '5' && Date.parse(this.task.deadline) < Date.now()) {
        this.task.status.id = '-1';
        this.task.status.title = statuses[this.task.status.id];
      }
      await t.set('card', 'shared', 'task', this.task);
      t.sizeTo('#content');
    },


    template: `
        <div id="content">
            <div v-if="task.title" class="task">
                <p><b>{{task.title}}</b></p>
                <hr>
                <p><b>Статус</b>: {{task.status.title}}</p>
                <template v-if="task.creatorLink">
                    <p><b>Постановщик</b>: <a :href="task.creatorLink" target="_blank">{{task.creator}}</a></p>
                    <p><b>Ответственный</b>: <a :href="task.responsibleLink" target="_blank">{{task.responsible}}</a></p>
                </template>
                <template v-else>
                    <p><b>Постановщик</b>: {{task.creator}}</p>
                    <p><b>Ответственный</b>: {{task.responsible}}</p>
                </template>
                <p><a :href="taskUrl" target="_blank">Открыть задачу в Bitrix</a></p>
                <p v-show="isLoading"><small>Идет загрузка данных..</small></p>
            </div>
            <div v-else>
                <p style="color: tomato"><b>Не удалось загрузить данные</b></p>
                <p>Некорректная ссылка на задачу или недостаточно прав на ее просмотр</p>
            </div>
        </div>
    `
  }
;

new Vue({
  el: '#app',
  components: {
    'main-component': mainComponent
  },
  template: `
      <main-component/>`,
});
