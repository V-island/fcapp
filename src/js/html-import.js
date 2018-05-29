import Webcomponents from 'webcomponents-lite';
import ripple from 'jquery-ripple';

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
		this.tpl = {};

		if (!this.supportsImports()) {
			console.log(MSG.nosupport);
			document.head.appendChild(Webcomponents);
		}
		console.log(MSG.support);
		this.getFile(rule);
	}
	/**
	 * @param {!Element} root
	 * @return {!MDCTopAppBar}
	 */
	static attachTo(rule) {
		return new htmlImport(rule);
	}

	getFile(rule) {

		let _self = this;
		let _file = typeof(rule) == 'undefined' ? RULE : rule;
		console.log(_file);

		// if (_file.length > 0) {
		// 	_file.forEach(function(param) {
		// 		console.log(param);
		// 		_self.tplImport(param);
		// 	});
		// }
		_self.tplImport(_file);
	}

	/**
	 * 模板导入
	 * @return {[type]}       [description]
	 */
	tplImport(param) {
		let _self = this;
		let link = document.createElement('link');
		link.rel = 'import';
		link.id = param.name;
		link.href = param.path;

		link.onload = function(e) {
			console.log('Loaded import: ' + e.target.href);
			let _target = e.target.import;
			// console.log(_target.children);
			let bodyHTML = typeof(_target.body) == 'undefined' ? _target.innerHTML : _target.body.innerHTML;

			if (typeof(_target.head) != 'undefined' && _target.head != '' && bodyHTML == '') {
				for (let i = 0; i < _target.head.children.length; i++) {
					_self.setTpl(_target.head.children[i].id, _target.head.children[i].innerHTML);
				}
			} else if (typeof(_target.head) != 'undefined' && _target.head != '' && bodyHTML != '') {
				bodyHTML = _target.head.innerHTML + bodyHTML;
			}

			//MAC safari bug
			if (bodyHTML == '') {
				for (let i = 0; i < _target.children.length; i++) {
					bodyHTML = bodyHTML + _target.children[i].outerHTML;
				}
			}

			_self.setTpl(param.name, bodyHTML);

			if (typeof(param.dom) != 'undefined' && param.init) {
				console.log('进入加载dom ' + param.name);
				_self.setdom(param);
			}

			if (typeof(param.component) != 'undefined') {
				param.component.init();
			}
			//加载完成后清除头部引用
			if (!link.readyState || 'link' === link.readyState || 'complete' === link.readyState) {
				link.onload = link.onreadystatechange = null;
				link.parentNode.removeChild(link);
			}

			$('[data-ripple]').ripple();

		};
		link.onerror = function(e) {
			console.error(MSG.errorsupport + e.target.href);
			return;
		};
		document.head.appendChild(link);

	}

	/**
	 * 写入模板
	 * @param {[type]} name [description]
	 * @param {[type]} html [description]
	 */
	setTpl(name, html) {
		let _self = this;
		let bodyHTML = _self.replaceNote(html);
		_self.tpl[name] = bodyHTML;

		// var oldHTML = localStorage.getItem(param.name);
		// console.log(oldHTML);

		// if (oldHTML != bodyHTML) {
		// 	localStorage.removeItem(param.name);
		// 	localStorage.setItem(param.name, bodyHTML);
		// 	console.log(param.name + ' ' + MSG.savedone);

		// } else {
		// 	console.log(param.name + ' ' + MSG.alreadysave);
		// }

		// console.log(_self.tpl);
		// console.log(localStorage);
		return;
	}

	/**
	 * 写入DOM
	 * @return {[type]}       [description]
	 */
	setdom(param) {
		let _wrapper = typeof(param.dom) == 'undefined' || param.dom == 'body' ? 'body' : param.dom;
		// var _dom = localStorage.getItem(param.name);
		if (!(param.name in this.tpl)) {
			console.log(param.name + '不在htmlImport.tpl中');
			return;
		}
		let _dom = this.tpl[param.name];
		// console.log(_dom);
		let _target = document.querySelector(_wrapper);
		let _mode = typeof(param.mode) == 'undefined' ? 'add' : param.mode;

		if (_target) {

			switch (_mode) {
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

			console.info(param.name + ' 读取成功，写入到 ' + _wrapper);

			// param.component.init();
			// console.log(_target.innerHTML);
		} else {
			console.warn(_wrapper + ' 没找到！' + param.name + ' 写入不成功');
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