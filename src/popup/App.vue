<template>
	<div class="pop-up-page">
		<b-list-group size="xs">
			<b-list-group-item @click="saveTabs" button>Save</b-list-group-item>
			<b-list-group-item :disabled="newTabs.length == 0" @click="restoreTabs" button>
				Restore
				<b-badge variant="primary" v-if="newTabs.length > 0">{{newTabs.length}}</b-badge>
			</b-list-group-item>
			<b-list-group-item @click="clearSavedTabs" button>Clear all</b-list-group-item>
		</b-list-group>
	</div>
</template>

<script>
import console from '../utils/console_log';
import { DEFAULT_KEY, CHROME_NEW_TAB } from '../_consts';
export default {
	name: 'pop-up-page',
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
			chrome.storage.sync.clear(() => {
				this.openingTabs.forEach(e => {
					const randomId = Math.floor(Math.random() * 1000000000) + 1 + '';
					chrome.storage.sync.set({ [randomId]: e });
				});
			});
			this.newTabs = [];
			console.log('Save tabs is click');
		},
		restoreTabs: function() {
			let numTab = this.openingTabs.length;
			this.newTabs.forEach(tab => {
				chrome.tabs.create({ url: tab.url, index: numTab }, newTab => {
					console.log('new tab: ', newTabs.title);
				});
			});
			this.newTabs = [];
			console.log('Restore tabs is click');
		},
		clearSavedTabs: function() {
			chrome.storage.sync.clear(() => {
				this.newTabs = [];
				console.log('Cleared all saved data from sync storage');
			});
		},
		calculateDifferentTabs: function(arrA, arrB) {}
	},
	mounted() {
		chrome.tabs.query({}, allOpeningTabs => {
			console.log(allOpeningTabs);
			this.openingTabs = allOpeningTabs
				.filter(tab => {
					return tab.url !== CHROME_NEW_TAB;
				})
				.map(tab => {
					return {
						title: tab.title || 'untitled',
						url: tab.url,
						window: tab.windowId,
						isCognito: tab.incognito
					};
				});
			//get all stored tabs
			chrome.storage.sync.get(null, storedTabs => {
				console.log('this is stored tab Object: ', storedTabs);
				//filter
				const tabs = Object.values(storedTabs);
				this.newTabs = tabs.filter(s => {
					return !this.openingTabs.some(o => o.url === s.url);
				});
			});
		});
	},
	beforeMount() {
		console.log('beforeMount');
	}
};
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
body {
	margin: 0px;
	width: 110px;
	font-size: 0.75em;
}
.pop-up-page {
	ul > li {
		cursor: pointer;
	}
}
</style>
