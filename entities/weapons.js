
// RocketWeapon -- 
function RocketWeapon(){
	var rocketConfig = configs.weaponValues.rocket;
	this.boundless = true;
	this.barVisible = false;
	var time = 0;
	this.energy = 100;
	var COST = rocketConfig.cost.value;
	var RECHARGE_RATE = rocketConfig.rechargeRate.value;
	var vis = false;
	var p = Entities.player.getInstance(0);
	var dir = {0:0, 1:0, length:2};	
	var sound = Sound.createSound('rocket_fire');
	sound.gain = 0.1;
	
	this.tick =function (delta) {
		if (time > 0)
			time-=delta;
		if (!vis) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
		}
	}
	
	this.fire = function() {
		if (time <= 0 && this.energy >= COST) {
			this.energy -= COST;
			vis = true;
			time = rocketConfig.rof.value;
			dir[0] = mouse.x - p.cx;
			dir[1] = mouse.yInv - p.cy;
			Entities.rocket.newInstance(rocketConfig,p.cx,p.cy, dir);
			sound.play(0);
		}
	};
	
	this.holdFire = function() {
		vis = false;
	};

}
RocketWeapon.prototype = new GLDrawable();

// Rocket -- 
Entities.add('rocket', Entities.create(
	(function(){
		var damage = 0;
		var speed = 1000;
		var buffered = false;
		var interp = getInverseExponentInterpolator(2);
		var blastForce = 800;
		return {
			construct: function(state,x,y,dir){
				damage = configs.weaponValues.rocket.damage.value;
				speed = configs.weaponValues.rocket.speed.value;
				blastForce = configs.weaponValues.rocket.force.value;
				fillProperties(state, Entities.createStandardCollisionState(
					{
						glInit: function(manager)
						{
							if (!buffered)
							{
								this.animator.glInit(manager);
								buffered = true;
							}
						},
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							mvMatrix.translate(this.x+this.width/2, this.y+this.height/2, 0);
							mvMatrix.rotateZ(this.theta);
							this.animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
						}
					},x,y,configs.weaponValues.rocket.width.value,configs.weaponValues.rocket.height.value,1));
					
					state.onCollision = function() {
						if(this.delay<=0)this.alive = false;
					}
					
					state.animator = new VertexAnimator("basic", 
						{
						rocketColor: 
							fillProperties([
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1
							],
							{
								attributeId: "vertexColor",
								items: 6,
								itemSize: 4
							}), 
						rocketPosition: 
							fillProperties([
								0,0,0,
								0,16,0,
								-16,-16,0,
								0,8,0,
								16,-16,0,
								0,16,0
							],
							{
								attributeId: "vertexPosition",
								items: 6,
								itemSize: 3
							})
						},
						{},6);
						
					state.animator.addKeyframe("slim", 
						{
						rocketColor: 
							fillProperties([
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1
							],
							{
								attributeId: "vertexColor",
								items: 6,
								itemSize: 4
							}), 
						rocketPosition: 
							fillProperties([
								0,0,0,
								0,16,0,
								-8,-16,0,
								0,0,0,
								8,-16,0,
								0,16,0
							],
							{
								attributeId: "vertexPosition",
								items: 6,
								itemSize: 3
							})
						},
						{},6);
						
					state.animator.addKeyframe("fat", 
						{
						rocketColor: 
							fillProperties([
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1
							],
							{
								attributeId: "vertexColor",
								items: 6,
								itemSize: 4
							}), 
						rocketPosition: 
							fillProperties([
								0,0,0,
								0,16,0,
								-16,-16,0,
								0,-4,0,
								16,-16,0,
								0,16,0
							],
							{
								attributeId: "vertexPosition",
								items: 6,
								itemSize: 3
							})
						},
						{},6);
			},
			create: function(state,rocketConfig,x,y,dir){
				state.alive = true;
				state.fuse = rocketConfig.fuse.value;
				state.theta = Vector.getDir(dir) - Math.PI / 2;
				state.delay = 0.1;
				state.a = []; // array for collision check
				state.sound = Sound.createSound('explosion_fire');
				state.sound.gain = 0.1;
				state.animator.setCurrentKeyframe("fat",0);
				state.animator.setCurrentKeyframe("slim", state.delay);
				state.set(x,y,0,0,0,0)
				state.width = rocketConfig.width.value;
				state.height = rocketConfig.height.value;
				state.dir = Vector.getDir(dir);
				graphics.addToDisplay(state,'gl_main');
				ticker.add(state);
				physics.add(state);
				state.vel[0] = Math.cos(state.dir)*speed;
				state.vel[1] = Math.sin(state.dir)*speed;
			},
			update: function(state,delta){
				state.a.length = 0;
				state.fuse-=delta;
				state.delay -= delta;
				if (state.fuse<=0)
				{
					state.alive = false;
				}	
				state.a.length = 0;
				var enemies = physics.getColliders(state.a, state.x,
					state.y, state.width, state.height);
				for (var i = 0; i < enemies.length; i++){
					var e = enemies[i];
					if (e.isEnemy && Collisions.boxBox(state.x,state.y,state.width,state.height,e.x,e.y,e.width,e.height)){
						state.alive = false;
						i = enemies.length;
					}
				}
			},
			destroy: function(state){
				state.sound.play(0);
				Entities.explosion_basic.newInstance(state.x + state.width/2 - 64, state.y + state.height/2 - 64,128,0,damage,0,blastForce, interp);
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);

// MineWeapon -- 
function MineWeapon(){
	var mineConfig = configs.weaponValues.mine;
	this.boundless = true;
	this.barVisible = false;
	var time = 0;
	this.energy = 100;
	var COST = mineConfig.cost.value;
	var RECHARGE_RATE = mineConfig.rechargeRate.value;
	var vis = false;
	var time = 0;
	var p = Entities.player.getInstance(0);
	var sound = Sound.createSound('mine_fire');
	sound.gain = 0.1;
	
	this.tick=function (delta) {
		if (time > 0)
			time-=delta;
		if (!vis) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
		}
	}
	
	this.fire = function() {
		if (time <= 0 && this.energy >= COST) {
			vis = true;
			this.energy -= COST;
			sound.play(0);
			Entities.mine.newInstance(mineConfig,p.cx,p.cy);
			time = mineConfig.rof.value;
		}
	};
	
	this.holdFire = function() {
		vis = false;
	};
}
MineWeapon.prototype = new GLDrawable();

// Mine -- 
Entities.add('mine', Entities.create(
	(function(){
		var damage = 0;
		var blastForce = 800;
		var interp = getInverseExponentInterpolator(2);
		var vec = vec2.create();		
		var sound = Sound.createSound('explosion_fire');
		sound.gain = 0.2;
		return {
			create: function(state,mineConfig,x,y){
				damage = mineConfig.damage.value;
				blastForce = mineConfig.force.value;
				state.alive = true;
				state.time = mineConfig.fuse.value;
				state.a = []; // array for collision check
				state.blastbox = new Box(x - 25, y - 25, 50, 50);
				
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
		//			{
		//				draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
		//					manager.fillRect(this.x+this.width/2,this.y+this.height/2,0,mineConfig.width.value,mineConfig.height,0,.5,1,.5,1);
		//				}
		//			},x,y,mineConfig.width.value,mineConfig.height.value,1.1));
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillRect(this.x+this.width/2,this.y+this.height/2,0,16,16,0,.5,1,.5,1);
						}
					},x,y,16,16,1.1));
					
					state.first = true;
				}
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
				Entities.explosion_basic.newInstance(state.x + state.width/2 - 64,state.y + state.height/2 - 64,128,0,damage,0,blastForce, interp);
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		};
	})())
);

// WaveWeapon -- 
function WaveWeapon(){
	var waveConfig = configs.weaponValues.wave;
	this.boundless = true;
	this.energy = 100;
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
	
//	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
//		if (vis) {
//			mvMatrix.push();
//			theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
//			mvMatrix.rotateZ(theta + Math.PI / 2);
//			manager.fillTriangle(p.cx + (Math.cos(theta)*(length/2)),p.cy+(Math.sin(theta)*(length/2)),0,thickness,length,0,0.6,0,1,1);
//			mvMatrix.pop();
//		}
//	};
	this.fire = function() {
		if (!hasPressed && this.energy>=COST) {
			hasPressed = true;
			sound.play(0);
			theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
			Entities.wave.newInstance(p.cx,p.cy,p.width,theta,radius);
			this.energy -= COST;
			vis = true;
			// check for enemies
			var enemies = physics.getColliders(a, p.cx - radius, p.cy - radius, radius*2, radius*2);
			newA = true;
			if (enemies.length > 1) {
				for (var i = 0; i < a.length; i++) {
					if (a[i] != p)
					{
						var dist = Math.sqrt(Math.pow(a[i].x - p.cx,2) + Math.pow(a[i].y - p.cy,2));
						if (dist < radius) {
							var eAngle = Vector.getDir(vec2.set(evec, a[i].x - p.cx, a[i].y - p.cy));
							if ((eAngle > theta && eAngle < wAngle + theta) || 
								(eAngle - 2*Math.PI < theta && eAngle - 2*Math.PI > -wAngle + theta) ||
								((eAngle > theta - 2*Math.PI && eAngle < wAngle + theta - 2*Math.PI) || 
								(eAngle - 2*Math.PI < theta - 2*Math.PI && eAngle - 2*Math.PI > -wAngle + theta - 2*Math.PI))) {					
								Vector.setMag(evec, evec, 1);
								a[i].vel[0] = evec[0] * mag;
								a[i].vel[1] = evec[1] * mag;
								if(a[i].life)a[i].life -= damage;
							}
						}
					}
				}
			}
		} else {
			vis = false;
		}
	};
	this.holdFire = function() {
		vis = false;
		hasPressed = false;
	};
	this.boundless = true;
	
	this.tick = function(delta) {
		if (!vis) {
			if (this.energy < 100 && !Loop.paused)
				this.energy+=RECHARGE_RATE;
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
	
	// graphics.addToDisplay(this, 'gl_main');
}
WaveWeapon.prototype = new GLDrawable();


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
	this.fire = function() {
		if (this.energy >= COST && !this.overheated) {
			this.energy -= COST;
			if (!sound.playing) 
				sound.play(0);
			vis = true;
			hits.length = 0;
		
			var traceResult = physics.rayTrace(hits,p.cx,p.cy,mouse.x,mouse.yInv);
			if (traceResult.length > 3) {
				for (var i = 1; i < traceResult.length -2; i++) {
					traceResult[i].accelerateToward(p.cx, p.cy, force * 3/i);
					traceResult[i].life -= damage * 1/i;
				}
			}
			verts.length = 0
			verts = physics.getCone(verts,p.cx,p.cy,mouse.x,mouse.yInv,theta);
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