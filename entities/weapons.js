
// RocketWeapon -- 
function RocketWeapon(){
	var rocketConfig = configs.weaponValues.rocket;
	this.boundless = true;
	var time = 0;
	this.energy = 100;
	this.overheated = false;
	var COST = rocketConfig.cost.value;
	var RECHARGE_RATE = rocketConfig.rechargeRate.value;
	var p = Entities.player.getInstance(0);
	var sound = Sound.createSound('rocket_fire');
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
			time = rocketConfig.rof.value;
			Entities.rocket.newInstance(p.cx,p.cy, dir);
			sound.play(0);
		}
	};
	
	this.holdFire = function() {
		firing = false;
	};

}
RocketWeapon.prototype = new GLDrawable();

// MineWeapon -- 
function MineWeapon(){
	var mineConfig = configs.weaponValues.mine;
	this.boundless = true;
	this.barVisible = false;
	var time = 0;
	this.energy = 100;
	var COST = mineConfig.cost.value;
	var RECHARGE_RATE = mineConfig.rechargeRate.value;
	var time = 0;
	var p = Entities.player.getInstance(0);
	var sound = Sound.createSound('mine_fire');
	sound.gain = 0.1;
	var firing = false;
	
	this.tick=function (delta) {
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
			sound.play(0);
			Entities.mine.newInstance(mineConfig,p.cx,p.cy);
			time = mineConfig.rof.value;
		}
	};
	
	this.holdFire = function() {
		firing = false;
	};
}
MineWeapon.prototype = new GLDrawable();

// WaveWeapon -- 
function WaveWeapon(){
	var waveConfig = configs.weaponValues.wave;
	this.boundless = true;
	this.energy = 100;
	this.overheated = false;
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
		if (!hasPressed && !this.overheated) {
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
					if (!inRange && Collisions.boxBox(p.cx-radius,p.cy-radius,radius*2,radius*2,enemy.x,enemy,y,enemy.width,enemy.height)) {
						
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
		if (!vis || this.overheated) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
			if (this.energy >= 100) {
				this.overheated = false;
				this.energy = 100;
			}
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
WaveWeapon.prototype = new GLDrawable();

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
	var sound = Sound.createSound('rocket_fire');
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
BlackHoleWeapon.prototype = new GLDrawable(); 