// lang
import en from './lang/EN';
import zh_cn from './lang/ZH-CN';

+function($) {
	"use strict";
	let Lang = localStorage.getItem('Lang');
	let _Lang = {};
	console.log(Lang);
	if (Lang) {
		console.log('读取localStorage');
		_Lang = Lang;
	}else {
		console.log('未读取到localStorage');
		localStorage.setItem('Lang', en);
		_Lang = en;
	}
	$.langConfig = en;
}(jQuery);