Entities.add('basic_collider',Entities.create(
	(function(){
		return {
			construct: function(state,x,y){
				fillProperties(state,Entities.createStandardCollisionState(
					{
						
					},x,y,32,32,1));
				state.dragConst = 0.1
			},
			create: function(state,x,y){
				state.set(x,y,0,0,0,0);
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
			},
			update: function(state,delta){
				state.accel[0]=0;
				state.accel[1]=1;
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		};
	})())
);

Entities.add('clickBox',Entities.create(
	(function(){
		return {
			parent: Entities.basic_collider,
			create: function(state,x,y){
				if(!state.firstClickBox){
					state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
						manager.fillRect(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,.5,1,1,1);
					}
				}
			}
		};
	})())
);

// Sample Enemy Bullet
Entities.add('tempBullet', Entities.create(
	(function(){
		return {
			// create gets called when Entities.tempBullet.newInstace gets called
			// Parameters can change depending on need but must have state as an argument
			create: function(state,x,y){
				// destroy will be called when state.alive is false
				state.alive = true;
				state.time = 1; // temporary variable created to destroy the instance after 1 second
				
				var p = Entities.player.getInstance(0);
				
				if(!state.first){
					// fill the state with standard collision state properties
					// this adds the entity to the collision system
					fillProperties(state, Entities.createStandardCollisionState(
					{
						// draw function must have these parameters in this order
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							// check graphics file for more information
							// some methods include: fillEllipse, fillRect, fillTriangle
							// paramters are x,y,angle,width,height,zindex,r,g,b,a
							manager.fillRect(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,.5,1,.5,1);
						}
					// values for collision box (x,y,width,height,zindex?)
					},x,y,16,16,1.1));
					
					// used to constantly update or check things or stuff fuckitslate
					state.tick = function(delta){
						this.time-=delta;
						this.alive = this.time>0;
					}
					state.first = true;
				}
				// how to set initial values for the entity like vel or accel or xy
				// vel and accel have x and y components represented as indexes respectively 
				state.x = x - state.width/2;
				state.y = y - state.height/2;
				// add state to draw system
				graphics.addToDisplay(state,'gl_main');
				// add tick to ticker system
				ticker.add(state);
				// add obj to collision system
				physics.add(state);
			},
			// gets called when alive is false
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);
// Example creation
// Entities.tempBullet.newInstance(Entities.player.getInstance(0).cx, Entities.player.getInstance(0).cy);

Entities.add('shrink_burst',Entities.create(
	(function(){
		return {
			parent: Entities.basic_collider,
			construct:function(state,x,y,width,height,life,vx,vy,r,g,b,dragConst){
				state.glInit = function(manager){
					if(!Entities.shrink_burst.initialized){
						var color = [];
						color.push(1,1,1,1)
						for(var i = 0; i<15; i++){
							color.push(1,1,1,0)
						}
						manager.addArrayBuffer('shrink_burst_color',true,color,16,4);
						Entities.shrink_burst.initialized=true;
					}
				}
				state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
					var f = this.life/this.startLife
					this.alpha = f;
					this.width = this.startWidth * f;
					this.height = this.startHeight * f;
					
					manager.bindProgram('basic');
					manager.setArrayBufferAsProgramAttribute('primitive_circle_fan','basic','vertexPosition');
					manager.setArrayBufferAsProgramAttribute('shrink_burst_color','basic','vertexColor');
					manager.setUniform1f('basic','alpha',this.alpha);
					manager.setUniform1f('basic','tintWeight',1);
					gl.uniform3f(manager.getProgram('basic').tint,this.r,this.g,this.b)
					mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,0);
					mvMatrix.scale(this.width,this.height,1);
					manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current)
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
					gl.drawArrays(gl.TRIANGLE_FAN,0,16);
					mvMatrix.scale(0.5,0.5,1);
					manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current)
					gl.drawArrays(gl.TRIANGLE_FAN,0,16);
					manager.setUniform1f('basic','alpha',1);
					manager.setUniform1f('basic','tintWeight',0);
				}
				state.z = 0;
			},
			create: function(state,x,y,width,height,life,vx,vy,r,g,b,dragConst){
				
				state.r = r || 0;
				state.g = g || 0;
				state.b = b || 0;
				state.startWidth = width || 8;
				state.width = state.startWidth;
				
				state.startHeight = height || 8;
				state.height = state.startHeight;
				
				state.startLife = life || 1;
				state.life = state.startLife;
				
				state.alpha = 1;
				state.dragConst = dragConst || 0.1;
				state.set(x,y,vx,vy,0,0);
			},
			update: function(state,delta){
				state.life-=delta;
				if(state.life<=0)state.alive = false;
			}
		}
	})())
).burst = function(num,x,y,width,height,life,speed,r,g,b,dragConst,vx,vy){
	vx = vx || 0;
	vy = vy || 0;
	
	for(var i =0; i<num; i++){
		var theta = Math.random()*(Math.PI*2);
		this.newInstance(x,y,width,height,life,vx+Math.cos(theta)*speed,vy+Math.sin(theta)*speed,r,g,b,dragConst);
	}
}

Entities.add('explosion', Entities.create(
	(function(){
		var miscArray = []
		return {
			create: function(state,x,y,size,minDamage,maxDamage,minForce,maxForce,interpolator){
				state.x = x;
				state.y = y;
				state.width = size;
				state.height = size;
				state.damage = damage;
				state.interpolator = interpolator;
				miscArray.length = 0;
				var cx = x+size/2;
				var cy = y+size/2
				var enemies = physics.getColliders(miscArray,x,y,size,size);
				for(var i = 0; i<enemies.length; i++){
					var e = enemies[i];
					var u = e.x+ (e.width/2) - cx
					var v = e.y+ (e.height/2) - cy;
					var p = pythag(u,v)/size;
					if(p < 1 && interpolator){
						var dir = Vector.getDir(u,v);
						var damage = interpolator(minDamage,maxDamage,p);
						var force = interpolator(minForce,maxForce,p)/(e.mass || 1);
						e.life-=damage;
						e.vel[0] += force * Math.cos(dir);
						e.vel[1] += force * Math.sin(dir);
					}
				}
				state.alive = false;
			},
			update: function(state,delta){			
			}
		}
	})())
);

Entities.add('explosion_basic', Entities.create(
	{
		parent: Entities.explosion,
		create: function(state,x,y,size,minDamage,maxDamage,minForce,maxForce,interpolator) {
			state.alive =false;
			Entities.shockwave.newInstance(state.x+state.width/2, state.y+state.height/2, 0, linearInterpolation,0,size,0.2,1,0.5,0,1)
			for (var i = 0; i < 50; i++)
				Entities.explosion_frag.newInstance(state.x+state.width/2, state.y+state.height/2);
			graphics.addToDisplay(state,'gl_main');	
		},
		destroy : function(state){
			graphics.removeFromDisplay(state,'gl_main');
		}
	}
));

Entities.add('explosion_frag', Entities.create(
	(function(){
		return {
			create: function(state,x,y,life){
				state.alive = true;
				state.life = life || 0.5;
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
					{
						glInit: function(manager){
							if(!Entities.explosion_frag.initialized){
								var color = [];
								color.push(1,0.5,0,1)
								for(var i = 0; i<15; i++){
									color.push(1,0.5,0,0)
								}
								manager.addArrayBuffer('explosion_frag_color',true,color,16,4);
								Entities.explosion_frag.initialized=true;
							}
						},
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							// manager.fillEllipse(this.x,this.y,0,width/2,height/2,0,1,0.5,0,1);
							manager.bindProgram('basic');
							manager.setArrayBufferAsProgramAttribute('primitive_circle_fan','basic','vertexPosition');
							manager.setArrayBufferAsProgramAttribute('explosion_frag_color','basic','vertexColor');
							manager.setUniform1f('basic','alpha',1);
							mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,this.z);
							mvMatrix.scale(this.width,this.height,1);
							manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current)
							gl.enable(gl.BLEND);
							gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
							gl.drawArrays(gl.TRIANGLE_FAN,0,16);
						}
					},x,y,24,24,1.1));
					state.z = 0;
					state.first = true;
				}
				state.width = 24;
				state.height = 24;
				state.x = x;
				state.y = y;
				state.vel[0] = Math.random()*400 - 200;
				state.vel[1] = Math.random()*400 - 200;
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
			},
			update: function(state,delta){
				state.life-=delta;	
				state.alive = state.life>0;
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		};
	})())
);

Entities.add('shockwave',Entities.create(
	{
		construct:function(state){
			fillProperties(state,new GLDrawable())
			state.glInit = function(manager){
				if(!Entities.shockwave.initialized){
					var color = [];
					color.push(1,1,1,0)
					for(var i = 0; i<63; i++){
						color.push(1,1,1,1)
					}
					manager.addArrayBuffer('shockwave_color',true,color,16,4);
					var verts = [];
					verts.push(0,0,0);
					var t = Math.PI*2/62;
					for(var i = 0; i<63; i++ ){
						verts.push(Math.cos(t*i)*0.5,Math.sin(t*i)*0.5,0)
					}
					manager.addArrayBuffer('shockwave_pos',true,verts,16,3);
					Entities.shockwave.initialized=true;
				}
			}
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				var u = 1-(this.t/this.tInit);
				var ra = this.interp(this.initRadius,this.finalRadius,u);
				var r = this.interp(this.ri,this.rf,u);
				var g = this.interp(this.gi,this.gf,u);
				var b = this.interp(this.bi,this.bf,u);
				var a = this.interp(this.ai,this.af,u);
				manager.bindProgram('basic');
				manager.setArrayBufferAsProgramAttribute('shockwave_pos','basic','vertexPosition');
				manager.setArrayBufferAsProgramAttribute('shockwave_color','basic','vertexColor');
				manager.setUniform1f('basic','alpha',a);
				manager.setUniform1f('basic','tintWeight',1);
				gl.uniform3f(manager.getProgram('basic').tint,r,g,b,a)
				mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,0);
				mvMatrix.scale(ra,ra,1);
				manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current)
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
				gl.drawArrays(gl.TRIANGLE_FAN,0,64);
				manager.setUniform1f('basic','alpha',1);
				manager.setUniform1f('basic','tintWeight',0);
			}
		},
		create: function(state,x,y,z,interpolator,rInit,rFinal,t,ri,gi,bi,ai,rf,gf,bf,af){
			state.x = x-(rFinal/2);
			state.y = y-(rFinal/2);
			state.z = z;
			state.interp = interpolator;
			state.width = rFinal;
			state.height = rFinal;
			state.initRadius = rInit;
			state.finalRadius = rFinal;
			state.t = t || 1;
			state.tInit = t || 1;
			state.ri = ri;
			state.gi = gi;
			state.bi = bi; 
			state.ai = ai;
			state.rf = rf || ri;
			state.gf = gf || gi;
			state.bf = bf || bi; 
			state.af = af || ai;
			graphics.addToDisplay(state,'gl_main')
		},
		update: function(state,delta){
			state.t -=delta;
			if(state.t<=0) state.alive = false;
		},
		destroy: function(state){
			graphics.removeFromDisplay(state,'gl_main')
		}
	}
))

Entities.add('explosion_player', Entities.create(
	{
		parent: Entities.explosion,
		construct: function(state){
			fillProperties(state,new GLDrawable())
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillEllipse(state.x+state.width/2,state.y+state.height/2,1,state.width,state.height,0,1,1,1,1);
				state.time-=delta;
				state.alive = state.time>0;
			}
		},
		create: function(state,x,y,t) {
			state.alive = true;
			time = t;
			for (var i = 0; i < 50; i++)
				Entities.explosion_frag.newInstance(state.x+state.width/2, state.y+state.height/2, time);
			graphics.addToDisplay(state,'gl_main');	
		},
		destroy : function(state){
			graphics.removeFromDisplay(state,'gl_main');
		}
	}
));
