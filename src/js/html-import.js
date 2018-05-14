import Webcomponents from 'webcomponents-lite';

const MSG = {
	support: '支持导入!',
	nosupport: '不支持导入|-_-)',
	errorsupport: '导入错误：',
	savedone: '本地保存完成',
	alreadysave: '本地已存在',
	cantfindobj: 'obj对象没找到！',
	importready: '所有导入已经加载完成！',
	allready: '导入加载已经完成，元素已经注册！',
	masthasname: '必须指定名称',
	maststring: '必须是字符串',
	updatesuccess: '更新成功！'
}

const RULE = {
	path: '/test',
	name: 'test',
	template: '../pages/test.html',
	component: false,
	dom: 'body'
}

class htmlImport {

	constructor(rule) {
		this.rule = typeof(rule) == 'undefined' ? RULE : rule;
		this.name = rule.name;
		this.template = rule.template;
		this.component = rule.component;
		this.dom = typeof(rule.dom) == 'undefined' ? 'body' : rule.dom;
		this.mode = typeof(rule.mode) == 'undefined' ? 'add' : rule.mode;
		this.tpl = {};

		if (!this.supportsImports()) {
			console.log(MSG.nosupport);
			document.head.appendChild(Webcomponents);
		}
		console.log(MSG.support);
		this.tplImport();
	}
	/**
	 * @param {!Element} root
	 * @return {!MDCTopAppBar}
	 */
	static attachTo(rule) {
		return new htmlImport(rule);
	}

	/**
	 * 模板导入
	 * @return {[type]}       [description]
	 */
	tplImport() {
		let _self = this;
		let link = document.createElement('link');
		link.rel = 'import';
		link.id = _self.name;
		link.href = _self.template;

		link.onload = function(e) {
			console.log('Loaded import: ' + e.target.href);
			let _target = e.target.import;
			// console.log(_target.children);
			let bodyHTML = typeof(_target.body) == 'undefined' ? _target.innerHTML : _target.body.innerHTML;

			if (typeof(_target.head) != 'undefined' && _target.head != '' && bodyHTML == '') {
				bodyHTML = _target.head.innerHTML;
			} else if (typeof(_target.head) != 'undefined' && _target.head != '' && bodyHTML != '') {
				bodyHTML = _target.head.innerHTML + bodyHTML;
			}

			//MAC safari bug
			if (bodyHTML == '') {
				for (let i = 0; i < _target.children.length; i++) {
					bodyHTML = bodyHTML + _target.children[i].outerHTML;
				}
			}



			// console.log(bodyHTML);

			bodyHTML = _self.replaceNote(bodyHTML);

			_self.tpl[_self.name] = bodyHTML;

			// var oldHTML = localStorage.getItem(_self.name);
			// console.log(oldHTML);

			// if (oldHTML != bodyHTML) {
			// 	localStorage.removeItem(_self.name);
			// 	localStorage.setItem(_self.name, bodyHTML);
			// 	console.log(_self.name + ' ' + _self.msg.savedone);

			// } else {
			// 	console.log(_self.name + ' ' + _self.msg.alreadysave);
			// }

			// console.info(_self.dom);
			if (typeof(_self.dom) != 'undefined') {
				_self.setdom();
			}
			// console.log(localStorage);
			//加载完成后清除头部引用
			if (!link.readyState || 'link' === link.readyState || 'complete' === link.readyState) {
				link.onload = link.onreadystatechange = null;
				link.parentNode.removeChild(link);
			}

		};
		link.onerror = function(e) {
			console.error(_self.msg.errorsupport + e.target.href);
			return;
		};
		document.head.appendChild(link);

	}

	/**
	 * 写入DOM
	 * @return {[type]}       [description]
	 */
	setdom() {
		// var _wrapper = param.dom == '' || param.dom == 'body' ? 'body' : 'body ' + param.dom;
		let _wrapper = this.dom;
		// var _dom = localStorage.getItem(param.name);
		if (!(this.name in this.tpl)) {
			console.log(this.name + '不在htmlImport.tpl中');
			return;
		}
		let _dom = this.tpl[this.name];
		console.log(_dom);
		let _target = document.querySelector(_wrapper);
		// console.log(_dom);
		if (_target) {

			switch (this.mode) {
				case 'replace':
					_target.innerHTML = _dom;
					break;
				case 'add':
					_target.innerHTML += _dom;
					break;
				case 'before':
					_target.innerHTML = _dom + _target.innerHTML;
					break;
				default:
					_target.innerHTML += _dom;
			}

			console.info(this.name + ' 读取成功，写入到 ' + _wrapper);
			// console.log(_target.innerHTML);
		} else {
			console.warn(_wrapper + ' 没找到！' + this.name + ' 写入不成功');
			return false;
		}

	}

	/**
	 * 验证浏览器是否支持html import导入
	 * @return {boolean}
	 */
	supportsImports() {
		return 'import' in document.createElement('link');
	}

	/**
	 * 去注释以及style script 换行符 标签空格
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	replaceNote(str) {
		return str.replace(/(\n)/g, '')
			.replace(/(\t)/g, '')
			.replace(/(\r)/g, '')
			.replace(/<!--[\s\S]*?--\>/g, '')
			.replace(/<style[^>]*>[\s\S]*?<\/[^>]*style>/gi, '')
			//.replace(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi,'')
			.replace(/>\s*/g, '>')
			.replace(/\s*</g, '<');
	}

	/**
	 * 导入script
	 * @param {[type]}   url     [description]
	 * @param {Function} fn      [description]
	 * @param {[type]}   charset [description]
	 */
	addScript(url, fn, charset) {
		let _self = this;
		let doc = document;
		let script = doc.createElement('script');

		script.language = 'javascript';
		script.charset = charset ? charset : 'utf-8';
		script.type = 'text/javascript';
		script.src = url;
		script.onload = script.onreadystatechange = function() {
			if (!script.readyState || 'loaded' === script.readyState || 'complete' === script.readyState) {
				fn && fn();
				script.onload = script.onreadystatechange = null;
				script.parentNode.removeChild(script);
			}
		};
		script.onerror = function(e) {
			console.error('Load Error' + url);
		};
		doc.head.appendChild(script);
	}
}

export default htmlImport;