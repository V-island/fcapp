class Router {

	constructor(options) {
		if (options === void 0) options = {};

		this.options = options;
		this.nav = '.uc-nav';
		this.matcher = this.createRouteMap(options.routes || []);
		this.init();
	}
	/**
	 * @param {!Element} root
	 * @return {!MDCTopAppBar}
	 */
	static attachTo(options) {
		return new Router(options);
	}

	init() {
		this.setLocation();
		this.changePage();
	}

	createTemplate(Href) {
		let rules = this.matcher;
		console.log(rules);
		console.log(Href);
		let i = _.findKey(rules, ['path', Href]);

		if (rules[i]) {
			console.log('router匹配成功');
			HTMLImport.attachTo(rules[i].template);
		}else {
			console.log('404未找到该页面');
		}
	}

	/**
	 * 初始化router图
	 * @param  {[type]} routes [description]
	 * @return {[type]}        [description]
	 */
	createRouteMap(routes, oldPathList) {
		let pathList = oldPathList || [];
		var _this = this;

		routes.forEach(function(route) {
			_this.addRouteRecord(route, pathList, _this);
		});
		return pathList;
	}

	/**
	 * 添加router
	 * @param {[type]} route       [description]
	 * @param {[type]} oldPathList [description]
	 * @param {[type]} _this       [description]
	 * @param {[type]} matchAs     [description]
	 */
	addRouteRecord(route, oldPathList, _this, matchAs) {
		let pathList = oldPathList || [];
		let routes = {
			path: matchAs === undefined ? route.path : matchAs,
			name: route.name,
			template: route.template || true,
		};

		if (route.children) {
			route.children.forEach(function(child) {
				var childMatchAs = route.path ?
					(route.path + child.path) :
					undefined;
				_this.addRouteRecord(child, pathList, _this, childMatchAs);
			});
		}
		pathList.push(routes);
	}

	/**
	 * 初始化
	 * @param {[type]} nav   [description]
	 * @param {[type]} _name [description]
	 */
	setLocation(nav, _name) {
		//重置默认导航
		if (location.hash == '' || location.hash == '#' || location.hash === undefined) {
			console.log('验证登录状态');
			console.log('成功调转首页HOME');
			location.hash = '#/home';
		}else {
			if (_name === undefined || _name == '') {
				console.log('再次验证登录状态');
				let _page = this.getHashpage();
				console.log('验证成功正加载：' + _page + '页面');
				this.createTemplate(_page);
			} else {
				console.log('正加载：' + _name + '页面');
				this.createTemplate(_name);
			}
		}
	}

	/**
	 * 监听页面
	 * @param  {[type]} nav [description]
	 * @return {[type]}     [description]
	 */
	changePage(nav) {
		let _self = this;
		_self.oldchange();
		window.addEventListener("hashchange", function(e) {
			console.log('hashchange');
			let _page = _self.getHashpage();
			_self.changehref(e.oldURL, e.newURL);
			_self.setLocation(nav, _page);
			// if('Modal' in window){
			// 	Modal.close();
			// }
		}, false);
	}

	/**
	 * 监听URL
	 * @return {[type]} [description]
	 */
	oldchange() {
		if ("onhashchange" in window.document.body) {
			return;
		}

		let location = window.location,
			oldURL = location.href,
			oldHash = location.hash;

		// 每隔100ms检测一下location.hash是否发生变化
		setInterval(function() {
			let newURL = location.href,
				newHash = location.hash;

			// 如果hash发生了变化,且绑定了处理函数...
			if (newHash != oldHash && typeof window.onhashchange === "function") {
				// execute the handler
				window.onhashchange({
					type: "hashchange",
					oldURL: oldURL,
					newURL: newURL
				});

				oldURL = newURL;
				oldHash = newHash;
			}
		}, 100);
	}

	/**
	 * 判断href发生改变状态
	 * @param  {[type]} oldURL [description]
	 * @param  {[type]} newURL [description]
	 * @return {[type]}        [description]
	 */
	changehref(oldURL, newURL) {
		let _self = this;
		if (oldURL.indexOf('#') == -1) {
			return;
		}
		let oldPage = this.getHashpage(oldURL);
		// let oldAction = this.getHashaction(oldURL);
		// let oldSearch = this.getHashsearch(oldURL);
		let newPage = this.getHashpage(newURL);
		// let newAction = this.getHashaction(newURL);
		// let newSearch = this.getHashsearch(newURL);
		// console.log(oldAction,newAction);
		if (oldPage != newPage) {
			_self.change = 'changePage';
			return 'changePage';
		}

		// if (oldAction != newAction) {
		// 	_self.change = 'changeAction';
		// 	return 'changeAction';
		// }

		// if (oldSearch != newSearch) {
		// 	_self.change = 'changeSearch';
		// 	return 'changeSearch';
		// }
	}

	/**
	 * 获取页面hash
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	getHashpage(str) {
		let hash = str === undefined ? location.hash : str;
		hash = hash.split('#')[1];

		if (hash.indexOf('?') > -1) {
			hash = hash.split('?')[0];
		}
		return hash;
	}

	/**
	 * 退出按钮
	 * @return {[type]} [description]
	 */
	backCtrl() {
		console.log('进入退出函数');
		let _self = this;
		let _target = $(document.body).find('.bar-flex .back');
		// let _target = document.querySelector('.bar-flex .back');
		// var _name = location.hash.split('#')[1];
		console.log(_target);
		_target.off().on('click', function() {
			history.go(-1);
		});
		// if (_name.indexOf('uc_user_info') > -1) {
		// 	_target.addClass('show');

		// } else {
		// 	_target.removeClass('show');
		// }
	}
}

export default Router;