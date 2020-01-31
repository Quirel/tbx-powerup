'use strict';
import Vue from 'vue/dist/vue.min.js';

const t = TrelloPowerUp.iframe();

const mainComponent = {
  data() {
    return {
      bxLink: '',
      showCost: false
    };
  },

  async created() {
    this.bxLink = await t.get('board', 'private', 'bxLink');
    this.showCost = await t.get('board', 'private', 'showCost');

    t.sizeTo('#content');
  },

  methods: {
    async saveData() {
      await t.set('board', 'private', 'bxLink', this.bxLink);
      await t.set('board', 'private', 'showCost', this.showCost);

      t.closePopup();
    }
  },

  template: `
      <div id="content">
          <label for="bxlink">Bitrix24 webhook</label>
          <input id="bxlink" v-model="bxLink" type="text"
                 placeholder="https://bx.company.ru/rest/123/fgjaslkjqeyourcode/">
          <label for="show-cost">Cost
              <input type="checkbox" v-model="showCost" id="show-cost">
          </label>
          <button id="save" @click="saveData" style="float:right" class="mod-primary">Save</button>
      </div>
  `,
};

new Vue({
  el: '#app',
  components: {
    'main-component': mainComponent
  },
  template: `
      <main-component/>`,
});
