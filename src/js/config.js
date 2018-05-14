let config = {
	// apihost: 'http://192.168.8.240:8090',
	// wshost: 'ws://192.168.8.240:8090',
	// apiip: 'http://120.76.84.82:8080/api/',
	// apitest: 'http://www.easy-mock.com/mock/59c4c72ee0dc663341b4ca37/v1/',
	// pagesRoot: '../pages/',
	publicFile: [{
		name: 'top',
		path: '../public/top-nav.html',
		dom: 'body',
		mode: 'replace',
		init: 1
	}],
	pagesFile: [{
		name: 'login',
		path: '../pages/login.html',
		dom: 'body',
		mode: 'replace'
	},{
		name: 'home',
		path: '../pages/home.html',
		dom: '.wrapper',
		mode: 'replace'
	}]
}

export default config;