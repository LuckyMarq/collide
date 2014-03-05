
// RocketWeapon -- 
function RocketWeapon(){
	var rocketConfig = configs.weaponValues.rocket;
	this.boundless = true;
	var time = 0;
	this.energy = 100;
<<<<<<< HEAD
	var COST = rocketConfig.cost.value;
	var RECHARGE_RATE = rocketConfig.rechargeRate.value;
	var vis = false;
=======
	this.overheated = false;
	var COST = rocketConfig.cost.value;
	var RECHARGE_RATE = rocketConfig.rechargeRate.value;
>>>>>>> origin/master
	var p = Entities.player.getInstance(0);
	var sound = Sound.createSound('rocket_fire');
	sound.gain = 0.1;
<<<<<<< HEAD
=======
	var firing = false;
>>>>>>> origin/master
	
	this.tick =function (delta) {
		if (time > 0)
			time-=delta;
<<<<<<< HEAD
		if (!vis) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
=======
		if ((!firing || this.overheated) && this.energy < 100 && !Loop.paused)
			this.energy+=RECHARGE_RATE;
		if (this.energy < 0) {
			this.overheated = true;
			this.energy = 0;
		}
		if (this.energy >= 100) {
			this.overheated = false;
>>>>>>> origin/master
		}
	}
	
	this.fire = function(dir) {
<<<<<<< HEAD
		if (time <= 0 && this.energy >= COST) {
			this.energy -= COST;
			vis = true;
			time = rocketConfig.rof.value;
			Entities.rocket.newInstance(rocketConfig,p.cx,p.cy, dir);
=======
		firing = true;
		if (time <= 0 && !this.overheated) {
			this.energy -= COST;
			time = rocketConfig.rof.value;
			Entities.rocket.newInstance(p.cx,p.cy, dir);
>>>>>>> origin/master
			sound.play(0);
		}
	};
	
	this.holdFire = function() {
		firing = false;
	};

}
<<<<<<< HEAD
RocketWeapon.prototype = new GLDrawable();
=======
RocketWeapon.prototype = {};
>>>>>>> origin/master

// MineWeapon -- 
function MineWeapon(){
	var mineConfig = configs.weaponValues.mine;
	this.boundless = true;
	this.barVisible = false;
	var time = 0;
	this.energy = 100;
	var COST = mineConfig.cost.value;
	var RECHARGE_RATE = mineConfig.rechargeRate.value;
<<<<<<< HEAD
	var vis = false;
=======
>>>>>>> origin/master
	var time = 0;
	var p = Entities.player.getInstance(0);
	var sound = Sound.createSound('mine_fire');
	sound.gain = 0.1;
<<<<<<< HEAD
=======
	var firing = false;
>>>>>>> origin/master
	
	this.tick=function (delta) {
		if (time > 0)
			time-=delta;
<<<<<<< HEAD
		if (!vis) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
		}
	}
	
	this.fire = function(dir) {
		if (time <= 0 && this.energy >= COST) {
			vis = true;
=======
		if ((!firing || this.overheated) && this.energy < 100 && !Loop.paused)
			this.energy+=RECHARGE_RATE;
		if (this.energy < 0) {
			this.overheated = true;
			this.energy = 0;
		}
		if (this.energy >= 100) {
			this.overheated = false;
		}
	}
	
	this.fire = function(dir) {
		firing = true;
		if (time <= 0 && !this.overheated) {
>>>>>>> origin/master
			this.energy -= COST;
			sound.play(0);
			Entities.mine.newInstance(mineConfig,p.cx,p.cy);
			time = mineConfig.rof.value;
		}
	};
	
	this.holdFire = function() {
		firing = false;
	};
}
<<<<<<< HEAD
MineWeapon.prototype = new GLDrawable();

// Mine -- 
Entities.add('mine', Entities.create(
	(function(){
		var damage = 0;
		var blastForce = 800;
		var interp = getInverseExponentInterpolator(0.5);
		var vec = vec2.create();		
		var sound = Sound.createSound('explosion_fire');
		sound.gain = 0.2;
		return {
			construct: function(state,x,y) {
				damage = configs.weaponValues.mine.damage.value;
				blastForce = configs.weaponValues.mine.force.value;
				
				fillProperties(state, Entities.createStandardState(
					{
					draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
						manager.fillRect(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,.5,1,.5,1);
					}
				},x,y,configs.weaponValues.mine.width,configs.weaponValues.mine.height,1.1));
				
			},
			create: function(state,mineConfig,x,y){
				state.width = mineConfig.width.value;
				state.height = mineConfig.height.value;
				state.blastRadius = mineConfig.blastRadius.value;
				state.alive = true;
				state.time = mineConfig.fuse.value;
				state.a = []; // array for collision check
				state.blastbox = new Box(x - state.width/2, y - state.width/2, state.width, state.width);
				state.x = x - state.width/2;
				state.y = y - state.height/2;
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
			},
			update:function(state,delta){
				state.time-=delta;
				state.alive = state.time>0;
				var enemies = physics.getColliders(state.a, state.x, state.y, state.width, state.height);
				for(var i = 0; i<enemies.length; i++){
					if(enemies[i].isEnemy && Collisions.boxBox(state.x,state.y,state.width,state.height,enemies[i].x,enemies[i].y,enemies[i].width,enemies[i].height)){
						state.alive = false;
						enemies[i].life -= damage;
					}
				}
			},
			destroy: function(state){
				sound.play(0);
				var enemies = physics.getColliders(state.a, state.blastbox.x, state.blastbox.y, state.blastbox.width, state.blastbox.height);
				for (var e in enemies) {
					e = enemies[e];
					vec2.set(vec, e.x - state.x, e.y - state.y);
					Vector.setMag(vec, vec, 1);
					if (e.life && state.blastbox.collision(e)) { // add player damage
						e.life -= damage;
						if (e.life > 0) {
							e.vel[0] += vec[0] * blastForce;
							e.vel[1] += vec[1] * blastForce;
						}
					}
				}
				Entities.explosion_basic.newInstance(state.x + state.width/2 - state.blastRadius/2,state.y + state.height/2 - state.blastRadius/2,state.blastRadius,0,damage,0,blastForce, interp);
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		};
	})())
);
=======
MineWeapon.prototype = {};
>>>>>>> origin/master

// WaveWeapon -- 
function WaveWeapon(){
	var waveConfig = configs.weaponValues.wave;
	this.boundless = true;
	this.energy = 100;
<<<<<<< HEAD
=======
	this.overheated = false;
>>>>>>> origin/master
	var COST = waveConfig.cost.value;
	var RECHARGE_RATE = waveConfig.rechargeRate.value;
	var vis = false;
	var p = Entities.player.getInstance(0);
	var damage = waveConfig.damage.value;
	var vec = vec2.create();
	var theta = 0;
	var radius = waveConfig.radius.value;

	var sound = Sound.createSound('wave_fire');
	sound.gain = 0.1;

	var mag = waveConfig.force.value;
	var wAngle = 50 * Math.PI/180;
	var eAngle = 0;
	var evec = vec2.create();
	
	var hasPressed = false;
	
	var newA = true;
	var a = [];
	
	this.fire = function(dir) {
<<<<<<< HEAD
		if (!hasPressed && this.energy>=COST) {
=======
		if (!hasPressed && !this.overheated) {
>>>>>>> origin/master
			hasPressed = true;
			sound.play(0);
			theta = dir;
			Entities.wave.newInstance(p.cx,p.cy,p.width,theta,radius);
			this.energy -= COST;
			vis = true;
			// check for enemies
			var enemies = physics.getColliders(a, p.cx - radius, p.cy - radius, radius*2, radius*2);
			newA = true;
			if (enemies.length > 1) {
				for (var i = 0; i < a.length; i++) {
					var enemy = a[i];
					var inRange = false;
					var dist = Math.sqrt(Math.pow(enemy.x - p.cx,2) + Math.pow(enemy.y - p.cy,2));
					if (dist < radius) {
						var eAngle = Vector.getDir(vec2.set(evec, enemy.x - p.cx, enemy.y - p.cy));
						if ((eAngle > theta && eAngle < wAngle + theta) || 
							(eAngle - 2*Math.PI < theta && eAngle - 2*Math.PI > -wAngle + theta) ||
							((eAngle > theta - 2*Math.PI && eAngle < wAngle + theta - 2*Math.PI) || 
							(eAngle - 2*Math.PI < theta - 2*Math.PI && eAngle - 2*Math.PI > -wAngle + theta - 2*Math.PI))) {					
								
							inRange = true;
						}
					}
<<<<<<< HEAD
					if (!inRange && Collisions.boxBox(p.cx-radius,p.cy-radius,radius*2,radius*2,enemy.x,enemy,y,enemy.width,enemy.height)) {
=======
					if (!inRange && Collisions.boxBox(p.cx-radius,p.cy-radius,radius*2,radius*2,enemy.x,enemy.y,enemy.width,enemy.height)) {
>>>>>>> origin/master
						
						var x = Math.cos(theta - wAngle/2) * radius;
						var y = Math.sin(theta - wAngle/2) * radius;
						if ((Collisions.lineLine(p.cx, p.cy, x, y,enemy.x,enemy.y,enemy.x,enemy.y+enemy.height)) ||
							(Collisions.lineLine(p.cx, p.cy, x, y,enemy.x,enemy.y,enemy.x+enemy.width,enemy.y)) ||
							(Collisions.lineLine(p.cx, p.cy, x, y,enemy.x+enemy.width,enemy.y+enemy.height,enemy.x+enemy.width,enemy.y)) ||
							(Collisions.lineLine(p.cx, p.cy, x, y,enemy.x+enemy.width,enemy.y+enemy.height,enemy.x,enemy.y+enemy.height))) {
						
							inRange = true;
						}
							
						x = Math.cos(theta + wAngle/2) * radius;
						y = Math.sin(theta + wAngle/2) * radius;
						if ((Collisions.lineLine(p.cx, p.cy, x, y,enemy.x,enemy.y,enemy.x,enemy.y+enemy.height)) ||
							(Collisions.lineLine(p.cx, p.cy, x, y,enemy.x,enemy.y,enemy.x+enemy.width,enemy.y)) ||
							(Collisions.lineLine(p.cx, p.cy, x, y,enemy.x+enemy.width,enemy.y+enemy.height,enemy.x+enemy.width,enemy.y)) ||
							(Collisions.lineLine(p.cx, p.cy, x, y,enemy.x+enemy.width,enemy.y+enemy.height,enemy.x,enemy.y+enemy.height))) {
							
							inRange = true;	
						}
					}
					if (inRange) {
						Vector.setMag(evec, evec, 1);
						if(enemy.isEnemy) {
							enemy.vel[0] = evec[0] * mag;
							enemy.vel[1] = evec[1] * mag;
							enemy.life -= damage;
						}
					}
				}
			}
		} else {
			vis = false;
			if (this.energy < 0) {
				this.overheated = true;
				this.energy = 0;
			}
		}
	};
	this.holdFire = function() {
		vis = false;
		hasPressed = false;
	};
	this.boundless = true;
	
	this.tick = function(delta) {
<<<<<<< HEAD
		if (!vis) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
=======
		if (!vis || this.overheated) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
			if (this.energy >= 100) {
				this.overheated = false;
				this.energy = 100;
			}
>>>>>>> origin/master
		}
		
		damagePer = delta;
			
		if (newA){	
			for (var i = 0; i < a.length; i++) {
				a[i].accel[0] = 0;
				a[i].accel[1] = 0;
			}
			newA = false;
		}
	}
}
WaveWeapon.prototype = {};

// Wave -- 
Entities.add('wave',Entities.create({
	construct: function(state,x,y,dir){
		var angle = 50 * Math.PI/180;
		fillProperties(state,fillProperties(new GLDrawable(),
		{
			glInit: function(manager){
				if(!Entities.wave.initialized){
					var color = new Array();
					var verts = new Array();
					verts.push(0,0,0);
					var dt = angle/15;
					var theta = -(angle/2);
					verts.push()
					for(var i = 0; i<15; i++){
						verts.push(0.5*Math.cos(theta +  dt*i),0.5*Math.sin(theta +  dt*i),0)
					}
					color.push(0,0,0,0);
					for(var i = 0; i<15; i++){
						color.push(0,0,1,1);
					}
					manager.addArrayBuffer("wave_pos",true,verts,16,3)
					manager.addArrayBuffer("wave_col",true,color,16,4)
					Entities.wave.initialized = true
				}
			},
			draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
				var p = Entities.player.getInstance(0);
				this.t += delta;
				manager.bindProgram('basic');
				manager.setArrayBufferAsProgramAttribute('wave_pos','basic','vertexPosition');
				manager.setArrayBufferAsProgramAttribute('wave_col','basic','vertexColor');
				manager.setUniform1f('basic','alpha',1)
				mvMatrix.translate(p.cx,p.cy,this.z);
				var s = this.width + (this.length-this.width)*Math.min(1,(this.t/this.time));
				mvMatrix.scale(s,s,1);
				mvMatrix.rotateZ(this.dir);
				manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current);
				
				gl.enable(gl.BLEND)
				gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
				gl.drawArrays(gl.TRIANGLE_FAN,0,16);
				
				if(this.t>(this.time+0.05)){
					this.alive = false;
				}
			},
			time: 0.1,
			z:0,
			boundless: true,
		}))
	},
	create: function(state,x,y,size,dir,length){
		state.t = 0;
		state.x = x;
		state.y = y;
		state.size = size;
		state.length = length*2;
		state.dir = dir;
		graphics.addToDisplay(state,'gl_main');
	},
	destroy: function(state,reset){
		if(reset)this.initialized = false
		graphics.removeFromDisplay(state,'gl_main');
	}
}))


Entities.add('wave',Entities.create({
	construct: function(state,x,y,dir){
		var angle = 50 * Math.PI/180;
		fillProperties(state,fillProperties(new GLDrawable(),
		{
			glInit: function(manager){
				if(!Entities.wave.initialized){
					var color = new Array();
					var verts = new Array();
					verts.push(0,0,0);
					var dt = angle/15;
					var theta = -(angle/2);
					verts.push()
					for(var i = 0; i<15; i++){
						verts.push(0.5*Math.cos(theta +  dt*i),0.5*Math.sin(theta +  dt*i),0)
					}
					color.push(0,0,0,0);
					for(var i = 0; i<15; i++){
						color.push(0,0,1,1);
					}
					manager.addArrayBuffer("wave_pos",true,verts,16,3)
					manager.addArrayBuffer("wave_col",true,color,16,4)
					Entities.wave.initialized = true
				}
			},
			draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
				var p = Entities.player.getInstance(0);
				this.t += delta;
				manager.bindProgram('basic');
				manager.setArrayBufferAsProgramAttribute('wave_pos','basic','vertexPosition');
				manager.setArrayBufferAsProgramAttribute('wave_col','basic','vertexColor');
				manager.setUniform1f('basic','alpha',1)
				mvMatrix.translate(p.cx,p.cy,this.z);
				var s = this.width + (this.length-this.width)*Math.min(1,(this.t/this.time));
				mvMatrix.scale(s,s,1);
				mvMatrix.rotateZ(this.dir);
				manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current);
				
				gl.enable(gl.BLEND)
				gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
				gl.drawArrays(gl.TRIANGLE_FAN,0,16);
				
				if(this.t>(this.time+0.05)){
					this.alive = false;
				}
			},
			time: 0.1,
			z:0,
			boundless: true,
		}))
	},
	create: function(state,x,y,size,dir,length){
		state.t = 0;
		state.x = x;
		state.y = y;
		state.size = size;
		state.length = length*2;
		state.dir = dir;
		graphics.addToDisplay(state,'gl_main');
	},
	destroy: function(state,reset){
		if(reset)this.initialized = false
		graphics.removeFromDisplay(state,'gl_main');
	}
}))

// BeamWeapon --
function BeamWeapon(){
	var beamConfig = configs.weaponValues.beam;
	this.boundless = true;
	this.barVisible = false;
	this.energy = 100;
	var COST = beamConfig.cost.value;
	var RECHARGE_RATE = beamConfig.rechargeRate.value;
	var vis = false;
	this.overheated = false;
	var p = Entities.player.getInstance(0);
	var damage = beamConfig.damage.value;
	var force = beamConfig.force.value;
	var vec = vec2.create();
	var theta = 0;
	var dt = 1;
	var t = 0;
	var t2 = 10;
	var length = beamConfig.length.value;
	var verts = 
				[0.0, 0.0, 0.0,
				 0.0, 0.0, 0.0,
				 0.0, 0.0, 0.0];
	var v = vec2.create();
	var hits = [];
	var sound = Sound.createSound('beam_fire', true);
	sound.gain = 0.1;	
	
	this.glInit = function(manager){
		manager.addArrayBuffer("beam",false,verts,3,3)
	}
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		if (vis) {
			manager.setArrayBuffer("beam",false,verts,verts.length/3,3);
			manager.bindProgram("noise");
			manager.setUniform1f("noise","time",t2);
			manager.setArrayBufferAsProgramAttribute("beam","noise","vertexPosition");
			manager.setMatrixUniforms('noise',pMatrix,mvMatrix.current);
			gl.drawArrays(gl.TRIANGLE_FAN,0,verts.length/3);
			t2%=10;
			t2++;
			hits.length = 0;
			physics.rayTraceLine(hits,p.cx,p.cy,mouse.x,mouse.yInv);
		}
	};
	this.fire = function(dir) {
		if (this.energy >= COST && !this.overheated) {
			this.energy -= COST;
			if (!sound.playing) 
				sound.play(0);
			vis = true;
			hits.length = 0;
		
			var traceResult = physics.rayTrace(hits,p.cx,p.cy,p.cx+Math.cos(dir),p.cy+Math.sin(dir));
			if (traceResult.length > 3) {
				for (var i = 1; i < traceResult.length -2; i++) {
					traceResult[i].accelerateToward(p.cx, p.cy, force * 3/i);
					traceResult[i].life -= dt * damage * 1/i;
				}
			}
			verts.length = 0
			verts = physics.getCone(verts,p.cx,p.cy,p.cx+Math.cos(dir),p.cy+Math.sin(dir),theta);
			theta = (0.01) + (0.005 *Math.sin(t));
			t+=Math.PI*2/60
			t%=Math.PI*2;
		} else {
			sound.stop(0);
			vis = false;
			this.overheated = true;
		}
	};
	
	this.boundless = true;
	this.holdFire = function() {
		if (sound.playing)
			sound.stop(0);
		vis = false;
		theta = 0;
	}
	
	this.tick = function (delta) {
		dt = delta;
		if (!vis || this.overheated) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
			if (this.energy >= 100) {
				this.overheated = false;
				this.energy = 100;
			}
		}
	}

	graphics.addToDisplay(this, 'gl_main');
}
BeamWeapon.prototype = new GLDrawable();

<<<<<<< HEAD
=======
// Black Hole Emitter
function BlackHoleWeapon() {
	var bhConfig = configs.weaponValues.blackHole;
	this.boundless = true;
	var time = 0;
	this.energy = 100;
	this.overheated = false;
	var COST = bhConfig.cost.value;
	var RECHARGE_RATE = bhConfig.rechargeRate.value;
	var p = Entities.player.getInstance(0);	
	var sound = Sound.createSound('rocket_fire'); // TODO: change sound
	sound.gain = 0.1;
	var firing = false;
	
	this.tick =function (delta) {
		if (time > 0)
			time-=delta;
		if ((!firing || this.overheated) && this.energy < 100 && !Loop.paused)
			this.energy+=RECHARGE_RATE;
		if (this.energy < 0) {
			this.overheated = true;
			this.energy = 0;
		}
		if (this.energy >= 100) {
			this.overheated = false;
		}
	}
	
	this.fire = function(dir) {
		firing = true;
		if (time <= 0 && !this.overheated) {
			this.energy -= COST;
			time = bhConfig.rof.value;
			Entities.blackhole.newInstance(p.cx,p.cy,dir);
			sound.play(0);
		}
	};
	
	this.holdFire = function() {
		firing = false;
	};
}
BlackHoleWeapon.prototype = {}; 

// Boomerang Weapon
function BoomerangWeapon() {
	var boomConfig = configs.weaponValues.boomerang;
	this.boundless = true;
	this.energy = 100;
	this.overheated = false;
	var RECHARGE_RATE = boomConfig.rechargeRate.value;
	var COST = boomConfig.cost.value;
	var p = Entities.player.getInstance(0);	
	var sound = Sound.createSound('rocket_fire'); // TODO: change sound
	sound.gain = 0.1;
	var firing = false;
	var direction;
	var amt = 0; // how many targets to bounce off of
	var maxTargets = boomConfig.maxTargets.value;
	
	this.glInit = function(manager){
		
	};
	
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		// some cool effect
		if (firing) {
			var m = Math.round(amt);
			if (m > maxTargets) m = maxTargets;
			if (m != 0) {
				var theta = 2*Math.PI/m;
				for (var i = 0; i < m; i++) {
					manager.fillRect(p.cx + Math.cos(i*theta)*32,p.cy + Math.sin(i*theta)*16,0,32,8,i*theta,1,0,0,1);
				}
			}
		}
	};
	
	this.tick =function (delta) {
		if (firing) {
			amt += delta*2;
			if (amt < maxTargets)
				this.energy -= delta * COST;
		}
		if ((!firing || this.overheated) && this.energy < 100 && !Loop.paused)
			this.energy+=RECHARGE_RATE;
		if (this.energy < 0) {
			this.overheated = true;
			this.energy = 0;
		}
		if (this.energy >= 100) {
			this.overheated = false;
		}
	}
	
	this.fire = function(dir) {
		if (!firing && !this.overheated) {
			firing = true;
			//sound.play(0);
		}
	};
	
	this.holdFire = function() {
		if (firing) {
			direction = (Math.PI*2)-Vector.getDir(mouse.x-p.cx,mouse.y-p.cy);
			if (amt > maxTargets)
				amt = maxTargets;
			else
				amt = Math.round(amt);
			if (amt >= 1) 
				Entities.boomerang.newInstance(p.cx,p.cy,direction,amt,false);
		}
		firing = false;
		amt = 0;
	};
	graphics.addToDisplay(this, 'gl_main');
}
BoomerangWeapon.prototype = new GLDrawable();
>>>>>>> origin/master
