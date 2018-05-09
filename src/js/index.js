import _ from 'lodash';
// import Render from '../pulic/index.art';

// const data = {
// 	title: 'My Page2222'
// };
// const html = Render(data);
// console.log(html);

// if (typeof document === 'object') {
// 	document.body.innerHTML = html;
// }

// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', () => {
// 		navigator.serviceWorker.register('/sw.js').then(registration => {
// 			console.log('SW registered: ', registration);
// 		}).catch(registrationError => {
// 			console.log('SW registration failed: ', registrationError);
// 		});
// 	});
// }

import {
	MDCTopAppBar
} from '@material/top-app-bar/index';

// Instantiation
const topAppBarElement = document.querySelector('.mdc-top-app-bar');
const topAppBar = new MDCTopAppBar(topAppBarElement);

function component() {
	var element = document.createElement('div');

	// lodash 是由当前 script 脚本 import 导入进来的
	element.innerHTML = _.join(['Hello', 'webpack'], ' ');
	element.classList.add('hello');

	return element;
}

document.body.appendChild(component());