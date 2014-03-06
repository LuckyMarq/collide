current_points = 0;

function addToPoints(x){
	current_points+=x;
}

Entities.add('player', Entities.create((function(){

	var transitionSound=Sound.createSound('transition',false);
	transitionSound.gain = 0.1;
	var blipSound=Sound.createSound('blip',false);
	blipSound.gain = 0.05;
	var playerExplosion=Sound.createSound('playerExplosion',false);
	playerExplosion.gain = 0.5;
	//creates a circle with the given number of sides and radius
	var generateCircle = function(numOfVerts,radius){
		numOfVerts-=2;
		var verts = new Array();
		verts.push(0,0,0);
		var current = vec3.set(vec3.create(),0,radius,0);
		
		var rotation = mat4.create();
		mat4.identity(rotation);
		mat4.rotateZ(rotation,rotation,(Math.PI*2)/(numOfVerts+1));
		
		for(var i = 0;i<numOfVerts; i++){
			verts.push(current[0]);verts.push(current[1]);verts.push(current[2]);
			vec3.transformMat4(current,current,rotation);
		}
		
		verts.push(0,radius,0);
		return verts;
	}
	
	//generates a triangle keyframe
	var generateTriangle = function(numOfVerts,radius){
		var verts = new Array();
		verts.push(0,0,0)
		var sides;
		var bottom;
		numOfVerts-=5;
		//get the number of vertices to be
		//hidden in the triangles sides
		if(numOfVerts%3 == 0){
			sides=numOfVerts/3;
			bottom=numOfVerts/3;
		}else{
			var div = Math.floor(numOfVerts/3);
			var mod = numOfVerts%3
			sides=div;
			bottom=div+mod;
		}
		
		var pSides = 1/(sides+1);
		var pBottom = 1/(bottom+1);
		var pa = vec3.set(vec3.create(),0,radius,0);
		var pc = vec3.set(vec3.create(),radius*Math.sin((Math.PI*2)/3),radius*Math.cos((Math.PI*2)/3),0);
		var pb = vec3.set(vec3.create(),radius*Math.sin((Math.PI*4)/3),radius*Math.cos((Math.PI*4)/3),0);
		var temp = vec3.create();
		
		verts.push(pa[0],pa[1],pa[2]);
		for(var j = 1; j<=sides; j++){
			vec3.lerp(temp,pa,pb,pSides*j)
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pb[0],pb[1],pb[2]);
		for(var j = 1; j<=bottom; j++){
			vec3.lerp(temp,pb,pc,pBottom*j);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pc[0],pc[1],pc[2]);
		for(var j = 1; j<=sides; j++){
			vec3.lerp(temp,pc,pa,pSides*j);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pa[0],pa[1],pa[2]);
		
		return verts;
	}
	
	//generates a square keyframe
	var generateSquare = function(numOfVerts,radius){
		numOfVerts-=7;
		var verts = new Array();
		verts.push(0,0,0);
		var div = Math.floor(numOfVerts/4);
		var mod = numOfVerts%4;
		var top = (div - (div%2))/2;
		var sides = div;
		var bottom = div + mod +(sides%2);
		
		var topP = 1/(top+1);
		var sideP = 1/(sides+1);
		var bottomP = 1/(bottom+1);
		
		var dist = Math.sqrt((radius*radius)/2);
		
		var n = vec3.set(vec3.create(),0,dist,0);
		var ne = vec3.set(vec3.create(),dist,dist,0);
		var se = vec3.set(vec3.create(),dist,-dist,0);
		var sw = vec3.set(vec3.create(),-dist,-dist,0);
		var nw = vec3.set(vec3.create(),-dist,dist,0);
		
		var temp = vec3.create();
		
		verts.push(n[0],n[1],n[2]);
		for(var i = 1; i<=top ; i++){
			vec3.lerp(temp,n,nw,topP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(nw[0],nw[1],nw[2]);
		for(var i = 1; i<=sides ; i++){
			vec3.lerp(temp,nw,sw,sideP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(sw[0],sw[1],sw[2]);
		for(var i = 1; i<=bottom ; i++){
			vec3.lerp(temp,sw,se,bottomP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(se[0],se[1],se[2]);
		for(var i = 1; i<=sides ; i++){
			vec3.lerp(temp,se,ne,sideP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(ne[0],ne[1],ne[2]);
		for(var i = 1; i<=top ; i++){
			vec3.lerp(temp,ne,n,topP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(n[0],n[1],n[2]);
		return verts;
	}
	
	var generateRocket = function(numOfVerts,radius){
		var verts = new Array();
		verts.push(0,0,0)
		var sides;
		var bottom;
		var bottom1;
		var bottom2;
		numOfVerts-=6;
		//get the number of vertices to be
		//hidden in the triangles sides
		if(numOfVerts%3 == 0){
			sides=numOfVerts/3;
			bottom=numOfVerts/3;
		}else{
			var div = Math.floor(numOfVerts/3);
			var mod = numOfVerts%3
			sides=div;
			bottom=div+mod;
		}
		bottom1 = Math.floor(bottom/2);
		bottom2 = Math.ceil(bottom/2);
		
		var pSides = 1/(sides+1);
		var pBottom1 = 1/(bottom1+1);
		var pBottom2 = 1/(bottom2+1);
		
		var pa = vec3.set(vec3.create(),0,radius,0);
		var pb = vec3.set(vec3.create(),-radius,-radius*1.5,0);
		var pc = vec3.set(vec3.create(),0,-radius/2,0);
		var pd = vec3.set(vec3.create(),radius,-radius*1.5,0);
		var temp = vec3.create();
		
		verts.push(pa[0],pa[1],pa[2]);
		for(var j = 1; j<=sides; j++){
			vec3.lerp(temp,pa,pb,pSides*j)
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pb[0],pb[1],pb[2]);
		for(var j = 1; j<=bottom1; j++){
			vec3.lerp(temp,pb,pc,pBottom1*j);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pc[0],pc[1],pc[2]);
		for(var j = 1; j<=bottom2; j++){
			vec3.lerp(temp,pc,pd,pBottom2*j);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pd[0],pd[1],pd[2]);
		for(var j = 1; j<=sides; j++){
			vec3.lerp(temp,pd,pa,pSides*j);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pa[0],pa[1],pa[2]);
		
		return verts;
	}
	
	
	var getColor = function(numOfVerts,r,g,b,a){
		var colors = new Array()
		for(var i = 0; i<numOfVerts; i++){
			colors.push(0,1,0,1);
		}
		return colors;
	}
	
	var controls = {
		up:'w',
		down:'s',
		right:'d',
		left:'a'
	}
	
	var weaponKeys = ['_1','_2','_3','_4','_5','_6','_7','_8','_9','_0'];
	
	return {
		construct: function(state,x,y,firstKeyframe,firstWeapon){
			{//setup animator
				var verts = 32;
				var radius = 32;
				var posProps = 
					{
						attributeId: "vertexPosition",
						items: verts,
						itemSize: 3
					}
					
				var colProps = 
					{
						attributeId: "vertexColor",
						items: verts,
						itemSize: 4
					}	
				
				var circle = fillProperties(generateCircle(verts,32),posProps);
				var circleColor = fillProperties(getColor(verts,0.0,0.0,1.0,1.0),colProps);
				
				var triangle = fillProperties(generateTriangle(verts,32),posProps);
				var triangleColor = fillProperties(getColor(verts,1.0,0.0,0.0,1.0),colProps);
				
				var square = fillProperties(generateSquare(verts,32),posProps);
				var squareColor = fillProperties(getColor(verts,0.0,1.0,0.0,1.0),colProps);
				
				var rocketShape = fillProperties(generateRocket(verts,32),posProps);
				var rocketColor = fillProperties(getColor(verts,1.0,0.0,0.0,1.0),colProps);
				
				var animator = new VertexAnimator('basic',
					{
						playerPosition:circle,
						playerColor:circleColor
					},{},verts);
				
				animator.setVertexAttribute('playerPosition',3);
				
				animator.addKeyframe('circle',
					{
						playerPosition:circle,
						playerColor:circleColor
					},{});
					
				animator.addKeyframe('triangle',
					{
						playerPosition:triangle,
						playerColor:triangleColor
					},{});
					
				animator.addKeyframe('square',
					{
						playerPosition:square,
						playerColor:squareColor
					},{});
					
				animator.addKeyframe('rocket',
					{
						playerPosition:rocketShape,
						playerColor:rocketColor
					},{});	
				
				state.animator = animator;
			}
			
			var updateCoords;
			var acceleration = configs.player.acceleration.value;
			var turnScale = configs.player.turnScale.value;
			var elasticity = configs.player.elasticity.value;
			var drag =	configs.player.drag.value;
			var theta = 0;
			var boundingBoxScale = configs.player.boundingBoxScale.value;
			var r = Vector.getDir([triangle[3],triangle[4],triangle[5]]);
			var mvec = [0,0];
			var k = 0;
			var pk = 0;
			
			state.collisionScale = 1/boundingBoxScale;
			
			var movementCheck = function(){//eightway directional movement
				var count=0,angle=0;
				if(keyboard[controls.down]){
					count++;
					angle+=Math.PI*(3/2);
				}
				if(keyboard[controls.up]){
					count++;
					angle+=Math.PI/2;
				}
				if(keyboard[controls.left]){
					count++;
					angle+=Math.PI;
				}
				if(keyboard[controls.right]){
					count++;
					if(keyboard[controls.down]){
						angle+=Math.PI*2;
					}
				}
				angle /= count;
				if(count>0){
					var x = acceleration * Math.cos(angle);
					var y = acceleration * Math.sin(angle);
					var u = (x*state.vel[0] + y*state.vel[1])/((state.vel[0] * state.vel[0]) + (state.vel[1] * state.vel[1]));
					if(isNaN(u)){
						state.accel[0] = x;
						state.accel[1] = y;
					}else{
						var uv = (state.vel[0]*u);
						var vv = (state.vel[1]*u);
						if(!(Math.abs(Vector.getDir(uv,vv)-Vector.getDir(state.vel))<(Math.PI/2))){
							uv*=turnScale;
							vv*=turnScale;
						}
						state.accel[0] = (state.vel[0]*u) + (x - state.vel[0]*u)*turnScale
						state.accel[1] = (state.vel[1]*u) + (y - state.vel[1]*u)*turnScale
					}
				}else{
					var p = gamepad.padA[0];
					if(p && p.leftStick.mag>0.1){
						var a = p.leftStick.mag * acceleration
						var x = a * p.leftStick.xAxis;
						var y = -a * p.leftStick.yAxis;
						var u = (x*state.vel[0] + y*state.vel[1])/((state.vel[0] * state.vel[0]) + (state.vel[1] * state.vel[1]));
						if(isNaN(u)){
							state.accel[0] = x;
							state.accel[1] = y;
						}else{
							var uv = (state.vel[0]*u);
							var vv = (state.vel[1]*u);
							if(!(Math.abs(Vector.getDir(uv,vv)-Vector.getDir(state.vel))<(Math.PI/2))){
								uv*=turnScale;
								vv*=turnScale;
							}
							state.accel[0] = (state.vel[0]*u) + (x - state.vel[0]*u)*turnScale;
							state.accel[1] = (state.vel[1]*u) + (y - state.vel[1]*u)*turnScale;
						}
						return;
					}
					state.accel[0]=0;
					state.accel[1]=0;
				}
			}
			state.weaponManager = new WeaponManager();
			// state.weaponManager.add(new BeamWeapon());
			// state.weaponManager.add(new RocketWeapon());
			// state.weaponManager.add(new WaveWeapon());
			state.keyframes = [firstKeyframe];
			state.addWeapon = function(keyframe,weapon){
				this.keyframes.push(keyframe);
				this.weaponManager.add(new weapon());
				transitionSound.stop(0);
				transitionSound.play(0);
				animator.setCurrentKeyframe(keyframe,1);
				if(!animator.animating)pk = k
				k = this.keyframes.length-1;
				this.weaponManager.swap(this.keyframes.length-1)
			}
			// weapon manager
			// This section is used for weapons testing
			var weaponsCheck = function() {
				var p = gamepad.padA[0]; 
				if (mouse.left)
				{
					state.weaponManager.fire((Math.PI*2)-Vector.getDir(mouse.x-state.cx,mouse.y-state.cy),false);
				}
				else if(p&&p.rightStick.mag>0.5){
					state.weaponManager.fire((Math.PI*2)-p.rightStick.dir,true)
				}else{
					state.weaponManager.holdFire();
				}
			}
			
			var life = 100;
			var pressInterval = configs.player.switchInterval.value;
			var animationTime = configs.player.switchTime.value;
			var canPress = 0;
			state.maxLife = 100;
			var numDisplay = document.createElement('canvas');
			numDisplay.height=64;
			numDisplay.width=512;
			var gfx = numDisplay.getContext('2d')
			
			state.hud = fillProperties(new GLDrawable(),{
				glInit: function(manager){
					var gl = manager.gl;
					this.texture = gl.createTexture();
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
					gl.bindTexture(gl.TEXTURE_2D, this.texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, numDisplay);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

					gl.bindTexture(gl.TEXTURE_2D, null);
				},
				draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
					gfx.clearRect(0,0,numDisplay.width,numDisplay.height);
					gfx.fillStyle = 'rgba(255,255,255,255)';
					gfx.textAlign = 'left';
					gfx.textBaseline = 'middle';
					gfx.font = "48px Lucida Console";
					gfx.fillText(''+current_points,10,numDisplay.height/2)
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
					gl.bindTexture(gl.TEXTURE_2D, this.texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, numDisplay);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

					gl.bindTexture(gl.TEXTURE_2D, null);
					
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)
					manager.fillRect(screen.x+screen.width/2,screen.y+screen.height-16,this.z,(screen.width-32)*(life/100),16,0,1-(1*(life/100)),1*(life/100),0,this.alpha);
					manager.fillRect(screen.x+screen.width/2,screen.y+screen.height-32,this.z,(screen.width-32)*(state.weaponManager.energy/100),16,0,1,(state.weaponManager.overheated)?0:1,0,this.alpha);
					mvMatrix.translate(screen.x+screen.width - 48, screen.y+48, this.z);
					
					this.animator.alpha = this.alpha;
					for(var i = this.keyframes.length-1; i>=0; i--){
						// mvMatrix.push();
						// mvMatrix.scale(0.5,0.5,1);
						this.animator.drawKeyframe(this.keyframes[i],gl,delta,screen,manager,pMatrix,mvMatrix)
						// mvMatrix.pop();
						if(i==k){
							manager.strokeRect(0,0,0,64,64,0,1,1,1,this.alpha)
						}
						mvMatrix.translate(-64,0,0);
					}
					this.animator.alpha = 1;
					
					
					mvMatrix.identity();
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
					manager.bindProgram('basic_texture');
					manager.setArrayBufferAsProgramAttribute('primitive_rect','basic_texture','vertexPosition');
					manager.setArrayBufferAsProgramAttribute('sprite_texture_coords','basic_texture','textureCoord');
					
					mvMatrix.translate(screen.x+numDisplay.width/2,screen.y+numDisplay.height/2,this.z);
					mvMatrix.scale(numDisplay.width,numDisplay.height,1);
					manager.setMatrixUniforms('basic_texture',pMatrix,mvMatrix.current);
					
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, this.texture);
					var prog = manager.getProgram('basic_texture');
					gl.uniform1i(prog.samplerUniform, 0);
					gl.uniform1f(prog.alpha,1)
					gl.uniform1f(prog.tintWeight,0);
					gl.uniform3f(prog.tint,0,0,0);
					
					gl.drawArrays(gl.TRIANGLE_FAN,0,4);
				},
				animator: animator,
				keyframes: state.keyframes,
				z: -99,
				boundless: true,
				alpha: 0.5
			})
			
			Object.defineProperties(
					fillProperties(fillProperties(state,fillProperties(new GLDrawable(),new PolygonCollider(x+animator.x,y+animator.y,animator.width,animator.height,elasticity,null,3))),
						{
							cx: x,
							cy: y,
							tick: function(delta){
								if(!this.active)return;
								movementCheck();
								weaponsCheck();
								var p = gamepad.padA[0]; 
								var change = (!animator.animating);
								var pos;
								if((keyboard.e || (p && (p.rightBumper || p.rightTrigger>0.5))) && canPress<=0){
									pos = (k+1)%this.keyframes.length
									transitionSound.stop(0);
									transitionSound.play(0);
									animator.setCurrentKeyframe(this.keyframes[pos],(pk==pos) ? animationTime-animator.getTimeTillNextKeyframe() : animationTime);
									if(!animator.animating)pk = pos
									k = pos;
									this.weaponManager.swap(pos)
									canPress = pressInterval;
								}else if((keyboard.q || (p && (p.leftBumper || p.leftTrigger>0.5)))&& canPress<=0){
									pos = (k-1);
									if(pos<0)pos = this.keyframes.length+pos;
									transitionSound.stop(0);
									transitionSound.play(0);
									animator.setCurrentKeyframe(this.keyframes[pos],(pk==pos) ? animationTime-animator.getTimeTillNextKeyframe() : animationTime);
									if(!animator.animating)pk = pos
									k = pos;
									this.weaponManager.swap(pos)
									canPress = pressInterval;
								}else{
									canPress -= delta;
									for(var i = 0; i<this.keyframes.length; i++){
										if(keyboard[weaponKeys[i]] && k!=i){
											transitionSound.stop(0);
											transitionSound.play(0);
											animator.setCurrentKeyframe(this.keyframes[i],(pk==i) ? animationTime-animator.getTimeTillNextKeyframe() : animationTime);
											if(!animator.animating)pk = k
											k = i;
											this.weaponManager.swap(i)
											break;
										}
									}
								}
								
								var mx= mouse.x,my=mouse.yInv;
								theta = Vector.getDir(this.vel)-r;
								animator.theta = theta;
								
								if(this.life<=0){
									this.alive = false;
								}
								Entities.player_trail_particles.burst(this.x+this.width/2,this.y+this.height/2,Math.min(this.width,this.height)/4,Math.min(1,(delta/0.016)*2),1,1-(1*(this.life/100)),1*(this.life/100),0)
							},
							glInit: function(manager){
								animator.glInit(manager);
							},
							draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
								updateCoords();
								mvMatrix.identity(mvMatrix);
								mvMatrix.translate(state.cx,state.cy,0);
								// manager.point(0,0,-1,6,1,1,1,1);
								mvMatrix.rotateZ(theta);
								animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
								// manager.line(state.x-animator.x,state.y-animator.y,mouse.x,mouse.yInv,0,1,1,1,1)
							},
							onCollision: function(){
								blipSound.play(0);
								blipSound.gain = Vector.getMag(this.vel) * 0.0001
							}
						}),
				(function(){
					var stateX = x+animator.x, stateY= y+animator.y;
					updateCoords = function(){
						stateX = state.cx+(animator.x*boundingBoxScale);
						stateY = state.cy+(animator.y*boundingBoxScale);
					}
					var verts = new Array();
					return {
						life:{
							get: function(){
								return life;
							},
							set: function(nLife){
								if(!god_mode)life = Math.min(nLife,this.maxLife);
							},
							configurable: true
						},
						x:{
							get:function(){
								return stateX;
							},
							set:function(x){
								this.cx+= x-stateX;
								stateX = x;
							}
						},
						y:{
							get:function(){
								return stateY;
							},
							set:function(y){
								
								this.cy += y-stateY;
								stateY = y;
							}
						},
						width:{
							get:function(){
								return animator.width*boundingBoxScale;
							},
							set:function(){}
						},
						height:{
							get:function(){
								return animator.height*boundingBoxScale;
							},
							set:function(){}
						},
						verts:{
							get:function(){
								verts.length = 0;
								return animator.getVerts(verts,this.cx,this.cy,1,1);
							},
							set:function(){}
						}
					}
				})());
		},
		create: function(state,x,y,firstKeyframe,firstWeapon){
			state.keyframes.length = 1;
			state.keyframes[0] = firstKeyframe;
			state.animator.setCurrentKeyframe(firstKeyframe);
			state.weaponManager.add(new firstWeapon());
			ticker.add(state.weaponManager);
			state.life = 100;
			state.set(x,y,0,0,0,0);
			state.active = false;
			graphics.addToDisplay(state,'gl_main');
			graphics.addToDisplay(state.hud,'gl_main');
			physics.add(state);
			ticker.add(state);
			graphics.getScreen('gl_main').follower = state;
		},
		update: function(state,delta){
			// var s = graphics.getScreen('gl_main')
			// currentMap.visit(state.cx-s.width/2,state.cy-s.height/2,s.width,s.height)
			if(state.active)currentMap.visit(state.x,state.y,state.width,state.height)
		},
		destroy: function(state){
			graphics.removeFromDisplay(state,'gl_main');
			graphics.removeFromDisplay(state.hud,'gl_main');
			physics.remove(state);
			ticker.remove(state);
			ticker.remove(state.weaponManager);
			if(graphics.getScreen('gl_main').follower == state)graphics.getScreen('gl_main').follower == null;
			state.weaponManager.clear();
			playerExplosion.play(0);
			Entities.explosion_player.newInstance(state.cx, state.cy,2);
			ticker.addTimer(function(){reinitScene()},2,0);
			if(current_music){
				current_music.stop(0);
			}
		}
	};
})()))

Entities.player.getInstance = function(){
	return this.instanceArray[0];
}

Entities.player.reset = function(){}

Entities.add('player_trail_particles',Entities.create(
		{
			create: function(state,x,y,life,r,g,b){
				state.alive = true;
				state.life = life || 0.5;
				state.lifeStart = state.life;
				state.r = r;
				state.g = g;
				state.b = b;
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
					{
						glInit: function(manager){
							if(!Entities.player_trail_particles.initialized){
								var color = [];
								color.push(1,1,1,1)
								for(var i = 0; i<15; i++){
									color.push(1,1,1,0)
								}
								manager.addArrayBuffer('player_trail_color',true,color,16,4);
								Entities.player_trail_particles.initialized=true;
							}
						},
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							var u = this.life/this.lifeStart;
							// manager.fillEllipse(this.x,this.y,0,width/2,height/2,0,1,0.5,0,1);
							manager.bindProgram('basic');
							manager.setArrayBufferAsProgramAttribute('primitive_circle_fan','basic','vertexPosition');
							manager.setArrayBufferAsProgramAttribute('player_trail_color','basic','vertexColor');
							manager.setUniform1f('basic','alpha',u);
							manager.setUniform1f('basic','tintWeight',1);
							gl.uniform3f(manager.getProgram('basic').tint,this.r,this.g,this.b)
							mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,this.z);
							mvMatrix.scale(this.width*u,this.height*u,1);
							manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current)
							gl.enable(gl.BLEND);
							gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
							gl.drawArrays(gl.TRIANGLE_FAN,0,16);
							manager.setUniform1f('basic','alpha',1);
							manager.setUniform1f('basic','tintWeight',0);
						}
					},x,y,24,24,1.1));
					state.z = 1;
					state.first = true;
				}
				state.width = 32;
				state.height = 32;
				state.x = x-state.width/2;
				state.y = y-state.height/2;
				graphics.addToDisplay(state,'gl_main');
				// physics.add(state);
			},
			update: function(state,delta){
				state.life-=delta;	
				state.alive = state.life>0;
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				// physics.remove(state);
			}
		}
	));

Entities.player_trail_particles.burst = function(x,y,size,num,life,r,g,b){
	for(var i = 0; i< num; i++){
		var t = Math.random()*(Math.PI*2);
		var rad = Math.pow(Math.random(),2)* size;
		this.newInstance(x+Math.cos(t)*rad,y+Math.sin(t)*rad,life,r,g,b);
	}
}

Entities.add('player_init_particles',Entities.create({
	construct: function(state){
		fillProperties(state,fillProperties(new GLDrawable(),{
			glInit: function(manager){
				if(!Entities.player_init_particles.initialized){
					var color = [];
					color.push(1,1,1,1)
					for(var i = 0; i<15; i++){
						color.push(1,1,1,0)
					}
					manager.addArrayBuffer('player_init_color',true,color,16,4);
					Entities.player_init_particles.initialized = true;
				}
			},
			draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
				var u = Math.pow(1-(this.life/this.lifeStart),5);
				// manager.fillEllipse(this.x,this.y,0,width/2,height/2,0,1,0.5,0,1);
				manager.bindProgram('basic');
				manager.setArrayBufferAsProgramAttribute('primitive_circle_fan','basic','vertexPosition');
				manager.setArrayBufferAsProgramAttribute('player_init_color','basic','vertexColor');
				manager.setUniform1f('basic','alpha',u);
				manager.setUniform1f('basic','tintWeight',1);
				gl.uniform3f(manager.getProgram('basic').tint,this.r,this.g,this.b)
				mvMatrix.translate((this.x1+(this.x2-this.x1)*u),(this.y1+(this.y2-this.y1)*u),this.z);
				mvMatrix.scale(this.size*u,this.size*u,1);
				manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current)
				gl.enable(gl.BLEND);
				gl.blendFuncSeparate(gl.SRC_COLOR,gl.ONE,gl.SRC_ALPHA, gl.DST_ALPHA);
				gl.drawArrays(gl.TRIANGLE_FAN,0,16);
				manager.setUniform1f('basic','alpha',1);
				manager.setUniform1f('basic','tintWeight',0);
			},
			z:0,
			boundless:true
		}))
	},
	create: function(state,x1,y1,x2,y2,r,g,b,size,life){
		state.r = r;
		state.g = g;
		state.b = b;
		state.x = x1;
		state.y = y1;
		state.x1 = x1;
		state.y1 = y1;
		state.x2 = x2;
		state.y2 = y2;
		state.size = size;
		state.width = size;
		state.height = size;
		state.life = life;
		state.lifeStart = life;
		graphics.addToDisplay(state,'gl_main');
	},
	update: function(state,delta){
		state.life -=delta;
		if(state.life<0)state.alive = false;
	},
	destroy: function(state){
		graphics.removeFromDisplay(state,'gl_main');
	}
}));

Entities.add('player_initializer',Entities.create({
	construct:function(state){
		state.sound = Sound.createSound('player_create',false);
		state.sound.gain = 0.8;
	},
	create: function(state,x,y,player){
		for(var i =0; i<50; i++){
			var theta = Math.random()*(Math.PI*2)
			var size = 128 * (1-Math.pow(Math.random(),3))
			Entities.player_init_particles.newInstance(x+Math.cos(theta)*size, y+Math.sin(theta)*size,x,y,0.1,1,0.1,64,3)
		}
		if(player){
			player.visible = false;
			player.active = false;
			player.set(x+player.x-player.cx,y+player.y-player.cy,0,0,0,0);
			state.player = player;
		}
		state.x=x;
		state.y=y;
		state.sound.play(0)
		state.life = 3;
	},
	update: function(state,delta){
		state.life -= delta;
		if(state.life<0)state.alive = false;
	},
	destroy: function(state){
		Entities.shockwave.newInstance(state.x,state.y,0,getExponentInterpolator(1),0,10000,1,0,1,0,1,0,1,0,0)
		if(state.player){
			state.player.visible = true;
			state.player.active = true;
			state.player.set(state.x+state.player.x-state.player.cx,state.y+state.player.y-state.player.cy,0,0,0,0);
			current_music = Sound.createSound('groove',true);
			current_music.gain = 0.5;
			current_music.play(Date.now()+1000)
		}
		frozen = false;
	}
}))
