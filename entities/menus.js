function Menu(alpha){
	this.elements = [];
	this.drawables = [];
	this.alpha = alpha;
	this.pTime = Date.now();
	this.delta = 0;
}
Menu.prototype=fillProperties(new GLDrawable(),{
	sx: 0,
	sy: 0,
	glInit:function(manager){
		for(var i = 0; i<this.drawables.length; i++){
			if(this.drawables[i].glInit)this.drawables[i].glInit(manager)
		}
	},
	draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
		this.sx = screen.x;
		this.sy = screen.y;
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		manager.fillRect(screen.x+screen.width/2,screen.y+screen.height/2,-99.999999,screen.width,screen.height,0,0,0,0,this.alpha)
		mvMatrix.translate(this.sx,this.sy,-99.9999999)
		for(var i = 0; i<this.drawables.length; i++){
			mvMatrix.push();
				this.drawables[i].draw(gl,this.delta,screen,manager,pMatrix,mvMatrix);
			mvMatrix.pop();
		}
	},
	tick: function(delta){
		this.delta = (Date.now()-this.pTime)/1000;
		this.pTime = Date.now();
		var mx=mouse.x-this.sx,my=mouse.yInv-this.sy;
		for(var i = 0; i<this.elements.length; i++){
			this.elements[i].tick(delta,mx,my);
		}
	},
	add: function(obj){
		if(obj.tick){
			this.elements.push(obj);
		}
		if(obj.draw){
			this.drawables.push(obj);
		}
		return obj
	},
	translate: function(x,y){
		for(var i = 0; i<this.drawables.length;i++){
			this.drawables[i].x+=x;
			this.drawables[i].y+=y;
		}
	},
	z: -99,
	boundless: true
})

function Title(x,y,text,size,font,style){
	this.x=x;
	this.y=y;
	this.text=text;
	this.size=size;
	this.font=font;
	this.style=style;
}
Title.prototype={
	draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
		manager.fillText(this.text,this.x,this.y,0,this.size,this.font,this.style)
	}
}


function Button(x,y,width1,height1,width2,height2,text,size,font,style,action){
	this.text=text;
	this.size = size;
	this.font = font;
	this.style = style;
	this.x=x;
	this.y=y;
	this.width1=width1;
	this.height1=height1;
	this.width2=width2;
	this.height2=height2;
	this.time=0.2;
	this.t = 0;
	this.selected = false;
	this.action = action || function(){};
}
Button.prototype={
	pressed:false,
	selected: false,
	draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
		var width,height;
		if(this.selected){
			this.t=Math.min(this.time,this.t+delta);
		}else{
			this.t=Math.max(0,this.t-delta);
		}
		var u = Math.pow(this.t/this.time,0.5);
		manager.strokeRect(this.x,this.y,0,this.width1+(this.width2-this.width1)*u,this.height1+(this.height2-this.height1)*u,0,1,1,1,1)
		manager.fillText(this.text,this.x,this.y,0,this.size,this.font,this.style);
	},
	tick: function(delta,mx,my){
		var x = this.x-this.width1/2;
		var y = this.y-this.height1/2;
		if(mx>x && mx<x+this.width1 && my>y && my<y+this.height1){
			if(mouse.pressed){
				this.pressed = true;
			}else if(this.pressed){
				this.action();
				this.pressed = false;
			}
			this.selected = true;
		}else{
			this.selected = false;
			this.pressed = false;
		}
	}
}

function MenuCursor(){}
MenuCursor.prototype = fillProperties(new GLDrawable(),(function(){
	var first = true;
	var x=0, y=0;
	return{
		x:0,
		y:0,
		draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.point(this.x,this.y,-0.000001,12,1,1,1,1);
		},
		tick: function(delta,mx,my){
			this.x=mx;
			this.y=my;
		},
		width:12,
		height:12
	};
})());

function Slider(x,y,width,height,set,value){
	this.x =x;
	this.y =y;
	this.width = width;
	this.height = height;
	this.set = set;
	this.value = (value)?Math.min(value,1):1;
	this.sliderWidth = 8;
	this.trackHeight = 8;
}
Slider.prototype = {
	draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
		manager.fillRect(this.x,this.y,0,this.width,this.trackHeight,0,0.3,0.3,0.3,1)
		manager.fillRect((this.x-this.width/2)+(this.value*this.width),this.y,0,this.sliderWidth,this.height,0,0.8,0.8,0.8,1)
	},
	tick: function(delta,mx,my){
		var x = this.x-this.width/2;
		var y = this.y-this.height/2;
		if(mouse.pressed && mx>x && mx<x+this.width && my>y && my<y+this.height){
			this.value = Math.max(0,Math.min(1,(mx-x)/this.width))
			this.set(this.value);
		}
	}
}