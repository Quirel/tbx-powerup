'use strict';
import Vue from 'vue/dist/vue.min.js';
import { createTaskFromData, getTaskData } from './client';

const t = TrelloPowerUp.iframe();

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
        isLoading: true,
        taskId: t.arg('taskId'),
        taskUrl: t.arg('taskUrl'),
        bxLink: t.arg('bxLink'),
        task: {
          title: null,
          status: { id: null, title: null },
          creator: null,
          responsible: null,
          creatorLink: null,
          responsibleLink: null,
          deadline: null
        },
      };
    },

    async created() {
      const task = await t.get('card', 'shared', 'task');
      if (task) {
        this.task = task;
      }

      if (this.task.status.id === '5') {
        this.isLoading = false;
        return;
      }

      try {
        const data = await getTaskData(this.bxLink, this.taskId);
        if (data.title) {
          this.task = createTaskFromData(data, this.bxLink);
          await t.set('card', 'shared', 'task', this.task);
        }
      }
      catch (e) {
        console.error('Не удалось загрузить данные задачи.\n', e);
      }

      this.isLoading = false;
      t.sizeTo('#content');
    },


    template: `
        <div id="content">
            <div v-if="task.title" class="task">
                <p><b>{{task.title}}</b></p>
                <hr>
                <p><b>Статус</b>: {{task.status.title}}</p>
                <template v-if="task.creatorLink">
                    <p><b>Постановщик</b>: <a :href="task.creatorLink"
                                              target="_blank">{{task.creator}}</a></p>
                    <p><b>Ответственный</b>: <a :href="task.responsibleLink"
                                                target="_blank">{{task.responsible}}</a></p>
                </template>
                <template v-else>
                    <p><b>Постановщик</b>: {{task.creator}}</p>
                    <p><b>Ответственный</b>: {{task.responsible}}</p>
                </template>
                <p><a :href="taskUrl" target="_blank">Открыть задачу в Bitrix</a></p>
                <p v-show="isLoading"><small>Идет загрузка данных..</small></p>
            </div>
            <div v-else-if="isLoading">
                <p><small>Идет загрузка данных..</small></p>
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
      <main-component />`,
});
