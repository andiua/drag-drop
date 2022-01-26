'use strict';

class DragDrop {
	constructor({
		dragElement,
		dropElement,
		dropEveryWhere = false,
		dropFewInOne = false,
		dropIntoCenter = false,
		enableDropped = false,
		transition = 'transform 0.4s ease-in-out',
		afterDroped
	}) {
		if (!dragElement) {
			console.warn('drag&drop: Need 1 propertie "dragElement"');
			return;
		} else {
			this.dragElement = document.querySelectorAll(dragElement);
		}
		dropElement ? (this.dropElement = document.querySelectorAll(dropElement)) : null;
		this.options = {
			dropEveryWhere,
			dropFewInOne,
			dropIntoCenter,
			transition,
			enableDropped,
		};
		this.afterDroped = afterDroped;
		this.transitionTime = () => {
			const getTime = transition.match(/(\d+.\d+s |.\d+s | \d+s | \d+ms)/g)[0];
			if(getTime.includes('ms')) {
				if(getTime.slice(1, -2) < 100) {
					console.warn('drag&drop: Check transition-time. The smallest time is 100ms');
					return 100;
				}
				return getTime.slice(1, -2);
			} else {
				if(getTime.slice(0, -2)*1000 < 100) {
					console.warn('drag&drop: Check transition-time. The smallest time is 0.1s');
					return 100;
				}
				return getTime.slice(0, -2)*1000;
			}
		}
		
		this.eventCoordinates = {};
		this.eventStartCoordinates = [];
		this.dragCoordinates = {};
		this.dropCoordinates = [];
		this.boundDragDown = [];
		this.boundDragMove;
		this.boundDragUp;
	}
	init() {
		this.dragElement.forEach((drag, i) => {
			this.boundDragDown[i] = this.dragDown.bind(this, drag);
			drag.addEventListener('pointerdown', this.boundDragDown[i]);
		});
	}

	addDropCoordinates() {
		this.dropCoordinates = [];
		this.dropElement.forEach(drop => {
			const bounding = drop.getBoundingClientRect();
			const coordinates = {
				top: bounding.top,
				left: bounding.left,
				bottom: bounding.bottom,
				right: bounding.right,
				width: bounding.width,
				height: bounding.height,
			};
			this.dropCoordinates.push(coordinates);
		});
	}
	dropItem(drag, drop, e) {
		const bounding = drag.getBoundingClientRect();
		const transformValues = drag.style.transform.match(/(-\d+\.\d+|\d+\.\d+|-\d+|\d+)/g);
		let translateX, translateY;
		if (this.options.dropIntoCenter) {
			let centerX = (bounding.width - drop.width) / 2;
			let centerY = (bounding.height - drop.height) / 2;
			translateX = drop.left - centerX - bounding.left + Number(transformValues[0]);
			translateY = drop.top - centerY - bounding.top + Number(transformValues[1]);
			drag.style.cssText = `
					transition: ${this.options.transition};
					transform: translate(${translateX}px, ${translateY}px)`;
			setTimeout(() => {
				drag.style.transition = '';
			}, this.transitionTime());
		}
		if(!this.options.enableDropped) {
			this.dragElement.forEach((item, i) => {
				if (item === drag) {
					drag.removeEventListener('pointerdown', this.boundDragDown[i]);
					drag.style.cursor = 'auto';
				}
			});
		}
		if(this.afterDroped) {
			this.afterDroped();
		}
		drag.classList.add('dropped');
		drag.classList.remove('droppable');
	}
	checkCoincidence(drag, e) {
		const bounding = drag.getBoundingClientRect();
		const boolean = this.dropCoordinates.some((item, i) => {
			// під позицію миші
			// if(item.top <= e.clientY && item.left <= e.clientX
			// 	&& item.bottom >= e.clientY && item.right >= e.clientX ) {
			// під розмір об'єкта
			if (item.top <= bounding.top + bounding.height / 2 &&
				item.left <= bounding.left + bounding.width / 2 &&
				item.bottom >= bounding.bottom - bounding.height / 2 &&
				item.right >= bounding.right - bounding.width / 2) {
					drag.classList.add('droppable');
					this.dropElement[i].classList.add('droppable__hover');
					if(e.type !== 'pointermove') {
						this.dropItem(drag, item, e);
					}
					return true;
			}
			drag.classList.remove('droppable');
			this.dropElement[i].classList.remove('droppable__hover');
			return false;
		});
		return boolean;
	}
	addBasicCoordinates(e, drag) {
		const bounding = drag.getBoundingClientRect();
		this.dragCoordinates = {
			top: bounding.top,
			left: bounding.left,
			bottom: bounding.bottom,
			right: bounding.right,
		};
		this.dragElement.forEach((item, i) => {
			const itemDrag = item === drag;
			if ((!this.eventStartCoordinates[i] && itemDrag)
			|| (!this.options.dropEveryWhere && itemDrag && !drag.classList.contains('dropped')) ){
				console.log('object1');
				this.eventStartCoordinates[i] = {
					left: e.clientX,
					top: e.clientY,
				};
			} else if((this.eventStartCoordinates[i] && drag.style.transform)
			|| this.options.enableDropped && itemDrag && drag.classList.contains('dropped')) {
				const transformValues = drag.style.transform.match(/(-\d+\.\d+|\d+\.\d+|-\d+|\d+)/g);
				console.log('object2');
				this.eventStartCoordinates[i] = {
					left: e.clientX - Number(transformValues[0]),
					top: e.clientY - Number(transformValues[1])
				};
			}
			drag.classList.remove('dropped');
		});
	}
	changeDragCoordinates(e, drag) {
		this.eventCoordinates = {
			left: e.clientX,
			top: e.clientY,
		};
		this.dragElement.forEach((item, i) => {
			if (item === drag) {
				let translateX = this.eventCoordinates.left - this.eventStartCoordinates[i].left;
				let translateY = this.eventCoordinates.top - this.eventStartCoordinates[i].top;
				// console.log(`${translateX}px, ${translateY}px`);
				drag.style.cssText = `
					transform: translate(${translateX}px, ${translateY}px);
					position: relative;
					z-index: 9999;
					`;
			}
		});
	}
	addFinishCoordinates(drag, e) {
		if (!this.checkCoincidence(drag, e) && !this.options.dropEveryWhere) {
			drag.style.transition = this.options.transition;
			drag.style.transform = '';
			setTimeout(() => {
				drag.style.transition = '';
			}, this.transitionTime());
		}
		drag.style.position = '';
		drag.style.zIndex = '';
	}
	// events
	dragDown(drag, e) {
		console.log('dragDown');
		this.boundDragMove = this.dragMove.bind(this, drag);
		this.boundDragUp = this.dragUp.bind(this, drag);
		document.body.addEventListener('pointermove', this.boundDragMove);
		document.body.addEventListener('pointerup', this.boundDragUp);
		if (this.dropElement) {
			this.addDropCoordinates();
		}
		this.addBasicCoordinates(e, drag);
		this.changeDragCoordinates(e, drag);
		drag.classList.add('dragging');
		
	}
	dragMove(drag, e) {
		console.log('dragMove');
		e.preventDefault();
		drag.style.cursor = 'grabbing';
		this.changeDragCoordinates(e, drag);
		this.checkCoincidence(drag, e);
	}
	dragUp(drag, e) {
		console.log('dragUp');
		drag.classList.remove('dragging');
		document.body.removeEventListener('pointermove', this.boundDragMove);
		document.body.removeEventListener('pointerup', this.boundDragUp);
		drag.style.cursor = '';
		this.addFinishCoordinates(drag, e);
	}
	// addEvents() {

	// }
}

window.addEventListener('DOMContentLoaded', () => {
	new DragDrop({
		dragElement: '.elemImg:not([data-drag])',
	}).init();
	new DragDrop({
		dragElement: '[data-drag="2"]',
		dropElement: '[data-drop="2"]',
		dropEveryWhere: true,

	}).init();
	new DragDrop({
		dragElement: '[data-drag="1"]',
		dropElement: '[data-drop="1"]',
		dropIntoCenter: true,
		enableDropped: true,
	}).init();
	document.addEventListener('dragend', (e) => {
		e.preventDefault()
	})
	// щоб уникнути проблем з драгстартом, можна переписати плагін
	// під document drag, треба тільки додати індекси для drag елементів
	// в ШТМЛ і маніпулювати eventStartCoordinates[i] з його допомогою
});
