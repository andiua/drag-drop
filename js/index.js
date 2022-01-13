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
		this.eventStartCoordinates = {};
		this.dragCoordinates = {};
		this.dropCoordinates = [];
		this.boundDragDown = this.dragDown.bind(this);
		this.boundDragMove = this.dragMove.bind(this);
		this.boundDragUp = this.dragUp.bind(this);
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
	addBasicCoordinates(e, drag) {
		const bounding = drag.getBoundingClientRect();
		this.dragCoordinates = {
			top: bounding.top,
			left: bounding.left,
			bottom: bounding.bottom,
			right: bounding.right,
		}
		this.eventStartCoordinates = {
			left: e.clientX,
			top: e.clientY
		}
		this.addBasicCoordinates = () => {}
	}
	changeDragCoordinates(e, drag) {
		
		this.eventCoordinates = {
			left: e.clientX,
			top: e.clientY
		}
		let translateX = this.eventCoordinates.left - this.eventStartCoordinates.left;
		let translateY = this.eventCoordinates.top - this.eventStartCoordinates.top;
		drag.style.transform = `translate(${translateX}px, ${translateY}px)`;
	}
	addFinishCoordinates(drag) {
		if(!this.options.dropEveryWhere) {
			drag.style.transition = this.options.transition;
			drag.style.transform = ''
			setTimeout(() => {drag.style.transition = ''}, 400);
		}

	}
	// events
	dragDown(e) {
		let drag = e.currentTarget;
		drag.addEventListener('pointermove', this.boundDragMove)
		drag.addEventListener('pointerup', this.boundDragUp);
		if(this.dropTarget) {
			this.addDropCoordinates();
		}
		this.addBasicCoordinates(e, drag);
		this.changeDragCoordinates(e, drag);
	}
	dragMove(e) {
		e.preventDefault();
		let drag = e.currentTarget;
		drag.style.cursor = 'grabbing';
		this.changeDragCoordinates(e, drag);
	}
	dragUp(e) {
		let drag = e.currentTarget;
		drag.style.cursor = '';
		drag.removeEventListener('pointermove', this.boundDragMove);
		drag.removeEventListener('pointerup', this.boundDragUp);
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
		dropIntoCenter: true
	}).init();

});