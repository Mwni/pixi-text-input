# PIXI.TextInput - Plugin for pixi.js
![](http://manuelotto.com/opensource/PIXI.TextInput/img/preview.png?v2)

# About

This plugin for pixi.js provides a convenient way of adding text inputs to the pixijs-stage. 
The input itself is a HTML `<input>` element, which is positioned above the stage according to the transformation given by the PIXI-DisplayObject. The box is drawn on the PIXI-stage.

# Demos
[Demo with default box generator](http://manuelotto.com/opensource/PIXI.TextInput/demos/demo_default.html)

[Demo with custom box generator](http://manuelotto.com/opensource/PIXI.TextInput/demos/demo_custom.html)

# Documentation
The TextInput behaves just like any other PIXI-DisplayObject. It inherits from `PIXI.Container` and has all the associated properties like `width`, `height`, `rotation`, `scale` ,`alpha`, [etc.](http://pixijs.download/dev/docs/PIXI.Container.html)

## Creating an instance

    new PIXI.TextInput(input_style,box_styles)

**input_style** : object

> The css style attributes for the HTML input tag.

**box_styles** : object | function

>Either an object describing the style of the box using the default box generator, or a function which returns your own custom generated box.


## Box styling using the default box generator
The input can have 3 different states: 

| state  | description |
|--|--|
| `IDLE`  | default style when on stage |
| `ACTIVE` | when the input is focused |
| `DISABLED` | when the input is disabled |

For each state you can apply a different style to the input-box.
When passing the following object to the second parameter of the constructor:

    {
    	idle: {fill: 0xE8E9F3, rounded: 16, stroke: {color: 0xCBCEE0, width: 4}},
    	active: {fill: 0xE1E3EE, rounded: 16, stroke: {color: 0xABAFC6, width: 4}},
    	disabled: {fill: 0xDBDBDB, rounded: 16}
    }
You will get a box-style as shown in [this demo.](http://manuelotto.com/opensource/PIXI.TextInput/demos/demo_default.html)
If you don't want a different style for each state, you can just pass:

    {fill: 0xE8E9F3, rounded: 16, stroke: {color: 0xCBCEE0, width: 4}}



| Possible attributes  |  |
|--|--|
| `fill`  | The fill color of the box (must be a integer) |
| `rounded` | The border-radius |
| `stroke.color` | the color of the stroke (must be a integer) |
| `stroke.width` | the width of the stroke |
| `stroke.alpha` | the alpha of the stroke |



## Box styling using a custom generator
Write your own function to generate the box.


    function generateCustomBox(width, height, state){
    	var box = new PIXI.Graphics()
    
    	// draw the box based on width, height and the state (see table above for state values)
    
    	return box
    }

 then use it as follows

     new PIXI.TextInput({...},generateCustomBox)

See [this demo](http://manuelotto.com/opensource/PIXI.TextInput/demos/demo_custom.html) for clarification.



## Members

**placeholder** : string  
>The placeholder text applied to the html input element.

**text** : string  
>The text (value) of the html input element.

**disabled** : boolean  
>Set to true to disable the input.



## Methods

**focus()** : void  
>Focus the input.

**setInputStyle( key** : string, **value** : string **)** : void  
>Change a css style attribute of the input element.
For example use

    input.setInputStyle('fontSize', '21pt')
>to change the font size.



## Contribute
Feel free to add features or suggest improvements.