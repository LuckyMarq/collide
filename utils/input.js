var input = {
	//these are hotkeys for movement across a webpage
	keys: [32,33,34,35,36,37,38,39,40,],
	//Keyboard is a class for setting up boolean flags for getting keyboard input
	Keyboard: function(element){
		var k = this;
		element.addEventListener(
			'keyup',
			function(e){
				k.release(e);
			},
			false);
		element.addEventListener(
			'keydown',
			function(e){
				k.press(e);
			},		
			false);
		element.addEventListener(
			'keypress',
			function(e){
				if(k.flags.hasOwnProperty(e.keyCode))e.preventDefault();
			},		
			false);
	},
	Mouse: function(element,frame){
		var rect = frame.getBoundingClientRect();
		var x=0,
			y=0,
			left=false,
			right=false,
			onElement=false;
			
		var box={
			x:0,
			y:0,
			width:frame.width,
			height:frame.height
		}
		
		var update = function(evt){//update x and y
			x =	evt.clientX-rect.left;
			y =	evt.clientY-rect.top;
		};
			
		var clickListeners = {};
		var wheelListeners = {}
		
		this.addClickListener=function(id,callback){
			if(typeof id == 'updefined' || typeof callback != 'function') throw "addClickListener: illegal values passed"
			clickListeners[id]=callback;
		}
		
		this.removeClickListener=function(id){
			delete clickListeners[id];
		}
		
		this.addWheelListener=function(id,callback){
			if(typeof id == 'updefined' || typeof callback != 'function') throw "addClickListener: illegal values passed"
			wheelListeners[id]=callback;
		}
		
		this.removeClickListener=function(id){
			delete wheelListeners[id];
		}
		
		Object.defineProperties(this,{
			x:{
				get:function(){
					return box.x + box.width*(x/(rect.right-rect.left));
				},
				set: function(){}
			},
			y:{
				get:function(){
					return box.y + box.height*(y/(rect.bottom-rect.top));
				},
				set: function(){}
			},
			yInv:{
				get:function(){
					return box.y + (box.height - box.height*(y/(rect.bottom-rect.top)));
				},
				set: function(){}
			},
			left:{
				get:function(){
					return left;
				},
				set: function(){}
			},
			right:{
				get:function(){
					return right;
				},
				set: function(){}
			},
			pressed:{
				get:function(){
					return right || left;
				},
				set: function(){}
			},
			/**
			*	this represents a bounding box that the mouses x and y values are scaled to
			* 	the assigned object must have the properties:
			*		.x(number)
			*		.y(number)
			*		.width(number)
			*		.height(number)
			*	else an exception is thrown
			*/
			box:{
				get:function(){
					return box;
				},
				set:function(newBox){
					if(box!=newBox){
						if(
							typeof box.x == 'number' && 
							typeof box.y == 'number' && 
							typeof box.width == 'number' && 
							typeof box.height == 'number'
								){
							box=newBox;
						}else{
							throw 'Input.Mouse.box: invalid assignment'
						}
					}
				}
			}
		});
		
		window.addEventListener(
			'mouseover',
			function(evt){
				onElement = true;
				update(evt)
			},
			false);
			
		// window.addEventListener(
			// 'mouseout',
			// function(evt){
				// onElement = false;
				// x=0;
				// y=0;
				// left=false;
				// right=false;
			// },
			// false)
			
		element.addEventListener(
			'mousemove',
			function(evt){
				if(onElement){
					update(evt);
				}
			},
			false)
			
		//prevents right click menue
		element.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			return false;
		},false);
		
		var setMousePressed = function(e,val){
			if ("which" in e){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
				if(e.which == 3){
					right = val;
				}else{
					left = val;
				}
			}else if ("button" in e){  // IE, Opera 
				if(e.button == 2){
					right = val;
				}else{
					left = val;
				}
			}
		}
			
		element.addEventListener(
			'mousedown',
			function(e){
				if(onElement){
					setMousePressed(e || window.event,true);
				}
			},
			false);
			
		element.addEventListener(
			'mouseup',
			function(e){
				if(onElement){
					setMousePressed(e || window.event,false);
				}
			},
			false);
			
		element.addEventListener(
			'click',
			function(evt){
				for(var o in clickListeners){
					clickListeners[o](evt);
				}
			},
			false);
		
		var wheelEvent= function(evt){
			var delta = evt.wheelDelta || -e.detail;
			for(var o in wheelListeners){
				wheelListeners[o](delta,evt.wheelDelta);
			}
		}
		
		element.addEventListener('mousewheel',wheelEvent,false);
		element.addEventListener('DOMMouseScroll',wheelEvent,false);
		
	},
	Gamepad: function(){
		var StickAlias = function(pad,x,y,button){
			this.x = x;
			this.y = y;
			Object.defineProperties(this,{
				xAxis: {
					get: function(){
						return pad.axes[x];
					},
					set: function(){}
				},
				yAxis: {
					get: function(){
						return pad.axes[y];
					},
					set: function(){}
				},
				/**
				*  direction on CCW unit circle
				*/
				dir: {
					get: function(){
						var t = Math.atan2(this.yAxis,this.xAxis);
						if(t < 0){
							return (Math.PI*2)+t;
						}else{
							return t;
						}
					},
					set: function(){}
				},
				mag: {
					get: function(){
						return Math.sqrt(Math.pow(this.xAxis,2)+Math.pow(this.yAxis,2));
					},
					set: function(){}
				},
				button:{
					get: function(){
						 if(navigator.webkitGetGamepads) {
							return pad.buttons[button]
						 }else{
							return pad.buttons[button].value || pad.buttons[button].pressed
						 }
					},
					set: function(){}
				}
			})
		}
		var PadAlias = function(pad){
			this.pad = pad;
			this.dpad = {};
			if(pad.buttons.length>=12){
				Object.defineProperties(this.dpad,{
					up:{
						get: function(){
							if(navigator.webkitGetGamepads) {
								return this.pad.buttons[12]
							 }else{
								return this.pad.buttons[12].value || this.pad.buttons[12].pressed
							 }
						},
						set: function(){}
					},
					down:{
						get: function(){
							if(navigator.webkitGetGamepads) {
								return this.pad.buttons[13]
							 }else{
								return this.pad.buttons[13].value || this.pad.buttons[13].pressed
							 }
						},
						set: function(){}
					},
					left:{
						get: function(){
							if(navigator.webkitGetGamepads) {
								return this.pad.buttons[14]
							 }else{
								return this.pad.buttons[14].value || this.pad.buttons[14].pressed
							 }
						},
						set: function(){}
					},
					right:{
						get: function(){
							if(navigator.webkitGetGamepads) {
								return this.pad.buttons[15]
							 }else{
								return this.pad.buttons[15].value || this.pad.buttons[15].pressed
							 }
						},
						set: function(){}
					}
				})
				Object.defineProperties(this,{
					leftStick:{
						value: new StickAlias(pad,0,1,10),
						writable: false
					},
					rightStick: {
						value: new StickAlias(pad,2,(pad.axes.length == 6)?5:3,11),
						writable: false
					}
				})
			}else{
				Object.defineProperties(this.dpad,{
					up:{
						get: function(){
							return Math.abs(Math.min(pad.axes[6],0));
						},
						set: function(){}
					},
					down:{
						get: function(){
							return Math.abs(Math.max(pad.axes[6],0));
						},
						set: function(){}
					},
					left:{
						get: function(){
							return Math.abs(Math.min(pad.axes[5],0));
						},
						set: function(){}
					},
					right:{
						get: function(){
							return Math.abs(Math.max(pad.axes[5],0));
						},
						set: function(){}
					}
				})
				Object.defineProperties(this,{
					leftStick:{
						value: new StickAlias(pad,0,1,9),
						writable: false
					},
					rightStick: {
						value: new StickAlias(pad,3,4,10),
						writable: false
					},
					start:{
						get: function(){
							return this.getButtonValue(7)
						},
						set: function(){}
						},
					select:{
						get: function(){
							return this.getButtonValue(6)
						},
						set: function(){}
					},
					leftTrigger: {
						get: function(){
							return Math.max(0,this.pad.axes[2])
						},
						set: function(){}
					},
					rightTrigger: {
						get: function(){
							return Math.abs(Math.min(0,this.pad.axes[2]))
						},
						set: function(){}
					}
				})
			}
			
		}
		PadAlias.prototype = Object.defineProperties({
			getButtonValue: function(button){
				if(navigator.webkitGetGamepads) {
					return this.pad.buttons[button]
				 }else{
					return this.pad.buttons[button].value || this.pad.buttons[button].pressed
				 }
			}
		},{
			start:{
				get: function(){
					return this.getButtonValue(9)
				},
				set: function(){}
			},
			select:{
				get: function(){
					return this.getButtonValue(8)
				},
				set: function(){}
			},
			x:{
				get: function(){
					return this.getButtonValue(2)
				},
				set: function(){}
			},
			y:{
				get: function(){
					return this.getButtonValue(3)
				},
				set: function(){}
			},
			a:{
				get: function(){
					return this.getButtonValue(0)
				},
				set: function(){}
			},
			b:{
				get: function(){
					return this.getButtonValue(1)
				},
				set: function(){}
			},
			1:{
				get: function(){
					return this.getButtonValue(0)
				},
				set: function(){}
			},
			2:{
				get: function(){
					return this.getButtonValue(1)
				},
				set: function(){}
			},
			3:{
				get: function(){
					return this.getButtonValue(2)
				},
				set: function(){}
			},
			4:{
				get: function(){
					return this.getButtonValue(3)
				},
				set: function(){}
			},
			leftBumper: {
				get: function(){
					return this.getButtonValue(4)
				},
				set: function(){}
			},
			rightBumper:{
				get: function(){
					return this.getButtonValue(5)
				},
				set: function(){}
			},
			leftTrigger: {
				get: function(){
					return this.getButtonValue(6)
				},
				set: function(){}
			},
			rightTrigger: {
				get: function(){
					return this.getButtonValue(7)
				},
				set: function(){}
			}
		})
		var pads = {};
		var padA = [];
		this.padA = padA;
		this.pads = pads;
		window.addEventListener(
			'gamepadconnected',
			function(evt){
				var pad = evt.gamepad;
				console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
					pad.index, pad.id,
					pad.buttons.length, pad.axes.length)
				pads[pad.id] = new PadAlias(pad);
				padA.push(pads[pad.id]);
			},
			false);
			
		window.addEventListener(
			'gamepaddisconnected',
			function(evt){
				var pad = evt.gamepad;
				console.log("Gamepad disconnected at index %d: %s. %d buttons, %d axes.",
					pad.index, pad.id,
					pad.buttons.length, pad.axes.length)
				for(var i = 0; i<padA.length; i++){
					if(padA[i].pad.id == pad.id){
						padA.splice(i,1);
					}
				}
				delete pads[pad.id];
			},
			false);
		
		this.query = function(){
			var gps;
			if(navigator.webkitGetGamepads){
				gps = navigator.webkitGetGamepads();
			}else{
				gps =  navigator.getGamepads()
			}
			for(var i = 0; i<gps.length; i++){
				if(gps[i]){
					var added = false;
					if(pads[gps[i].id]){
						pads[gps[i].id].pad = gps[i];
					}else{
						pads[gps[i].id] = new PadAlias(gps[i]);
						padA.push(pads[gps[i].id]);
					}
				}
			}
		}
	}
};

input.Keyboard.prototype = {
	flags: {},
	name: "keys",
	addFlag: function(keycode,name){
		this.addKeyListener(keycode,name,{})
	},
	addKeyListener: function(keycode,name,obj){//adds a flag as well
		//can have functions onPress() and onRelease()
		if(typeof obj != 'object'){
			throw new Error('addKeyListener: object not passed')
		}
		if(typeof obj.onPress != 'function') obj.onPress = function(){};
		if(typeof obj.onRelease != 'function') obj.onRelease = function(){};
		this[name] = false;
		this.flags[keycode] = {name: name,onPress: obj.onPress, onRelease: obj.onRelease};
	},
	press:function(event){
		//window.console.log("up");
		if(this.flags.hasOwnProperty(event.keyCode)){
			
					event.preventDefault();
			for(var i =0;i<input.keys.length;i++ ){
				if(event.keyCode == input.keys[i]){
					event.returnValue=false;
					break;
				}
			}
			this.flags[event.keyCode].onPress(event);
			this[this.flags[event.keyCode].name]=true;
		}
	},
	release:function(event){
		//window.console.log("down");
		if(this.flags.hasOwnProperty(event.keyCode)){
			this.flags[event.keyCode].onRelease(event);
			this[this.flags[event.keyCode].name]=false;
		}
	}	
};

input.Mouse.prototype={
	onElement: false,
	clickActions: new Array(),
	onClick: function(evt){
		for(var i in this.clickActions){
			this.clickActions[i](evt);
		}
	}
}

input.Gamepad.prototype = {
	BUTTONS: {
	  FACE_1: 0, // Face (main) buttons
	  FACE_2: 1,
	  FACE_3: 2,
	  FACE_4: 3,
	  LEFT_SHOULDER: 4, // Top shoulder buttons
	  RIGHT_SHOULDER: 5,
	  LEFT_SHOULDER_BOTTOM: 6, // Bottom shoulder buttons
	  RIGHT_SHOULDER_BOTTOM: 7,
	  SELECT: 8,
	  START: 9,
	  LEFT_ANALOGUE_STICK: 10, // Analogue sticks (if depressible)
	  RIGHT_ANALOGUE_STICK: 11,
	  PAD_TOP: 12, // Directional (discrete) pad
	  PAD_BOTTOM: 13,
	  PAD_LEFT: 14,
	  PAD_RIGHT: 15
	},
	AXES: {
	  LEFT_ANALOGUE_HOR: 0,
	  LEFT_ANALOGUE_VERT: 1,
	  RIGHT_ANALOGUE_HOR: 2,
	  RIGHT_ANALOGUE_VERT: 3
	}
}