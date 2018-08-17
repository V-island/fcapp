import EventEmitter from './eventEmitter';

import {
    extend
} from './util';

export default class Progress extends EventEmitter {
    constructor(element, options) {
        super();

        this.options = {
            width: 100,
            height: 100,
            background: 'transparent',
            itemBackground: '#FFDD33',
            color: '#fff',
            lineWidth: 3,
            fontSize: '0.5rem',
            textAlign: 'center',
            direction: false,
            showFont: false,
            speed: 0,
            maxspeed: 100
        };

        extend(this.options, options);

        this.canvasEl = document.createElement('canvas');
        element.append(this.canvasEl);
    }

    show(_speed) {
    	let self = this;
    	_speed = _speed !== undefined ? (_speed / self.options.maxspeed * 100) : self.options.speed;

    	self.rad = Math.PI*2/100;
    	self.canvasEl.setAttribute('width', this.options.width+'px');
    	self.canvasEl.setAttribute('height', this.options.height+'px');
    	self.centerX = self.options.width / 2;
    	self.centerY = self.options.height / 2;
    	self.context = self.canvasEl.getContext('2d');
    	// 背景圈
		self.context.beginPath();//路径开始
		self.context.strokeStyle = self.options.background;
		self.context.arc(self.centerX, self.centerY, self.centerX - self.options.lineWidth, 0, Math.PI*2, self.options.direction);//用于绘制圆弧context.arc(x坐标，y坐标，半径，起始角度，终止角度，顺时针/逆时针)
		self.context.stroke();//绘制

		if (self.options.showFont) {
			self.context.textAlign = self.options.textAlign;
			self.context.font = self.options.fontSize;
			self.context.fillStyle = self.options.color;
			self.context.strokeText(_speed, self.centerX, self.centerY + 4);
		}

		// 进度条
		self.context.beginPath(); //路径开始
		self.context.arc(self.centerX, self.centerY, self.centerX - self.options.lineWidth, -Math.PI/2, -Math.PI/2 + _speed*self.rad, self.options.direction);
		self.context.strokeStyle = self.options.itemBackground; //设置描边样式
		self.context.lineWidth = self.options.lineWidth; //设置线宽
		self.context.stroke(); //绘制
    }
}