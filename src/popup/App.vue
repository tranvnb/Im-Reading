<template>
  <div class="pop-up-page">
    <ul>
      <li @click="saveTabs">Save</li>
      <li @click="restoreTabs">Restore {{newTabs.length > 0 ? newTabs.length : ''}}</li>
      <li @click="clearSavedTabs">Clear All</li>
    </ul>
  </div>
</template>

<script>
import console from "../utils/console_log";
import { DEFAULT_KEY } from "../_consts";
export default {
  name: "pop-up-page",
  props: {},
  data() {
    return {
      newTabs: [],
      openingTabs: []
    };
  },
  computed: {},
  methods: {
    saveTabs: function() {
      const keyArr = [];

      this.openingTabs.forEach(e => {
        const randomId = Math.floor(Math.random() * 1000000000) + 1 + "";
        chrome.storage.sync.set({ [randomId]: e });
      });
      this.newTabs = [];
      console.log("Save tabs is click");
    },
    restoreTabs: function() {
      let numTab = this.openingTabs.length;
      this.newTabs.forEach(tab => {
        chrome.tabs.create({url: tab.url, index: numTab}, newTab => {
          console.log('new tab: ', tab.title);
        });
      });
      console.log("Restore tabs is click");
    },
    clearSavedTabs: function() {
      chrome.storage.sync.clear(() => {
        this.newTabs = [];
        console.log("Cleared all saved data from sync storage");
      });
    },
    calculateDifferentTabs: function(arrA, arrB) {}
  },
  mounted() {
    chrome.tabs.query({}, allOpeningTabs => {
      this.openingTabs = allOpeningTabs.map(tab => {
        return {
          title: tab.title || "untitled",
          url: tab.url,
          window: tab.windowId,
          isCognito: tab.incognito
        };
      });
      //get all stored tabs
      chrome.storage.sync.get(null, storedTabs => {
        console.log("this is stored tab Object: ", storedTabs);
        //filter
        const tabs = Object.values(storedTabs);
        this.newTabs = tabs.filter(s => {
          return !this.openingTabs.some(o => o.url === s.url);
        });
      });
    });
  },
  beforeMount() {    
  }
};
</script>

<style lang="scss" scoped>
.pop-up-page {
  ul > li {
    cursor: pointer;
  }
}
</style>
