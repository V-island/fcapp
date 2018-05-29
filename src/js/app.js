// import Webcomponents from 'webcomponents-lite';
import '../sass/fc.scss';
import htmlImport from './html-import';
import Router from './router';

// components
import modal from './components/modal';

import config from './config';

window.HTMLImport = htmlImport;
window.Modal = modal;

window.PUBLICFILE = config.publicFile;
window.PAGESFILE = config.pagesFile;
// import {MDCTopAppBar} from '@material/top-app-bar/index';

// Instantiation
// const topAppBarElement = document.querySelector('.mdc-top-app-bar');
// const topAppBar = new MDCTopAppBar(topAppBarElement);


// loader.init();
const router = new Router({
	routes: [{
		path: '/login',
		name: 'login',
		template: PAGESFILE.login
	}, {
		path: '/sign',
		name: 'sign'
	}, {
		path: '/home',
		name: 'home',
		template: PAGESFILE.home
	}, {
		path: '/live',
		name: 'live',
		template: PAGESFILE.live
	}, {
		path: '/favorite',
		name: 'favorite'
	}, {
		path: '/message',
		name: 'message'
	}, {
		path: '/user',
		name: 'user',
		template: PAGESFILE.user,
		children: [{
			path: '/detail',
			name: 'detail',
			template: PAGESFILE.user_detail
		}]
	}]
});