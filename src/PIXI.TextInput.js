(function (PIXI){

class TextInput extends PIXI.Container{
	constructor(input_style,box_style){
		super()
		this.input_style = Object.assign(
			{
				position: 'absolute',
				background: 'none',
				border: 'none',
				outline: 'none',
				transformOrigin: '0 0'
			},
			input_style
		)
		this.box_generator = typeof box_style === 'function' ? box_style : new DefaultBoxGenerator(box_style)
		this.box_cache = {}
		this.state = 'IDLE'
		this.previous = {}
		this.dom_added = false
		this.createDOMInput()
		this.updateBox()
		this.addListeners()
	}


	// GETTERS & SETTERS

	get placeholder(){
		return this.dom_input.placeholder
	}

	set placeholder(text){
		this.dom_input.placeholder = text
	}

	get disabled(){
		return this._disabled
	}

	set disabled(disabled){
		this._disabled = disabled
		this.dom_input.disabled = disabled
		this.setState(disabled ? 'DISABLED' : 'IDLE')
	}

	get text(){
		return this.dom_input.value
	}

	set text(text){
		this.dom_input.value = text
	}

	focus(){
		this.dom_input.focus()
	}

	setInputStyle(key,value){
		this.input_style[key] = value
		this.dom_input.style[key] = value
		if(this.last_renderer)
			this.update(this.last_renderer)
	}

	destroy(options){
		this.destroyBoxCache()
		super.destroy(options)
	}


	// SETUP

	createDOMInput(){
		this.dom_input = document.createElement('input')
		this.dom_input.type = 'text'
		for(let key in this.input_style){
			this.dom_input.style[key] = this.input_style[key]
		}

		this.dom_input.addEventListener('focus', () => this.setState('ACTIVE'))
		this.dom_input.addEventListener('blur', () => this.setState('IDLE'))
	}

	addListeners(){
		this.on('added',this.onAdded.bind(this))
		this.on('removed',this.onRemoved.bind(this))
	}

	onAdded(){
		document.body.appendChild(this.dom_input)
		this.dom_input.style.display = 'none'
		this.dom_added = true
	}

	onRemoved(){
		console.log('removed')
		document.body.removeChild(this.dom_input)
		this.dom_added = false
	}

	setState(state){
		this.state = state
		this.updateBox()
	}



	// RENDER & UPDATE

	renderWebGL(renderer){
		super.renderWebGL(renderer)
		this.update(renderer)
	}

	renderCanvas(renderer){
		super.renderCanvas(renderer)
		this.update(renderer)
	}

	update(renderer){
		this.resolution = renderer.resolution
		this.last_renderer = renderer
		this.canvas_bounds = this.getCanvasBounds()

		if(!this.needsUpdate()) 
			return

		this.updateDOMInput()
		this.updateBox()
	}

	updateBox(){
		if(this.needsNewBoxCache())
			this.buildBoxCache()

		if(this.state==this.previous.state 
			&& this.box==this.box_cache[this.state])
			return

		if(this.box)
			this.removeChild(this.box)

		this.box = this.box_cache[this.state]
		this.addChild(this.box)
		this.previous.state = this.state
	}

	updateDOMInput(){
		this.dom_input.style.top = this.canvas_bounds.top+'px'
		this.dom_input.style.left = this.canvas_bounds.left+'px'
		this.dom_input.style.transform = this.pixiMatrixToCSS(this.getDOMRelativeWorldTransform())
		this.dom_input.style.opacity = this.worldAlpha
		this.dom_input.style.display = this.worldVisible ? 'block' : 'none'

		this.previous.canvas_bounds = this.canvas_bounds
		this.previous.world_transform = this.worldTransform.clone()
		this.previous.world_alpha = this.worldAlpha
		this.previous.world_visible = this.worldVisible
	}


	// STATE COMPAIRSON (FOR PERFORMANCE BENEFITS)

	needsUpdate(){
		return (
			!this.comparePixiMatrices(this.worldTransform,this.previous.world_transform)
			|| !this.compareClientRects(this.canvas_bounds,this.previous.canvas_bounds)
			|| this.worldAlpha != this.previous.world_alpha
			|| this.worldVisible != this.previous.world_visible
			|| this.needsNewBoxCache()
		)
	}

	needsNewBoxCache(){
		let input_bounds = this.getDOMInputBounds()
		return (
			!this.previous.input_bounds
			|| input_bounds.width != this.previous.input_bounds.width
			|| input_bounds.height != this.previous.input_bounds.height
		)
	}




	// CACHING OF INPUT BOX GRAPHICS

	buildBoxCache(){
		this.destroyBoxCache()

		let states = ['IDLE','ACTIVE','DISABLED']
		let input_bounds = this.getDOMInputBounds()

		for(let i in states){
			this.box_cache[states[i]] = this.box_generator(
				input_bounds.width,
				input_bounds.height,
				states[i]
			)
		}

		this.previous.input_bounds = input_bounds
	}

	destroyBoxCache(){
		if(this.box){
			this.removeChild(this.box)
			this.box = null
		}
		for(let i in this.box_cache){
			this.box_cache[i].destroy()
			this.box_cache[i] = null
			delete this.box_cache[i]
		}
	}


	// HELPER FUNCTIONS

	getCanvasBounds(){
		let rect = this.last_renderer.view.getBoundingClientRect()
		let bounds = {top: rect.top, left: rect.left, width: rect.width, height: rect.height}
		bounds.left += window.scrollX
		bounds.top += window.scrollY
		return bounds
	}

	getDOMInputBounds(){
		let remove_after = false

		if(!this.dom_added){
			document.body.appendChild(this.dom_input)
			remove_after = true
		}

		let org_transform = this.dom_input.style.transform
		this.dom_input.style.transform = ''
		let bounds = this.dom_input.getBoundingClientRect()
		this.dom_input.style.transform = org_transform

		if(remove_after)
			document.body.removeChild(this.dom_input)

		return bounds
	}

	getDOMInputLocalBounds(){
		let bounds = this.getDOMInputBounds()
		bounds.width *= this.scale.x
		bounds.height *= this.scale.y
		return bounds
	}

	getDOMRelativeWorldTransform(){
		let canvas_bounds = this.last_renderer.view.getBoundingClientRect()
		let matrix = this.worldTransform.clone()
		matrix.scale(this.resolution,this.resolution)
		matrix.scale(canvas_bounds.width/this.last_renderer.width,
					 canvas_bounds.height/this.last_renderer.height)
		return matrix
	}

	pixiMatrixToCSS(m){
		return 'matrix('+[m.a,m.b,m.c,m.d,m.tx,m.ty].join(',')+')'
	}

	comparePixiMatrices(m1,m2){
		if(!m1 || !m2) return false
		return (
			m1.a == m2.a
			&& m1.b == m2.b
			&& m1.c == m2.c
			&& m1.d == m2.d
			&& m1.tx == m2.tx
			&& m1.ty == m2.ty
		)
	}

	compareClientRects(r1,r2){
		if(!r1 || !r2) return false
		return (
			r1.left == r2.left
			&& r1.top == r2.top
			&& r1.width == r2.width
			&& r1.height == r2.height
		)
	}
}


function DefaultBoxGenerator(styles){
	styles = styles || {fill: 0xcccccc}
	if(styles.idle){
		styles.active = styles.active || styles.idle
		styles.disabled = styles.disabled || styles.idle
	}else{
		let temp_styles = styles
		styles = {}
		styles.idle = styles.active = styles.disabled = temp_styles
	}
	return function(w,h,state){
		let style = styles[state.toLowerCase()]
		let box = new PIXI.Graphics()

		if(style.fill)
			box.beginFill(style.fill)

		if(style.stroke)
			box.lineStyle(
				style.stroke.width || 1,
				style.stroke.color || 0,
				style.stroke.alpha || 1
			)

		if(style.rounded)
			box.drawRoundedRect(0,0,w,h,style.rounded)
		else
			box.drawRect(0,0,w,h)

		box.endFill()
		box.closePath()

		return box
	}
}

PIXI.TextInput = TextInput

})(PIXI)