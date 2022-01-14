'use strict';

class DragDrop{
	constructor({
		dragTarget,
		dropTarget,
		dropEveryWhere = false,
		dropFewInOne = false,
		dropIntoCenter = false,
		transition = 'transform .4s ease-in-out'
	}) {
		if(!dragTarget) {
			console.warn('drag&drop: Need 1 propertie "dragTarget"');
			return;
		} else {
			this.dragTarget = document.querySelectorAll(dragTarget);
		}
		dropTarget ? this.dropTarget = document.querySelectorAll(dropTarget) : null;	
		this.options = {
			dropEveryWhere, 
			dropFewInOne,
			dropIntoCenter,
			transition
		}
		this.eventCoordinates = {};
		this.eventStartCoordinates = [];
		this.dragCoordinates = {};
		this.dropCoordinates = [];
		this.boundDragDown = this.dragDown.bind(this);
		this.boundDragMove = this.dragMove.bind(this, dragTarget);
		this.boundDragUp = this.dragUp.bind(this, dragTarget);
	}
	init() {
		this.addEvents();

	} 
	
	addDropCoordinates() {
		this.dropCoordinates = [];
		this.dropTarget.forEach(drop => {
			const bounding = drop.getBoundingClientRect();
			const coordinates = {
				top: bounding.top,
				left: bounding.left,
				bottom: bounding.bottom,
				right: bounding.right,
			}
			this.dropCoordinates.push(coordinates);
		});
		// console.log(this.dropCoordinates);
	}
	checkCoincidence(drag) {
		const bounding = drag.getBoundingClientRect();
		console.log(this.dropCoordinates[0]);
		console.log(this.dropTarget);
		const boolean = this.dropCoordinates.some(item => {
			if(item.top < bounding.top && item.left < bounding.left) {
				console.log('object');
				const transformValues = drag.style.transform.match(/(-\d+|\d+)/g);
				let translateX = item.left - bounding.left + (+transformValues[0]);
				let translateY = item.top - bounding.top + (+transformValues[1]);
				drag.style.cssText = `
				transition: ${this.options.transition};
				transform: translate(${translateX}px, ${translateY}px)`;
				setTimeout(() => {drag.style.transition = ''}, 400);
				return true;
			}
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
		}
		this.dragTarget.forEach((item, i) => {
			if(!this.eventStartCoordinates[i] && item === drag) { // через !this.eventStartCoordinates є бага "смикання"
				this.eventStartCoordinates[i] = {
					top: e.clientY,
					left: e.clientX,
				}
			}
		});
	}
	changeDragCoordinates(e, drag) {
		
		this.eventCoordinates = {
			left: e.clientX,
			top: e.clientY
		}
		this.dragTarget.forEach((item, i) => {
			if(item === drag) {
				let translateX = this.eventCoordinates.left - this.eventStartCoordinates[i].left;
				let translateY = this.eventCoordinates.top - this.eventStartCoordinates[i].top;
				// пробував пофіксити багу з !this.eventStartCoordinates
				// if(drag.style.transform && !drag.classList.contains('dragging')) { 
				// 	const transformValues = drag.style.transform.match(/(-\d+|\d+)/g);
				// 	translateX += +transformValues[0];
				// 	translateY = +transformValues[1];
				// 	console.log(drag.style.transform)
				// }
				drag.style.cssText = 
				`transform: translate(${translateX}px, ${translateY}px);
				position: relative;
				z-index: 9999;`;
			}
		})
	}
	addFinishCoordinates(drag) {
		if(!this.checkCoincidence(drag) && !this.options.dropEveryWhere) {
			drag.style.transition = this.options.transition;
			drag.style.transform = '';
			setTimeout(() => {drag.style.transition = ''}, 400);
		} 
		
		drag.style.position = '';
		drag.style.zIndex = '';
	}
	// events
	dragDown(e) {
		let drag = e.currentTarget;
		document.body.addEventListener('pointermove', this.boundDragMove)
		document.body.addEventListener('pointerup', this.boundDragUp);
		if(this.dropTarget) {
			this.addDropCoordinates();
		}
		this.addBasicCoordinates(e, drag);
		this.changeDragCoordinates(e, drag);
		drag.classList.add('dragging')
	}
	dragMove(dragName, e) {
		e.preventDefault();
		let drag = e.target.closest(dragName);
		drag.style.cursor = 'grabbing';
		this.changeDragCoordinates(e, drag);
	}
	dragUp(dragName, e) {
		let drag = e.target.closest(dragName);
		drag.classList.remove('dragging')
		document.body.removeEventListener('pointermove', this.boundDragMove);
		document.body.removeEventListener('pointerup', this.boundDragUp);
		drag.style.cursor = '';
		this.addFinishCoordinates(drag);

	}
	addEvents() {
		this.dragTarget.forEach(drag => {
			drag.addEventListener('pointerdown', this.boundDragDown);
		})
	}
}


window.addEventListener("DOMContentLoaded", () => {

	new DragDrop({
		dragTarget: '.elemImg:not([data-drag])'
	}).init();
	new DragDrop({
		dragTarget: '[data-drag="2"]',
		dropTarget: '[data-drop="2"]',
		dropIntoCenter: true,
		dropEveryWhere: true
	}).init();
	new DragDrop({
		dragTarget: '[data-drag="1"]',
		dropTarget: '[data-drop="1"]',
		dropIntoCenter: true,
	}).init();

});