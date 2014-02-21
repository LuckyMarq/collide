Entities.add('weapon_pickup',Entities.create(
		{
			create: function(state,x,y,keyframe,weapon){
				if(!state.firstHealth){
					fillProperties(state,Entities.createStandardCollisionState(
							{
								draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
									var u;
									var p = Entities.player.getInstance(0);
									mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,1);
									mvMatrix.push()
									if(this.added){
										u = this.time/this.startTime;
										mvMatrix.scale(1+(30*(1-u)),1+(30*(1-u)),1);
										this.time-=delta;
									}
									p.animator.drawKeyframe(state.keyframe,gl,delta,screen,manager,pMatrix,mvMatrix);
									mvMatrix.pop();
									u = state.t/state.tm;
									mvMatrix.scale(1+((state.maxScale-1)*u),1+((state.maxScale-1)*u),1);
									p.animator.drawKeyframe(state.keyframe,gl,delta,screen,manager,pMatrix,mvMatrix,gl.LINE_LOOP,1,31);
									state.t+=delta;
									state.t%=state.tm;
								},
								z: 1
							},x,y,512,512,1));
					state.health = 1;
					state.pickupSound = Sound.createSound('health_small');
					state.pickupSound.gain = 0.1;
				}
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
	