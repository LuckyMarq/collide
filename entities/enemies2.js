Entities.add('enemy',Entities.create({
	construct: function(state,x,y){
		var life = life || 100;
		state.scope = 1024;
		(function(){
			Object.defineProperties(fillProperties(state,Entities.createStandardCollisionState({},x,y,32,32,1)),{
					life:{
						get: function(){
							return life;
						},
						set: function(nLife){
							if(nLife<life)this.onDamage(life-nLife);
							life = nLife;
							if(life<=0){
								this.alive = false;
							}
						}
					},
					isEnemy:{
						value: true,
						writable: false
					},
					inActiveScope: {
						get: function(){
							var p = Entities.player.getInstance(0);
							return (p && pythag(p.cx-(this.x+this.width/2),p.cy-(this.y+this.height/2))<this.scope);
						},
						set: function(){}
					}
				})
		})();
		
		state.configure = function(config){
			this.life = config.life.value;
			this.damage = config.damage.value;
			if(config.size){
				this.width = config.size.value 
				this.height = config.size.value
			}else{
				this.width = config.width.value 
				this.height = config.height.value
			}
			if(config.minSmallHealth)this.minSmallHealth = config.minSmallHealth.value;
			if(config.maxSmallHealth)this.maxSmallHealth = config.maxSmallHealth.value;
			if(config.minMedHealth)this.minMedHealth = config.minMedHealth.value;
			if(config.maxMedHealth)this.maxMedHealth = config.maxMedHealth.value;
			if(config.minLargeHealth)this.minLargeHealth = config.minLargeHealth.value;
			if(config.minLargeHealth)this.maxLargeHealth = config.maxLargeHealth.value;
			this.healthSpeed = (config.healthSpeed) ? config.healthSpeed.value : 100;
			if(config.color){
				this.r = config.color.r.value;
				this.g = config.color.g.value;
				this.b = config.color.b.value;
				this.a = config.color.a.value;
			}
			if(config.burst){
				this.burst = true;
				this.burstNum = (config.burst.num) ? config.burst.num.value : 4;
				this.burstSize = (config.burst.size) ? config.burst.size.value : 24;
				this.burstLife = (config.burst.life) ? config.burst.life.value : 4;
				this.burstSpeed = (config.burst.speed) ? config.burst.speed.value : 200;
				this.burstDrag = (config.burst.drag) ? config.burst.drag.value : 0.1;
			}
			if(config.deathSound){
				this.deathSound = Sound.createSound(config.deathSound.buffer.value,false);
				this.deathSound.gain = config.deathSound.gain.value;
			}
			if(config.hitSound){
				this.hitSound = Sound.createSound(config.hitSound.buffer.value,false);
				this.hitSound.gain = config.hitSound.gain.value;
			}
			if(config.elasticity)this.elasticity = config.elasticity.value;
			if(config.drag)this.dragConst = config.drag.value;
			if(config.speed)this.speed = config.speed.value;
			if(config.acceleration)this.acceleration = config.acceleration.value;
			if(config.maxSpeed)this.maxSpeed = config.maxSpeed.value;
			if(config.impact)this.impact = config.impact.value;
		}
		
		state.onDamage = function(damage){};
		
		state.minSmallHealth = 0;
		state.maxSmallHealth = 0;
		
		state.minMedHealth = 0;
		state.maxMedHealth = 0;
		
		state.minLargeHealth = 0;
		state.maxLargeHealth = 0;
		
		state.healthSpeed = 0;
	},
	create:function(state,x,y){
		state.set(x,y,0,0,0,0);
		graphics.addToDisplay(state,'gl_main'); 
		physics.add(state);
	},
	destroy: function(state,reset){
		if(!reset){
			var smallHealth = Math.round(state.minSmallHealth + Math.random()*(state.maxSmallHealth-state.minSmallHealth));
			var medHealth = Math.round(state.minMedHealth + Math.random()*(state.maxMedHealth-state.minMedHealth));
			var largeHealth = Math.round(state.minLargeHealth + Math.random()*(state.maxLargeHealth-state.minLargeHealth));
			var cx = state.cx || state.x + state.width/2;
			var cy = state.cy || state.y + state.height/2;
			
			var theta = Math.PI*2/smallHealth
			var c = Math.cos(theta);
			var s = Math.sin(theta);
			var vx=state.healthSpeed,vy =0, u = 0, v =0;
			
			for(var i = 0; i< smallHealth; i++){
				u = vx; v = vy;
				vx = c*u - s*v;
				vy = s*u + c*v;
				Entities.health_small.newInstance(cx,cy,vx+state.vel[0],vy+state.vel[1]);
			}
			
			theta = Math.PI*2/medHealth
			c = Math.cos(theta);
			s = Math.sin(theta);
			
			for(var i = 0; i< medHealth; i++){
				u = vx; v = vy;
				vx = c*u - s*v;
				vy = s*u + c*v;
				Entities.health_med.newInstance(cx,cy,vx+state.vel[0],vy+state.vel[1]);
			}
			
			theta = Math.PI*2/largeHealth
			c = Math.cos(theta);
			s = Math.sin(theta);
			
			for(var i = 0; i< largeHealth; i++){
				u = vx; v = vy;
				vx = c*u - s*v;
				vy = s*u + c*v;
				Entities.health_large.newInstance(cx,cy,vx+state.vel[0],vy+state.vel[1]);
			}
			
			if(state.burst){
				Entities.shrink_burst.burst
					(
						state.burstNum,
						state.x+state.width/2,state.y+state.height/2,
						state.burstSize,state.burstSize,
						state.burstLife,
						state.burstSpeed,
						state.r,state.g,state.b,
						state.burstDrag,
						state.vel[0],state.vel[1]
					);
			}
			if(state.deathSound){
				state.deathSound.play(0)
			}
		}
		physics.remove(state);
		graphics.removeFromDisplay(state,'gl_main');
	}
}))

Entities.add('enemy_suicider',Entities.create({
		parent: Entities.enemy,
		construct: function(state){
			state.damage = 0;
			state.impact = 0;
			state.hitSound = Sound.createSound('player_hit');
			state.hitSound.gain = 0.1;
		},
		create: function(state){
		},
		update: function(state,delta){
			var p = Entities.player.getInstance(0);
			if(p && p.collision(state)){
				state.hitSound.play(0);
				state.minSmallHealth = 0;
				state.maxSmallHealth = 0;
				state.minMedHealth = 0;
				state.maxMedHealth = 0;
				state.minLargeHealth = 0;
				state.maxLargeHealth = 0;
				p.life -= state.damage;
				p.vel[0] += (state.vel[0]-p.vel[0])*state.impact;
				p.vel[1] += (state.vel[1]-p.vel[1])*state.impact
				state.alive = false;
			}
		}
	}
))

Entities.add('enemy_direct_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,this.r,this.g,this.b,1);
		}
		state.configure(configs.enemyValues.enemy_direct_suicider)
	},
	create: function(state){
		state.life = configs.enemyValues.enemy_direct_suicider.life.value;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			state.accelerateToward(p.cx-state.width/2,p.cy-state.height/2,Vector.getMag(state.vel)*2+100);
		}
	}
}));

Entities.add('enemy_direct_move_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillRect(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,Math.PI/4,this.r,this.g,this.b,this.a);
		}
		state.configure(configs.enemyValues.enemy_direct_move_suicider)
	},
	create: function(state){
		state.life = configs.enemyValues.enemy_direct_move_suicider.life.value;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			// state.moveToward(p.cx-state.width/2,p.cy-state.height/2,state.moveSpeed);
			state.accelerateToSpeed(Vector.getDir(p.cx-(state.x+state.width/2),p.cy-(state.y+state.height/2)),state.acceleration,state.acceleration,state.speed)
		}
	}
}));

//basically a projectile
Entities.add('enemy_meandering_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillTriangle(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,this.theta,this.r,this.g,this.b,this.a);
		}
		state.configure(configs.enemyValues.enemy_meandering_suicider)
	},
	create: function(state,x,y,speed,dir){
		var dir = dir || Math.PI*2*Math.random();
		state.vel[0] = speed || configs.enemyValues.enemy_meandering_suicider.speed.value;
		Vector.setDir(state.vel,state.vel,dir);
		state.life = configs.enemyValues.enemy_meandering_suicider.life.value;
	},
	update: function(state,delta){
		state.theta = Vector.getDir(state.vel)-Math.PI/2;
	}
}));

Entities.add('enemy_breaker_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillRect(this.x+this.width/2,this.y+this.height/2, 0, this.width,this.height,0,this.r,this.g,this.b,this.a)
			manager.fillRect(this.x+this.width/2,this.y+this.height/2, 0, this.width,this.height/8,0,1-this.r,1-this.g,1-this.b,this.a)
			manager.fillRect(this.x+this.width/2,this.y+this.height/2, 0, this.width/8,this.height,0,1-this.r,1-this.g,1-this.b,this.a)
		}
		state.configure(configs.enemyValues.enemy_breaker_suicider)
		state.breakSpeed = configs.enemyValues.enemy_breaker_suicider.breakSpeed.value;
	},
	create: function(state){
		state.life = configs.enemyValues.enemy_breaker_suicider.life.value;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			// state.moveToward(p.cx-state.width/2,p.cy-state.height/2,state.moveSpeed*(1-pythag(state.x + (state.width/2)-p.cx,state.y + (state.height/2) -p.cy)/state.scope));
			state.accelerateToSpeed(Vector.getDir(p.cx-(state.x+state.width/2),p.cy-(state.y+state.height/2)),1500,1500,state.speed)
		}
	},
	destroy: function(state,reset){
		if(!reset){
			var s = state.breakSpeed;
			Entities.enemy_breaker_suicider_part.newInstance(state.x,state.y, -s , -s);
			Entities.enemy_breaker_suicider_part.newInstance(state.x+state.width/2,state.y, s, -s)
			Entities.enemy_breaker_suicider_part.newInstance(state.x+state.width/2,state.y+state.height/2,s, s)
			Entities.enemy_breaker_suicider_part.newInstance(state.x,state.y+state.height/2, -s, s)
		}
	}
}));

Entities.add('enemy_breaker_suicider_part',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillRect(this.x+this.width/2,this.y+this.height/2, 0, this.width,this.height,0,1,0,1,1)
		}
		state.width = 24;
		state.height = 24;
		state.damage = 10;
		state.maxSmallHealth = 3;
		state.healthSpeed = 100;
		state.deathSound = Sound.createSound('direct_suicider_death',false);
		state.deathSound.gain = 0.1;
		state.moveSpeed= 500;
		state.accelMul = 50	;
		state.impact = 0.2;
		state.stunConst = 0.5;
		state.breakerSuiciderFirst = true;
	},
	create: function(state,x,y,vx,vy){
		state.life = 1;
		state.stun = 1;
		state.vel[0]=vx||0;
		state.vel[1]=vy||0;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			// state.moveToward(p.cx-state.width/2,p.cy-state.height/2,state.moveSpeed);
			state.accelerateToSpeed(Vector.getDir(p.cx-(state.x+state.width/2),p.cy-(state.y+state.height/2)),3000,3000,state.moveSpeed)
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(4,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,0,1,0.1,state.vel[0],state.vel[1]);
		}
	}
}));


	
