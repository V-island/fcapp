// import Webcomponents from 'webcomponents-lite';
// import core from './core.js';
// import htmlImport from './html-import.js';
// import config from './config.js';
// import loader from './loader';

import css from '../css/style.scss';
import Router from './router';

import config from './config';

const PUBLICFILE = config.publicFile;
const PAGESFILE = config.pagesFile;
// import {MDCTopAppBar} from '@material/top-app-bar/index';

// Instantiation
// const topAppBarElement = document.querySelector('.mdc-top-app-bar');
// const topAppBar = new MDCTopAppBar(topAppBarElement);


// loader.init();
const router = new Router({
	routes: [{
		path: '/login',
		name: 'login',
		template: [
			PAGESFILE.login
		]
	}, {
		path: '/sign',
		name: 'sign'
	}, {
		path: '/home',
		name: 'home',
		template: [
			PUBLICFILE.top_nav,
			PUBLICFILE.foot_nav,
			PAGESFILE.home
		],
		children: [{
			path: '/new',
			name: 'new'
		}, {
			path: '/hot',
			name: 'hot'
		}, {
			path: '/video',
			name: 'video'
		}]
	}, {
		path: '/friends',
		name: 'friends'
	}, {
		path: '/message',
		name: 'message'
	}, {
		path: '/user',
		name: 'user'
	}]
})