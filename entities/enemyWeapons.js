Entities.add('player_only_projectile',Entities.create(
	{
		construct: function(state,x,y){
			// fill the state with standard collision state properties
			// this adds the entity to the collision system
			fillProperties(state, Entities.createStandardCollisionState({},x,y,20,20,1.1));
			
			state.hitSound = Sound.createSound('player_hit');
			state.hitSound.gain = 0.1;
		},
		update: function(state,delta){
			state.time-=delta;
			if(state.time<=0){
				state.alive = false;
			}
			var p = Entities.player.getInstance(0);
			if(p.collision(state)){
				p.life -= state.damage;
				state.alive = false;
				state.hitSound.play(0);
			}
		},
		create: function(state,x,y){
			state.set(x,y,0,0,0,0);
			state.damage = 5;
			state.time = 1.7;
			physics.add(state);
			graphics.addToDisplay(state,'gl_main');
			state.isEnemyProjectile= true;
		},
		destroy: function(state){
			physics.remove(state);
			graphics.removeFromDisplay(state,'gl_main');
		}
	}
))

Entities.add('enemy_bullet', Entities.create(
	{
		parent: Entities.player_only_projectile,
		construct: function(state){
			state.z=0;
		},
		create: function(state,x,y,dir){
			state.set(x,y,0,0,0,0);
			state.c = Math.cos(dir);
			state.s = Math.sin(dir);
			state.speed = 800;
			state.vel[0] = state.speed*state.c;
			state.vel[1] = state.speed*state.s;
			Vector.setDir(state.vel,state.vel,dir);
		},
		update: function(state,delta){
			Entities.player_trail_particles.burst(state.x + state.width/2, state.y + state.height/2,state.width/2,1,0.2,1,0,0,32);
			Entities.player_trail_particles.newInstance(state.x + state.width/2, state.y + state.height/2,0.2,1,1,1,state.width);
		}
	}
))

Entities.add('enemy_bullet_part', Entities.create({
	parent: Entities.player_trail_particles,
	create: function(state,x,y,life,r,g,b,size){
		// state.x = state.x-size/2;
		// state.y = state.y-size/2;
		// state.width=size;
		// state.height=size;
	}
}));

Entities.enemy_bullet_part.burst = function(x,y,size,num,life,r,g,b,psize){
	for(var i = 0; i< num; i++){
		var t = Math.random()*(Math.PI*2);
		var rad = Math.pow(Math.random(),2)* size;
		this.newInstance(x+Math.cos(t)*rad,y+Math.sin(t)*rad,life,r,g,b,psize);
	}
}

Entities.add('enemyFollowBullet', Entities.create(
	{
		// create gets called when Entities.tempBullet.newInstace gets called
		// Parameters can change depending on need but must have state as an argument
		create: function(state,x,y){
			// destroy will be called when state.alive is false
			state.alive = true;
			state.time = 2; // temporary variable created to destroy the instance after 1 second
			
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
						manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,1,0,0,1);
					}
				// values for collision box (x,y,width,height,zindex?)
				},x,y,20,20,1.1));
				
				state.hitSound = Sound.createSound('player_hit');
				state.hitSound.gain = 0.1;
				// used to constantly update or check things or stuff fuckitslate
				state.tick = function(delta){
					this.time-=delta;
					//add collision
					if(p.collision(this) ){
						this.alive = false;
						p.life -= 15;
						this.hitSound.play(0);
					}
					if(this.time>0) {
						this.accelerateToward(p.cx, p.cy, 600);
					} else{
						this.alive = false;
					}
				}
				state.first = true;
			}
			// how to set initial values for the entity like vel or accel or xy
			// vel and accel have x and y components represented as indexes respectively 
			state.x = x;
			state.y = y;
			state.vel[0]=0;
			state.vel[1]=0;
			state.accel[0]=200;
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
	}
));

Entities.add('enemyTail', Entities.create(
	(function(){
		return {
			// create gets called when Entities.tempBullet.newInstace gets called
			// Parameters can change depending on need but must have state as an argument
			create: function(state,x,y){
				// destroy will be called when state.alive is false
				state.alive = true;
				state.time = 1.2; // temporary variable created to destroy the instance after 1 second
				var p = Entities.player.getInstance(0);
				state.isEnemyProjectile= true;
				
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
							manager.fillRect(this.x+this.width/2-10,this.y+this.height/2-10,0,this.width,this.height,0,.3,.3,.8,1);
						}
					// values for collision box (x,y,width,height,zindex?)
					},x,y,25,25,.9));
					
					state.hitSound = Sound.createSound('player_hit');
					state.hitSound.gain = 0.1;
					// used to constantly update or check things or stuff fuckitslate
					state.tick = function(delta){
						this.time-=delta;
						//add collision
						if(p.collision(this) ){
							this.alive = false;
							p.life -= 5;
							this.hitSound.play(0);
						}
						if(this.time>0) {
						} else{
						this.alive = false;
						}
					}
					state.first = true;
				}
				// how to set initial values for the entity like vel or accel or xy
				// vel and accel have x and y components represented as indexes respectively 
				state.x = x;
				state.y = y;
				state.vel[0]=0;
				state.vel[1]=0;
				state.accel[0]=200;
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