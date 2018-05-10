import { addScript } from './core.js';
import config from './config.js';
import htmlImport from './html-import.js';

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
		console.log(location.hash);
		// htmlImport.getFile(config.importFile);
		// htmlImport.getFile(config.pagesFile);

		// if (location.href.indexOf('/uc/') > -1) {
		// 	htmlImport.getFile(config.ucFile);
		// }
		let url = location.hash;
		console.log(url);
		console.log(config.rules);
		let data = _.takeRightWhile(config.rules, ['path', "#/home"]);
		console.log(data);
	}
}