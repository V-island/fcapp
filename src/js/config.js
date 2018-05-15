
import Login from './pages/login';
import Home from './pages/home';

let config = {
	// apihost: 'http://192.168.8.240:8090',
	// wshost: 'ws://192.168.8.240:8090',
	// apiip: 'http://120.76.84.82:8080/api/',
	// apitest: 'http://www.easy-mock.com/mock/59c4c72ee0dc663341b4ca37/v1/',
	// pagesRoot: '../pages/',
	publicFile: {
		top_nav: {
			name: 'top_nav',
			path: '../public/top-nav.html',
			dom: '.header-top',
			mode: 'before'
		},
		foot_nav: {
			name: 'foot_nav',
			path: '../public/foot-nav.html',
			dom: 'body'
		}
	},
	pagesFile: {
		login: {
			name: 'login',
			path: '../pages/login.html',
			component: Login,
			dom: 'body'
		},
		home: {
			name: 'home',
			path: '../pages/home.html',
			component: Home,
			dom: '.wrapper'
		}
	}
}

export default config;