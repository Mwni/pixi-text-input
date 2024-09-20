import { Application } from 'pixi.js'
import TextInput from '../text-input.js'

let app
let input
let t = 0

async function init(){
	app = new Application()

	await app.init({ 
		width: 1000,
		height: 600,
		antialias: true,
		backgroundColor: 0xffffff,
		resolution: window.devicePixelRatio || 1
	})

	document.getElementById('canvas-placeholder').appendChild(app.canvas)

	input = new TextInput({
		input: {
			fontFamily: 'Arial',
			fontSize: '36px',
			padding: '12px',
			width: '500px',
			color: '#26272E'
		},
		box: {
			default: {fill: 0xE8E9F3, rounded: 12, stroke: {color: 0xCBCEE0, width: 3}},
			focused: {fill: 0xE1E3EE, rounded: 12, stroke: {color: 0xABAFC6, width: 3}},
			disabled: {fill: 0xDBDBDB, rounded: 12}
		}
	})

	input.placeholder = 'Enter your Text...'
	input.x = 500
	input.y = 300
	input.pivot.x = input.width/2
	input.pivot.y = input.height/2
	app.stage.addChild(input)

	setupDemoControls()
}

// DEMO CONTROLS

function setAnimation(on){
	if(on){
		app.ticker.add(animateLoop)
	}else{
		app.ticker.remove(animateLoop)
		t = 0
		animateLoop()
	}
}

function animateLoop(){
	input.rotation = t/50
	input.scale.x = 1+Math.sin(t/25)*0.3
	input.scale.y = 1+Math.sin(t/32)*0.2
	t++
}

function setupDemoControls(){
	document.getElementById('font').onchange = function(){
		input.setInputStyle('fontFamily',this.value)
	}
	document.getElementById('size').onchange = function(){
		input.setInputStyle('fontSize',this.value+'px')
	}
	document.getElementById('bold').onchange = function(){
		input.setInputStyle('fontWeight',this.checked ? 'bold' : 'normal')
	}
	document.getElementById('padding').onchange = function(){
		input.setInputStyle('padding',this.value+'px')
	}
	document.getElementById('disable').onclick = function(){
		this._toggle = !this._toggle
		input.disabled = this._toggle
		this.value = this._toggle ? 'Enable' : 'Disable'
	}
	document.getElementById('select').onclick = function(){
		input.select()
	}
	document.getElementById('animate').onclick = function(){
		this._toggle = !this._toggle
		setAnimation(this._toggle)
		this.value = this._toggle ? 'Ok, enough' : 'Animate'
	}
}

init()