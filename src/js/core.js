export function addScript(url, fn, charset) {
	var _self = this;
	var doc = document;
	var script = doc.createElement('script');
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

export function evil(fn) {
	var _self = this;
	var Fn = Function;
	return new Fn('return ' + fn)();
}

export function getQueryString(str, name) {
	//str 'mid=18621999119&sid=001'
	//name 'mid' || 'sid'
	//return 18621999119 || 001
	var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	var r = str.match(reg);
	if (r != null) {
		return unescape(r[2]);
	}
	return null;
}

export function tohump(str) {
	// str info_tpl
	// return infoTpl
	var hump_str = str.replace(/\_(\w)/g, function(all, varter) {
		return varter.toUpperCase();
	});
	return hump_str;
}

export function trim(str) {
	return str.replace(/(^\s*)|(\s*$)/g, "");
}