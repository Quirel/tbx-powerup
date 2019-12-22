'use strict';
import Vue from 'vue/dist/vue.min.js';

// const Promise = TrelloPowerUp.Promise;
const t = TrelloPowerUp.iframe();

const statuses = {
  '-3': 'Задача почти просрочена.',
  '-2': 'Новая задача (не просмотрена)',
  '-1': 'Задача просрочена.',
  '1': 'Новая задача. (Не используется)',
  '2': 'Ждет выполнения',
  '3': 'Задача выполняется.',
  '4': 'Условно завершена (ждет контроля постановщиком).',
  '5': 'Задача завершена.',
  '6': 'Задача отложена.',
  '7': 'Задача отклонена ответственным. (Не используется)'
};

const mainComponent = {
  data() {
    return {
      taskId: t.arg('taskId'),
      taskUrl: t.arg('taskUrl'),
      bxLink: t.arg('bxLink'),
      // title: '',
      // status: {id: null, title: null},
      // creator: null,
      // responsible: null,
      task: {
        title: null,
        status: { id: null, title: null },
        creator: null,
        responsible: null,
      },
      isLoading: false,
    };
  },

  created() {
    const url = `${this.bxLink}tasks.task.get?taskId=${this.taskId}`;
    // if completed => get data from card fields
    t.get('card', 'shared', 'task')
      .then((task) => {
        if (task && task.status.id === '5') {
          this.task = task;
          t.render(() => t.sizeTo('#content'));
        } else {
          t.render(() => {
            fetch(url)
              .then(response => response.json())
              .then(data => {
                const taskData = data.result.task;
                this.task.title = taskData.title;
                this.task.creator = taskData.creator.name;
                this.task.responsible = taskData.responsible.name;
                this.task.status = { id: taskData.status, title: statuses[taskData.status] };
              })
              .then(() => t.set('card', 'shared', 'task', this.task))
              .then(() => t.sizeTo('#content'))
              .catch(error => console.error(error));
          });
        }
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
      </div>
  `
};

new Vue({
  el: '#app',
  components: {
    'main-component': mainComponent
  },
  template: `
      <main-component />`,
});
