// gages
import Login from './pages/login';
import Home from './pages/home';
import Live from './pages/live';

import User from './pages/user';
import UserDetail from './pages/user_detail';

let config = {
	// apihost: 'http://192.168.8.240:8090',
	// wshost: 'ws://192.168.8.240:8090',
	// apiip: 'http://120.76.84.82:8080/api/',
	// apitest: 'http://www.easy-mock.com/mock/59c4c72ee0dc663341b4ca37/v1/',
	// pagesRoot: '../pages/',
	publicFile: {
		actions_lives: {
			name: 'actions_lives',
			path: '../src/public/actions_lives.html'
		}
	},
	pagesFile: {
		login: {
			name: 'login',
			path: '../pages/login.html',
			component: Login,
			dom: 'body',
			init: 1
		},
		home: {
			name: 'home',
			path: '../pages/home.html',
			component: Home,
			dom: 'body',
			init: 1
		},
		live: {
			name: 'live',
			path: '../pages/live.html',
			component: Live,
			mode: 'replace',
			dom: 'body',
			init: 1
		},
		user: {
			name: 'user',
			path: '../pages/user.html',
			component: User,
			mode: 'replace',
			dom: 'body',
			init: 1
		},
		user_detail: {
			name: 'user_detail',
			path: '../pages/user_detail.html',
			component: UserDetail,
			mode: 'replace',
			dom: 'body',
			init: 1
		}
	}
}

export default config;