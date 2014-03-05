Entities.add('health_generic',Entities.create(
		{
			create: function(state,x,y,vx,vy){
				if(!state.firstHealth){
					fillProperties(state,Entities.createStandardCollisionState(
							{
								draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
									manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,0,1,0,1);
									gl.enable(gl.BLEND);
									gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
									manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,1,0,0.5);
									gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
								},
								z: 0
							},x,y,16,16,1));
					state.health = 1;
					state.dragConst = 0.4;
					state.pickupSound = Sound.createSound('health_small');
					state.pickupSound.gain = 0.1;
					state.firstHealth = true;
					state.pullRange = 512;
					state.moveRange = 128;
					state.pullMag = 1000;
					state.moveSpeed = 500;
				}
				state.set(x,y,vx || 0,vy || 0,0,0);
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
			},
			update: function(state){
				var p = Entities.player.getInstance(0);
				if(p.collision(state) && p.life<p.maxLife){
					p.life += state.health;
					state.alive = false;
				}else if(p.life<p.maxLife){
					var dist = pythag(state.x+state.width/2 - p.cx,state.y+state.height/2 - p.cy);
					if(dist<state.pullRange){
						if(dist<state.moveRange){
							state.moveToward(p.cx-state.width/2,p.cy-state.height/2,state.moveSpeed);
						}else{
							state.accelerateToward(p.cx-state.width/2,p.cy-state.height/2,state.pullMag*sqr(1-(dist/state.pullRange)));
						}
					}
				}	
			},
			destroy: function(state,reset){
				if(!reset) {
					state.pickupSound.play(0);
					Entities.shrink_burst.burst(8,state.x,state.y,state.width*.75,state.width*.75,3,50,0,1,0,0.1,state.vel[0],state.vel[1])
				}
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		}
		)
	);
	
//small health pickup
Entities.add('health_small',Entities.create(
		{
			parent: Entities.health_generic
		}
		)
	)

	
Entities.add('health_med',Entities.create(
	{
		parent: Entities.health_generic,
		create: function(state,x,y,vx,vy){
			if(!state.healthMed){
				state.width = 24;
				state.height = 24;
				state.health = 15;
				state.pickupSound = Sound.createSound('health_med');
				state.pickupSound.gain = 0.1;
				state.healthMed = true;
			}
		}
	}
	)
)

Entities.add('health_large',Entities.create(
	{
		parent: Entities.health_generic,
		create: function(state,x,y,vx,vy){
			if(!state.healthLarge){
				state.width = 32;
				state.height = 32;
				state.health = 25;
				state.pickupSound = Sound.createSound('health_large');
				state.pickupSound.gain = 0.1;
				state.healthLarge = true;
			}
		}
	}
	)
)

Entities.add('health_burst_frag',Entities.create(
	{
		create: function(state,x,y,size,life,vx,vy){
			if(!state.first){
				fillProperties(state,Entities.createStandardState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								this.alpha -=delta/this.life
								gl.enable(gl.BLEND);
								gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,1,0,0.5*this.alpha);
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,0,1,0,this.alpha);
								gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
							},
							width: size,
							height: size,
							z: 0
						},x,y));
			}
			state.alpha = 1;
			state.life = life || 1;
			state.set(x,y,vx || 0,vy || 0,0,0);
			graphics.addToDisplay(state,'gl_main');
			physics.add(state);
		},
		update:function(state,delta){
			state.life -= delta;
			if(state.life<=0){
				state.alive = false;
			}
		},
		destroy: function(state){
			graphics.removeFromDisplay(state,'gl_main');
			physics.remove(state);
		}
	}
	)
)

Entities.add('health_burst',Entities.create(
		{
			create: function(state,x,y,num,size,speed,life,vx,vy){
				for(var i = 0; i< num; i++ ){
					var theta = Math.random()*(Math.PI*2)
					Entities.health_burst_frag.newInstance(x,y,size,life,vx+Math.cos(theta)*speed,vy+Math.sin(theta)*speed)
				}
				state.alive = false;
			},
			destroy: function(state){
			}
		}
	)
)

Entities.add('weapon_pickup',Entities.create(
		{
			construct: function(state,x,y,keyframe, weapon){
				fillProperties(state,Entities.createStandardCollisionState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							var u;
							var p = Entities.player.getInstance(0);
							
							if(this.added){
								u = this.time/this.startTime;
								mvMatrix.translate(p.cx,p.cy,1)
								mvMatrix.scale(1+(30*(1-u)),1+(30*(1-u)),1);
								p.animator.drawKeyframe(this.keyframe,gl,delta,screen,manager,pMatrix,mvMatrix);
								this.time-=delta;
							}else{
								mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,1);
								mvMatrix.push()
								p.animator.drawKeyframe(this.keyframe,gl,delta,screen,manager,pMatrix,mvMatrix);
								mvMatrix.pop();
								u = Math.sin(Math.PI * (this.t/this.tm));
								mvMatrix.scale(1+((this.maxScale-1)*u),1+((this.maxScale-1)*u),1);
								p.animator.drawKeyframe(this.keyframe,gl,delta,screen,manager,pMatrix,mvMatrix,gl.LINE_LOOP,1,31);
								this.t+=delta;
								this.t%=this.tm;
							}
						},
						z: 1
					},x,y,512,512,1));
				state.pickupSound = Sound.createSound('health_small');
				state.pickupSound.gain = 0.1;
			},
			create: function(state,x,y,keyframe,weapon){
				state.maxScale = 10;
				state.tm = 1;
				state.t = 0;
				state.keyframe = keyframe;
				state.weapon = weapon;
				state.startTime =1;
				state.time =1;
				state.added = false;
				state.set(x,y, 0,0,0,0);
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
			},
			update: function(state){
				state.set(state.x,state.y,0,0,0,0);
				if(!state.added){
					var p = Entities.player.getInstance(0);
					if(p.collision(state.x + (state.width/2) - 32, state.y + (state.height/2) -32,64,64)){
						p.addWeapon(state.keyframe,state.weapon);
						state.added = true;
						state.boundless = true;
					}
				}
				if(state.time<=0)state.alive = false;
			},
			destroy: function(state,reset){
				if(!reset) {
					state.pickupSound.play(0);
				}
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		}
		)
	);

Entities.add('level_end',Entities.create(
	{
		construct: function(state,x,y){
			fillProperties(state,fillProperties(new GLDrawable(),{
				draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
					delta = (Date.now()-this.pTime)/1000;
					this.pTime = Date.now();
					this.t += delta*(this.period);
					if(!this.triggered){
						this.t %= 1;
						var td =1/this.num;
						for(var i = 0; i<this.num; i++){
							var c = i%3;
							var u = Math.max(0,1+Math.sin((Math.PI*2)*(this.t-(td*i))))
							mvMatrix.identity();
							mvMatrix.scale(u,u,1)
							manager.fillRect(this.x+this.width/2,this.y+this.height/2,-99,128,128,(i%2==0)?(Math.PI/2)*this.t+(td*i):-(Math.PI/2)*this.t+(td*i),(c==0)?1:0,(c==1)?1:0,(c==2)?1:0)
						}
					}else{
						var td =1/this.num;
						for(var i = 0; i<this.num; i++){
							var c = i%3;
							var u = Math.max(0,1+Math.sin((Math.PI*2)*((this.t)-(td*i))) - i + this.t)
							mvMatrix.identity();
							mvMatrix.scale(u,u,1)
							if(this.t>1){
								mvMatrix.scale(this.t,this.t,1)
							}
							manager.fillRect(this.x+this.width/2,this.y+this.height/2,-99,128,128,(i%2==0)?(Math.PI/2)*this.t+(td*i):-(Math.PI/2)*this.t+(td*i),(c==0)?1:0,(c==1)?1:0,(c==2)?1:0)
						}
						if(this.t>this.animationTime){
							this.alive = false;
						}
					}
				},
				pTime: Date.now(),
				width: 256,
				height:256,
				x: x,
				y: y,
				t:0,
				period: 1,
				num: 20,
				animationTime: 8,
				triggered: false,
				sound: Sound.createSound('victory_fanfare')
			}))
		},
		create: function(state,x,y){
			state.x = x;
			state.y = y;
			state.triggered = false;
			state.pTime = Date.now();
			graphics.addToDisplay(state,'gl_main');
		},
		update: function(state,delta){
			if(!state.triggered){
				var p = Entities.player.getInstance(0);
				if(p.collision(state)){
					state.triggered = true;
<<<<<<< HEAD
					state.sound.play(0);
					Loop.paused = true;
=======
					if(current_music){
						current_music.stop(0);
					}
					state.sound.play(0);
					Loop.paused = true;
					frozen = true;
>>>>>>> origin/master
				}
			}
		},
		destroy: function(state,reset){
			if(!reset){
				current_level++;
				Entities.reset();
				Entities.reset();
				graphics.removeFromDisplay(state,'gl_main');
				
				currentMap.rebuild();
				
				currentMap.init(Entities.player.getInstance());

				physics.setGeometry(currentMap.lines);
				Loop.paused = false;
			}
		}
	}
))

