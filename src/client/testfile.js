'use strict';
import Vue from 'vue/dist/vue.js';

const mainComponent = {
  data: () => {
    return {
      title: 'Test Title'
    };
  },
  template: `    
    <div></div>
  `
};

new Vue({
  el: '#app',
  components: {
    'main-component': mainComponent
  },
  template: `<main-component />`,
});
