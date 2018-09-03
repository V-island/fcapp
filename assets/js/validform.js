import EventEmitter from './eventEmitter';
import * as $ from './util';

export default class Validform extends EventEmitter {
	constructor(element, options) {
		super();

		this.options = $.isPlainObject(options) ? options : {};
		this.element = element;
		this._init();
	}

	_init() {
		this._bindEvent();
	}

	_bindEvent() {
		let self = this;

		self.modalEl.addEventListener('touchmove', function(e) {
			e.preventDefault();
		});

		self.confirmEl.addEventListener('click', function() {
			self.hide();

			let changed = false;
			for (let i = 0; i < self.data.length; i++) {
				let index = self.wheels[i].getSelectedIndex();
				self.selectedIndex[i] = index;

				let value = null,
					text = null;
				if (self.data[i].length) {
					value = self.data[i][index].value;
					text = self.data[i][index].text;
				}
				if (self.selectedVal[i] !== value) {
					changed = true;
				}
				self.selectedVal[i] = value;
				self.selectedText[i] = text;
			}

			self.trigger('picker.select', self.selectedVal, self.selectedIndex);

			if (changed) {
				self.trigger('picker.valuechange', self.selectedVal, self.selectedText, self.selectedIndex);
			}
		});

		self.cancelEl.addEventListener('click', function() {
			self.hide();
			self.trigger('picker.cancel');
		});

		self.closeEl.addEventListener('click', function() {
			self.hide();
			self.trigger('picker.cancel');
		});
	}

	/**
	 * @param {!Element} root
	 * @param {{isUnbounded: (boolean|undefined)}=} options
	 * @return {!Validform}
	 */
	static attachTo(root, options) {
		return new Validform(root, options);
	}
}