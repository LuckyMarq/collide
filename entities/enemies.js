Entities.add('enemy_indirect_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillRect(this.x + this.width/2,this.y +this.height/2,0,this.width,this.height,0,.3,0,.7,1);
			}
			state.width = configs.enemyValues.enemyIndirectSuicider.width.value;
			state.height = configs.enemyValues.enemyIndirectSuicider.height.value;
			state.damage = configs.enemyValues.enemyIndirectSuicider.damage.value;
			state.minSmallHealth = configs.enemyValues.enemyIndirectSuicider.minSmallHealth.value;
			state.maxSmallHealth = configs.enemyValues.enemyIndirectSuicider.maxSmallHealth.value;
			state.minMedHealth = configs.enemyValues.enemyIndirectSuicider.minMedHealth.value;
			state.maxMedHealth = configs.enemyValues.enemyIndirectSuicider.maxMedHealth.value;
			state.minLargeHealth = configs.enemyValues.enemyIndirectSuicider.minMaxHealth.value;
			state.maxLargeHealth = configs.enemyValues.enemyIndirectSuicider.maxMaxHealth.value;
			state.healthSpeed = 100;
			state.deathSound = Sound.createSound('direct_suicider_death',false);
			state.deathSound.gain = 0.1;
			state.accelCap = 1000;
			state.maxSpeed= 800;
			state.accelMul = 75;
			state.impact = 0.2;
			state.moveSpeed = configs.enemyValues.enemyIndirectSuicider.speed.value;
			state.directSuiciderFirst = true;
		}
		var dir = Math.PI*2*Math.random();
		state.vel[0] = state.moveSpeed;
		Vector.setDir(state.vel,state.vel,dir);
		state.life = configs.enemyValues.enemyIndirectSuicider.life.value;
		state.range = configs.enemyValues.enemyIndirectSuicider.range.value;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			if( Math.abs(state.x -p.cx) < state.range && p.cy > state.y) {
				var dir = Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.x- p.cx) < state.range && p.cy < state.y) {
				var dir = Math.PI+ Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx > state.x) {
				var dir = Math.PI*2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx < state.x) {
				var dir = Math.PI;
				Vector.setDir(state.vel,state.vel,dir);
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,0,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));

Entities.add('enemy_indirect_tail',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,0,1,0,1);
			}
			state.width = 50;
			state.height = 50;
			state.damage = 10;
			state.maxSmallHealth = 10;
			state.healthSpeed = 100;
			state.deathSound = Sound.createSound('direct_suicider_death',false);
			state.deathSound.gain = 0.1;
			state.accelCap = 1000;
			state.maxSpeed= 800;
			state.accelMul = 75;
			state.impact = 0.2;
			state.moveSpeed = 200;
			state.directSuiciderFirst = true;
			state.delay = 0;
		}
		var dir = Math.PI*2*Math.random();
		state.vel[0] = state.moveSpeed;
		Vector.setDir(state.vel,state.vel,dir);
		state.life = 1;			
		state.range = 8;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			state.delay += delta;
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			if(state.delay >= .12) {
			Entities.enemyTail.newInstance(state.x + state.width/2, state.y+ state.height/2);
			state.delay = 0;
			}
			if( Math.abs(state.x -p.cx) < state.range && p.cy > state.y) {
				var dir = Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.x- p.cx) < state.range && p.cy < state.y) {
				var dir = Math.PI+ Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx > state.x) {
				var dir = Math.PI*2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx < state.x) {
				var dir = Math.PI;
				Vector.setDir(state.vel,state.vel,dir);
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,0,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));

Entities.add('enemy_turret',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.glInit= function(manager){
			if(!Entities.enemy_turret.initialized){
				manager.addArrayBuffer('turret_pos', true, [
				0.0,0.5,0.0,
				0.0,-0.5,0.0,
				1.0,-0.5,0.0,
				1.0,0.5,0.0					
				],4,3);
				Entities.enemy_turret.initialized = true;
			}
		}
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			this.t += delta;
			this.t %= 10;
			manager.fillRect(this.x+this.width/2,this.y+this.height/2, 0, this.width,this.height,0,1,1,1,1)
			mvMatrix.translate(this.x+this.width/2, this.y+this.height/2, -1);
			mvMatrix.rotateZ(this.theta)
			mvMatrix.scale(60,40,1);
			manager.bindProgram('noise');
			manager.setUniform1f('noise', 'time', this.t);
			manager.setArrayBufferAsProgramAttribute('turret_pos', 'noise', 'vertexPosition');
			manager.setMatrixUniforms('noise', pMatrix, mvMatrix.current);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}
		state.v = vec2.create();
		state.theta = 0;
		state.width = configs.enemyValues.enemy_turret.width.value;
		state.height = configs.enemyValues.enemy_turret.height.value;
		state.damage = configs.enemyValues.enemy_turret.damage.value;
		state.minSmallHealth = configs.enemyValues.enemy_turret.minSmallHealth.value;
		state.maxSmallHealth = configs.enemyValues.enemy_turret.maxSmallHealth.value;
		state.minMedHealth = configs.enemyValues.enemy_turret.minMedHealth.value;
		state.maxMedHealth = configs.enemyValues.enemy_turret.maxMedHealth.value;
		state.minLargeHealth = configs.enemyValues.enemy_turret.minMedHealth.value;
		state.maxLargeHealth = configs.enemyValues.enemy_turret.maxMedHealth.value;
		state.healthSpeed = 100;
		state.deathSound = Sound.createSound('direct_suicider_death',false);
		state.deathSound.gain = 0.1;
		state.accelCap = 1000;
		state.maxSpeed= .001;
		state.accelMul = .001;
		state.impact = 0.2;
		state.moveSpeed = .001;
		state.delay = 0;
		state.shotsound = Sound.createSound('pew');
		state.shotsound.gain = 0.1;
		state.rate = configs.enemyValues.enemy_turret.fireSpeed.value;
		state.t = 0;
	},
	create: function(state){
		state.life = configs.enemyValues.enemy_turret.life.value;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			state.delay += delta;
			var p = Entities.player.getInstance(0);
			state.theta = Vector.getDir(vec2.set(state.v, p.cx - (state.x+state.width/2),  p.cy - (state.y+state.height/2)));
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			if(state.delay >= state.rate) {
			Entities.enemyFollowBullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2);
			state.shotsound.play(0)
			state.delay = 0;
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,0,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));

Entities.add('enemy_shooter',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
		var p = Entities.player.getInstance(0);
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillTriangle(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,state.theta+Math.PI/2,1,1,0,1);
			}
			state.v = vec2.create();
			state.theta = 0;
			state.width =  configs.enemyValues.enemyShooter.width.value;
			state.height =  configs.enemyValues.enemyShooter.height.value;
			state.damage =  configs.enemyValues.enemyShooter.damage.value;
			state.minSmallHealth = configs.enemyValues.enemyShooter.minSmallHealth.value;
			state.maxSmallHealth = configs.enemyValues.enemyShooter.maxSmallHealth.value;
			state.minMedHealth = configs.enemyValues.enemyShooter.minMedHealth.value;
			state.maxMedHealth = configs.enemyValues.enemyShooter.maxMedHealth.value;
			state.minLargeHealth = configs.enemyValues.enemyShooter.minMedHealth.value;
			state.maxLargeHealth = configs.enemyValues.enemyShooter.maxMedHealth.value;
			state.healthSpeed = 100;
			state.deathSound = Sound.createSound('direct_suicider_death',false);
			state.deathSound.gain = 0.1;
			state.accelCap = 1000;
			state.maxSpeed= 800;
			state.accelMul = 75;
			state.impact = 0.2;
			state.moveSpeed = 800;
			state.directSuiciderFirst = true;
			state.delay = 0;
			state.shotsound = Sound.createSound('pew',false);
			state.shotsound.gain = 0.1;
			state.innerRadius =  configs.enemyValues.enemyShooter.innerRadius.value;
			state.outerRadius =  configs.enemyValues.enemyShooter.outerRadius.value;
			state.up = 1;
			state.right = 1;
			state.rate = configs.enemyValues.enemyShooter.fireSpeed.value;
		}
		state.life =  configs.enemyValues.enemyShooter.life.value;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			state.delay += delta;
			var p = Entities.player.getInstance(0);
			//change where enemy looks
			state.theta = Vector.getDir(vec2.set(state.v, state.x - p.cx, state.y - p.cy));
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			//movement
			//top
			if(state.y > p.cy){
			state.up = 1;
			}else{
			state.up = 0;
			}
			if(state.y < p.cy + state.innerRadius && state.up == 1){
				state.accelerateToward(state.x, state.y+100, state.moveSpeed);
			}else if(state.y > p.cy + state.outerRadius && state.up == 1){
				state.accelerateToward(state.x, state.y-100, state.moveSpeed);
			//down
			}else if(state.y > p.cy - state.innerRadius && state.up == 0){
				state.accelerateToward(state.x, state.y-100, state.moveSpeed);
			}else if(state.y < p.cy - state.outerRadius && state.up == 0){
				state.accelerateToward(state.x, state.y+100, state.moveSpeed);
			}
			
			if(state.x > p.cx){
			state.right = 1;
			}else{
			state.right = 0;
			}
			
			//right
			if(state.x < p.cx + state.innerRadius && state.right == 1){
				state.accelerateToward(state.x+100, state.y, state.moveSpeed);
			}else if(state.x > p.cx + state.outerRadius && state.right == 1){
				state.accelerateToward(state.x-100, state.y, state.moveSpeed);
			//left
			}else if(state.x > p.cx - state.innerRadius && state.right == 0){
				state.accelerateToward(state.x-100, state.y, state.moveSpeed);
			}else if(state.x < p.cx - state.outerRadius && state.right == 0){
				state.accelerateToward(state.x+100, state.y, state.moveSpeed);
			}
			
			//shooting
			if(state.delay >= state.rate) {
				Entities.enemy_bullet.newInstance(state.x + state.width/2, state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2) ,p.cy-(state.y + state.height/2)));
				state.shotsound.play(0)
				state.delay = 0;
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,1,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));


Entities.add('enemy_tank',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,state.r,state.g,state.b,1);
		}
		state.width = configs.enemyValues.enemyTank.width.value;
		state.shrink2 = configs.enemyValues.enemyTank.shrink2.value;
		state.shrink3 = configs.enemyValues.enemyTank.shrink3.value;
		state.shrink4 = configs.enemyValues.enemyTank.shrink4.value;
		state.height = configs.enemyValues.enemyTank.height.value;
		state.damage = configs.enemyValues.enemyTank.damage.value;
		state.minSmallHealth = configs.enemyValues.enemyTank.minSmallHealth.value;
		state.maxSmallHealth = configs.enemyValues.enemyTank.maxSmallHealth.value;
		state.minMedHealth = configs.enemyValues.enemyTank.minMedHealth.value;
		state.maxMedHealth = configs.enemyValues.enemyTank.maxMedHealth.value;
		state.minLargeHealth = configs.enemyValues.enemyTank.minMedHealth.value;
		state.maxLargeHealth = configs.enemyValues.enemyTank.maxMedHealth.value;
		state.healthSpeed = 100;
		state.deathSound = Sound.createSound('direct_suicider_death',false);
		state.deathSound.gain = 0.1;
		state.moveSpeed= 50;
		state.maxSpeed= configs.enemyValues.enemyTank.speed1.value;
		state.maxSpeed2= configs.enemyValues.enemyTank.speed2.value;
		state.maxSpeed3= configs.enemyValues.enemyTank.speed3.value;
		state.maxSpeed4= configs.enemyValues.enemyTank.speed4.value;
		state.accelMul = 50	;
		state.impact = 0.2;
		state.stunConst = 1;
		state.stun = 0;
		state.r = 0;
		state.g = 1;
		state.b = 1;
		state.scope = configs.enemyValues.enemyTank.scope.value;
		state.onDamage = function(damage){
			this.stun += damage*this.stunConst;
		}
	},
	create: function(state){
		state.life = configs.enemyValues.enemyTank.life.value;
		state.stun = 1;
	},
	update: function(state,delta){	
		if(state.life > 3 && state.life < 5){
			state.height = state.shrink2;
			state.width = state.shrink2;
			state.damage = 20;
			state.maxSpeed = state.maxSpeed2;
			state.r = .3;
			state.g = .6;
			state.b = .6;
		}else if(state.life > 1 && state.life < 3){
			state.height = state.shrink3;
			state.width = state.shrink3;
			state.damage = 15;
			state.maxSpeed = state.maxSpeed3;
			state.r = .8;
			state.g = .4;
			state.b = .4;
		}else if(state.life > 0 && state.life < 1){
			state.height = state.shrink4;
			state.width = state.shrink4;
			state.damage = 10;
			state.maxSpeed = state.maxSpeed4;
			state.r = 1;
			state.g = .2;
			state.b = .2;
		}
		if(state.stun>0){
			state.stun = Math.max(state.stun-delta,0);
		}else if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			state.moveToward(p.cx-state.width/2,p.cy-state.height/2,Vector.getMag(state.vel)*1.5+state.moveSpeed);
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(8,state.x+state.width/2,state.y+state.height/2,24,24,4,200,0.81,0.09,0.56,0.1,state.vel[0],state.vel[1]);
		}
	}
}));
