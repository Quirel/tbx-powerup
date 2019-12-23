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
      taskId: t.arg('taskId'),
      taskUrl: t.arg('taskUrl'),
      bxLink: t.arg('bxLink'),
      task: {
        title: null,
        status: {id: null, title: null},
        creator: null,
        responsible: null,
        deadline: null
      },
      isLoading: false,
    };
  },

  created() {
    const url = `${this.bxLink}tasks.task.get?taskId=${this.taskId}`;
    // if completed => get data from card fields
    t.render(() => {
      t.get('card', 'shared', 'task')
        // .then(() => t.sizeTo('#content'))
        .then((task) => {
          if (task) {
            this.task = task;
          }
          // if no task or task not completed
          if (this.task.status.id !== '5') {
            this.isLoading = true;
            fetch(url)
              .then(response => response.json())
              .then(data => {
                this.isLoading = false;
                const taskData = data.result.task;
                this.task.title = taskData.title;
                this.task.creator = taskData.creator.name;
                this.task.responsible = taskData.responsible.name;
                this.task.deadline = taskData.deadline;
                this.task.status = {id: taskData.status, title: statuses[taskData.status]};

                if (this.task.status.id !== '5' && Date.parse(this.task.deadline) < Date.now()) {
                  this.task.status.id = '-1';
                  this.task.status.title = statuses[this.task.status.id];
                }

              })
              .then(() => t.set('card', 'shared', 'task', this.task))
              .then(() => t.sizeTo('#content'))
              .catch(error => console.error(error));
          }
        });
    });
  },

  template: `
      <div id="content">
          <p><b>{{task.title}}</b></p>
          <hr>
          <p><b>Статус</b>: {{task.status.title}}</p>
          <p><b>Постановщик</b>: {{task.creator}}</p>
          <p><b>Ответственный</b>: {{task.responsible}}</p>
          <p><a :href="taskUrl" target="_blank">Открыть в Bitrix</a></p>
          <p v-show="isLoading"><small>Идет загрузка данных..</small></p>
      </div>
  `
};

new Vue({
  el: '#app',
  components: {
    'main-component': mainComponent
  },
  template: `
      <main-component/>`,
});
