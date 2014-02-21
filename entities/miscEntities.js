Entities.add('basic_collider',Entities.create(
	(function(){
		return {
			create: function(state,x,y){
				if(!state.firstBasicCollider){
					fillProperties(state,Entities.createStandardCollisionState(
						{
							
						},x,y,32,32,1));
					state.firstBasicCollider = true;
					state.dragConst = 0.1
				}
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
			create: function(state,x,y,width,height,life,vx,vy,r,g,b,dragConst){
				if(!state.firstShrinkCollider){
					state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
						var f = this.life/this.startLife
						this.alpha = f;
						this.width = this.startWidth * f;
						this.height = this.startHeight * f;
						gl.enable(gl.BLEND);
						gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
						manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,this.r,this.g,this.b,0.5*this.alpha);
						manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,this.r,this.g,this.b,this.alpha);
						gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
					}
					state.firstShrinkCollider = true;
				}
				
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
		construct: function(state){
			fillProperties(state,new GLDrawable())
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillEllipse(state.x+state.width/2,state.y+state.height/2,1,state.width,state.height,0,1,1,1,1);
				state.time-=delta;
				state.alive = state.time>0;
			}
		},
		create: function(state,x,y,size,minDamage,maxDamage,minForce,maxForce,interpolator) {
			state.alive = true;
			time = 1;
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
				var width = 24;
				var height = 24;
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillEllipse(this.x,this.y,0,width/2,height/2,0,1,0.5,0,1);
							gl.enable(gl.BLEND);
							gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
							manager.fillEllipse(this.x,this.y,0,width,height,0,1,0.5,0,0.5);
							gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
						}
					},x,y,width,height,1.1));
					state.tick = function(delta){
						this.life-=delta;	
						this.alive = this.life>0;
						
					}
					
					state.first = true;
				}
				state.x = x;
				state.y = y;
				state.vel[0] = Math.random()*400 - 200;
				state.vel[1] = Math.random()*400 - 200;
				graphics.addToDisplay(state,'gl_main');
				ticker.add(state);
				physics.add(state);
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);

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
