import styles from '../../scss/bootstrap.scss';
import US from '../../lang/en_US.json';
import saveAs from 'file-saver/dist/FileSaver';
import {
    extend,
    setData,
    getData,
    hasClass,
    addClass,
    removeClass,
    createDivEl,
    addEvent,
    isObject,
    toggleClass
} from '../util';

export default class EditLangPack {
	constructor(options) {
		this.data = {};
	    this.options = {
	    	groupClass: 'form-group',
	    	inputTagName: 'input',
	    	buttonSaveClass: 'btn-save',
	    	buttonEmptyClass: 'btn-empty',
	    	successClass: 'has-success',
	    	errorClass: 'has-error',
	    	dataIndex: 'key'
        };

	    extend(this.options, options);
	    extend(this.data, US);
	    this.template = this._createTemplate(US || {});
	    this.init();
	}

	init() {
		document.body.append(this.template);

		this._bindEvent();
	}

	_bindEvent() {
		this.groupEl = this.template.getElementsByClassName(this.options.groupClass);
		this.buttonEmptyEl = this.template.getElementsByClassName(this.options.buttonEmptyClass)[0];
		this.buttonSaveEl = this.template.getElementsByClassName(this.options.buttonSaveClass)[0];

		addEvent(this.buttonEmptyEl, 'click', () => {
			Array.prototype.slice.call(this.groupEl).forEach(itemEl => {
				let inputEl = itemEl.getElementsByTagName(this.options.inputTagName)[0];
				inputEl.value = '';
			});
        });

		addEvent(this.buttonSaveEl, 'click', () => {
			Array.prototype.slice.call(this.groupEl).forEach(itemEl => {
				let inputEl = itemEl.getElementsByTagName(this.options.inputTagName)[0];
				let indexArray = getData(itemEl, this.options.dataIndex).split('%#');
				let value = inputEl.value;

				if (value == '') {
					addClass(itemEl, this.options.errorClass);
				}else {
					removeClass(itemEl, this.options.errorClass);
				}

				switch(indexArray.length) {
					case 1:
						this.data[indexArray[0]] = value;
						break;
					case 2:
						this.data[indexArray[0]][indexArray[1]] = value;
						break;
					case 3:
						this.data[indexArray[0]][indexArray[1]][indexArray[2]] = value;
						break;
					case 4:
						this.data[indexArray[0]][indexArray[1]][indexArray[2]][indexArray[3]] = value;
						break;
					case 5:
						this.data[indexArray[0]][indexArray[1]][indexArray[2]][indexArray[3]][indexArray[4]] = value;
						break;
					case 6:
						this.data[indexArray[0]][indexArray[1]][indexArray[2]][indexArray[3]][indexArray[4]][indexArray[5]] = value;
						break;
					case 7:
						this.data[indexArray[0]][indexArray[1]][indexArray[2]][indexArray[3]][indexArray[4]][indexArray[5]][indexArray[6]] = value;
						break;
				}
			});

			let errorEl = this.template.getElementsByClassName(this.options.errorClass);

			if (errorEl.length > 0) return false;
			this._saveAsJson();
        });
	}

	_saveAsJson() {
		let blob = new Blob([JSON.stringify(this.data)], {type: ""});
		saveAs(blob, "lang.json");
	}

	/**
	 * 初始化router图
	 * @param  {[type]} routes [description]
	 * @return {[type]}        [description]
	 */
	_createTemplate(routes) {
		const container = createDivEl({className: styles['container']});
		const formBox = createDivEl({element: 'form'});

	    for (let key in routes) {
	    	const headerTitle = createDivEl({element: 'p', className: styles['bg-primary'], content: key});
	    	formBox.appendChild(headerTitle);
	    	this._createMapTemplate(formBox, routes[key], key);
	    }
	    const buttonEmpty = createDivEl({className: [styles['btn'], styles['btn-primary'], this.options.buttonEmptyClass], content: 'Empty'});
	    const buttonSave = createDivEl({className: [styles['btn'], styles['btn-primary'], this.options.buttonSaveClass], content: 'SAVE'});
	    formBox.appendChild(buttonEmpty);
	    formBox.appendChild(buttonSave);
	    container.appendChild(formBox);
	    return container;
	}

	_createMapTemplate(formBox, route, rootKey, chilKey) {
		let routerKey = typeof chilKey === 'undefined' ? rootKey : `${rootKey}%#${chilKey}`;

	    for (let key in route) {
	    	if (isObject(route[key])) {
	    		this._createMapTemplate(formBox, route[key], routerKey, key);
	    	}else {
	    		let _routerKey = `${routerKey}%#${key}`;
	    		formBox.appendChild(this._createItemTemplate(_routerKey, route[key]));
	    	}
	    }
	}

	_createItemTemplate(key, data) {
		const group = createDivEl({className: styles['form-group']});
		const label = createDivEl({element: 'label', content: data});
		const input = createDivEl({element: 'input', className: styles['form-control']});
		group.appendChild(label);
		group.appendChild(input);
		setData(group, this.options.dataIndex, key);
		return group;
	}

	static attachTo(options) {
	    return new EditLangPack(options);
	}
}

EditLangPack.attachTo();