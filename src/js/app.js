// import Webcomponents from 'webcomponents-lite';
import FCSTYLE from '../sass/fc.scss';
import Router from './router';

import config from './config';

// const PUBLICFILE = config.publicFile;
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
		name: 'user'
	}]
})