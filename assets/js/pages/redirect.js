import hello from 'hellojs/dist/hello.all.js';
import {
	twitterConfig
} from '../intro';

window.twttr = (function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0],
		t = window.twttr || {};
	if (d.getElementById(id)) return t;
	js = d.createElement(s);
	js.id = id;
	js.src = "https://platform.twitter.com/widgets.js";
	fjs.parentNode.insertBefore(js, fjs);

	t._e = [];
	t.ready = function(f) {
		t._e.push(f);
	};
	return t;
}(document, "script", "twitter-wjs"));

var log = console.log;
hello.init({
	'twitter': twitterConfig.twitterAPIKey
}, {
	oauth_proxy: 'https://auth-server.herokuapp.com/proxy' //这里使用默认的代理
});

function login_twitter(network) { //登录方法，并将twitter 作为参数传入
	// Twitter instance
	var twitter = hello(network);
	// Login
	twitter.login().then(function(r) {
		console.log(r);
		// Get Profile
		return twitter.api('/me');
	}, log).then(function(p) {
		console.log("Connected to " + network + " as " + p.name);
		var res = JSON.stringify(p); //因为得不到token，但是这步已经得到用户所有信息，所以将用户信息转成JSON字符串给后台
		alert(JSON.stringify(res));
		console.log(res);
		// self.location= '/home/login.twLogin.do?result='+res;
	}, log);
}