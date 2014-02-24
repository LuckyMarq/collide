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
	