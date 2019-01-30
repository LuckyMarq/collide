Entities.add('enemy_indirect_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state) {
		state.configure(configs.enemyValues.enemyIndirectSuicider);
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillRect(this.x + this.width/2,this.y +this.height/2,0,this.width,this.height,0,this.r,this.g,this.b,this.a);
		}
		state.accelCap = configs.enemyValues.enemyIndirectSuicider.accelCap.value;
		state.accelMul = configs.enemyValues.enemyIndirectSuicider.accelMul.value;
		state.range = configs.enemyValues.enemyIndirectSuicider.range.value;
	},
	create: function(state){
		state.life=configs.enemyValues.enemyIndirectSuicider.life.value;
		state.vel[0]=state.speed;
		Vector.setDir(state.vel,state.vel,Math.random()*(Math.PI*2))
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
	}
}));

Entities.add('enemy_indirect_tail',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillTriangle(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,state.theta-Math.PI/2,.5,.3,.5,1);
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
			state.moveSpeed = 400;
			state.directSuiciderFirst = true;
			state.delay = 0;
			state.v = vec2.create();
			state.theta = 0;
		}
		var dir = Math.PI*2;
		state.theta = dir;
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
			if(state.delay >= .1) {
			Entities.enemyTail.newInstance(state.x + state.width/2 -(Math.cos(state.theta)*20), state.y + state.height/2 -(Math.sin(state.theta)*20));
			state.delay = 0;
			}
			if( Math.abs(state.x -p.cx) < state.range && p.cy > state.y) {
				var dir = Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
				state.theta = dir;
			}else if(Math.abs(state.x- p.cx) < state.range && p.cy < state.y) {
				var dir = Math.PI+ Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
				state.theta = dir;
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx > state.x) {
				var dir = Math.PI*2;
				Vector.setDir(state.vel,state.vel,dir);
				state.theta = dir;
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx < state.x) {
				var dir = Math.PI;
				Vector.setDir(state.vel,state.vel,dir);
				state.theta = dir;
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,.5,.3,.5,0.1,state.vel[0],state.vel[1]);
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
			manager.fillRect(this.x+this.width/2,this.y+this.height/2, 0, this.width,this.height,0,this.r,this.g,this.b,this.a)
			mvMatrix.translate(this.x+this.width/2, this.y+this.height/2, -1);
			mvMatrix.rotateZ(this.theta)
			mvMatrix.scale(60,40,1);
			manager.bindProgram('noise');
			manager.setUniform1f('noise', 'time', this.t);
			manager.setArrayBufferAsProgramAttribute('turret_pos', 'noise', 'vertexPosition');
			manager.setMatrixUniforms('noise', pMatrix, mvMatrix.current);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
			
			mvMatrix.identity();
			mvMatrix.translate(this.x+this.width/2, this.y+this.height/2, -1);
			mvMatrix.scale(40,40,1);
			manager.setArrayBufferAsProgramAttribute('primitive_circle', 'noise', 'vertexPosition');
			manager.setMatrixUniforms('noise', pMatrix, mvMatrix.current);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 16);
		}
		state.configure(configs.enemyValues.enemy_turret)
		state.v = vec2.create();
		state.theta = 0;
		state.maxSpeed= .001;
		state.delay = 0;
		state.shotsound = Sound.createSound(configs.enemyValues.enemy_turret.shotSound.buffer.text);
		state.shotsound.gain = configs.enemyValues.enemy_turret.shotSound.gain.value;
		state.rate = configs.enemyValues.enemy_turret.fireSpeed.value;
		state.rate2 = configs.enemyValues.enemy_turret.fireSpeed.value + configs.enemyValues.enemy_turret.fireSpread.value;
		state.rate3 = configs.enemyValues.enemy_turret.fireSpeed.value + configs.enemyValues.enemy_turret.fireSpread.value*2;
		state.t = 0;
		state.scope = 1024*1.3;
	},
	create: function(state){
		state.life = configs.enemyValues.enemy_turret.life.value;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			state.delay += delta;
			state.delay2 += delta;
			state.delay3 += delta;
			var p = Entities.player.getInstance(0);
			state.theta = Vector.getDir(vec2.set(state.v, p.cx - (state.x+state.width/2),  p.cy - (state.y+state.height/2)));
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			if(state.delay >= state.rate) {
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2) ,p.cy-(state.y + state.height/2)));
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2)+80 ,p.cy-(state.y + state.height/2)+80));
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2)-80 ,p.cy-(state.y + state.height/2)-80));
				state.shotsound.play(0);
				state.delay = 0;
			}
			if(state.delay2 >= state.rate2) {
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2) ,p.cy-(state.y + state.height/2)));
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2)+100 ,p.cy-(state.y + state.height/2)+100));
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2)-100 ,p.cy-(state.y + state.height/2)-100));
				state.shotsound.play(0);
				state.delay2 = state.delay;
			}
			if(state.delay3 >= state.rate3) {
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2) ,p.cy-(state.y + state.height/2)));
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2)+120 ,p.cy-(state.y + state.height/2)+120));
				Entities.enemy_bullet.newInstance((Math.cos(state.theta)*40)+state.x + state.width/2, (Math.sin(state.theta)*40)+state.y + state.height/2,Vector.getDir(p.cx-(state.x + state.width/2)-120 ,p.cy-(state.y + state.height/2)-120));
				state.shotsound.play(0);
				state.delay2 = state.delay;
				state.delay3 = state.delay;
			}
		}else{
		state.delay = 0;
		state.delay2 = 0;
		state.delay3 = 0;
		}
	},
	destroy: function(state,reset){
	}
}));

Entities.add('enemy_shooter',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		var p = Entities.player.getInstance(0);
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillTriangle(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,state.theta+Math.PI/2,this.r,this.g,this.b,this.a);
		}
		state.configure(configs.enemyValues.enemyShooter)
		state.v = vec2.create();
		state.theta = 0;
		state.directSuiciderFirst = true;
		state.delay = 0;
		state.shotsound = Sound.createSound(configs.enemyValues.enemy_turret.shotSound.buffer.text);
		state.shotsound.gain = configs.enemyValues.enemy_turret.shotSound.gain.value;
		state.innerRadius =  configs.enemyValues.enemyShooter.innerRadius.value;
		state.outerRadius =  configs.enemyValues.enemyShooter.outerRadius.value;
		state.up = 1;
		state.right = 1;
		state.rate = configs.enemyValues.enemyShooter.fireSpeed.value;
	},
	create: function(state){
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
				state.accelerateToward(state.x, state.y+100, state.speed);
			}else if(state.y > p.cy + state.outerRadius && state.up == 1){
				state.accelerateToward(state.x, state.y-100, state.speed);
			//down
			}else if(state.y > p.cy - state.innerRadius && state.up == 0){
				state.accelerateToward(state.x, state.y-100, state.speed);
			}else if(state.y < p.cy - state.outerRadius && state.up == 0){
				state.accelerateToward(state.x, state.y+100, state.speed);
			}
			
			if(state.x > p.cx){
			state.right = 1;
			}else{
			state.right = 0;
			}
			
			//right
			if(state.x < p.cx + state.innerRadius && state.right == 1){
				state.accelerateToward(state.x+100, state.y, state.speed);
			}else if(state.x > p.cx + state.outerRadius && state.right == 1){
				state.accelerateToward(state.x-100, state.y, state.speed);
			//left
			}else if(state.x > p.cx - state.innerRadius && state.right == 0){
				state.accelerateToward(state.x-100, state.y, state.speed);
			}else if(state.x < p.cx - state.outerRadius && state.right == 0){
				state.accelerateToward(state.x+100, state.y, state.speed);
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
	}
}));


Entities.add('enemy_tank',Entities.create({
	parent: Entities.enemy_suicider,
	construct: function(state){
		state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,state.r,state.g,state.b,1);
		}
		state.configure(configs.enemyValues.enemyTank)
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

