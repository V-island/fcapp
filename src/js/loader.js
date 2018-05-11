import { addScript } from './core';
import config from './config';
import htmlImport from './html-import';
import Router from './router';

export default {
	beforeJs: function(jslist) {
		var importJs = jslist;
		if (typeof(importJs) != 'undefined' && importJs != '' && importJs.length > 0) {
			for (var i = 0; i < importJs.length; i++) {
				addScript(importJs[i]);
			}
		}
	},
	init: function() {
		// this.beforeJs(config.importJs);
		// htmlImport.getFile(config.importFile);
		// htmlImport.getFile(config.pagesFile);

		// if (location.href.indexOf('/uc/') > -1) {
		// 	htmlImport.getFile(config.ucFile);
		// }
		// let url = location.hash;
		// console.log(url);
		// console.log(config.router);
		// let data = _.findLastKey(config.router, {
		// 	'path': url
		// });
		
	}
}