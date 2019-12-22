'use strict';
import Vue from 'vue/dist/vue.min.js';

const Promise = TrelloPowerUp.Promise;
const t = TrelloPowerUp.iframe();

const mainComponent = {
  data() {
    return {
      taskId: null
    };
  },

  created() {
    console.log(t.arg('arg'));

    console.log('attachment component created');
    t.card('attachments')
      .get('attachments')
      .filter((attachment) => {
        return attachment.url.indexOf('task/view/') !== -1;
      })
      .then(function (yellowstoneAttachments) {
        const urls = yellowstoneAttachments.map(function (a) {
          return a.url;
        });
        document.getElementById('urls').textContent = urls.join(', ');
      })
      .then(() => {
        return t.sizeTo('#content');
      });

    t.get('card', 'shared', 'taskId')
      .then(val => this.taskId = val)
      .then(() => t.sizeTo('#content'));
  },

  template: `
      <div id="content">
          <p>Task <b>{{taskId}}</b> data will be rendered here</p>
          <p>Urls: <span id="urls"></span></p>
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
