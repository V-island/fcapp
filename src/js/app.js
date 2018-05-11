// import Webcomponents from 'webcomponents-lite';
// import core from './core.js';
// import htmlImport from './html-import.js';
// import config from './config.js';
// import loader from './loader';

import css from '../css/style.scss';
import Router from './router';
import Login from './pages/login';
import Home from './pages/home';

// import { addScript } from './core';
// import config from './config';
// import htmlImport from './html-import';

// import {MDCTopAppBar} from '@material/top-app-bar/index';

// Instantiation
// const topAppBarElement = document.querySelector('.mdc-top-app-bar');
// const topAppBar = new MDCTopAppBar(topAppBarElement);


// loader.init();
const router = new Router({
	routes: [{
		path: '/login',
		name: 'login',
		template: false,
		component: Login,
		children: [{
			path: '/user',
			name: 'user',
			template: false,
			component: Login
		}]
	}, {
		path: '/home',
		name: 'home',
		component: Home,
		children: [{
			path: '/body',
			name: 'body',
			template: false,
			component: Login
		}]
	}]
})