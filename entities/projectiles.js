Entities.add('projectile', Entities.create(
	(function(){
		var configure = function(config){
			if(config.size){
				this.width = config.size.value;
				this.height = config.size.value;
			}else{
				this.width = config.width.value;
				this.height = config.height.value;
			}
			this.destroyOnContact = true;
			this.fuseStart = (config.fuse) ? config.fuse.value : 1;
			this.damage = (config.damage) ? config.damage.value : 10;
			this.speed = (config.speed) ? config.speed.value : 300;
			if(config.acceleration)this.acceleration=config.acceleration;
			if(config.decceleration)this.decceleration=config.decceleration;
			if(config.explosion){
				this.explosion = {};
				this.explosion.radius = config.explosion.radius.value;
				this.explosion.damage = config.explosion.damage.value;
				this.explosion.force = config.explosion.force.value;
				this.explosion.interp = config.explosion.interp.value;
				if(config.explosion.sound){
					this.explosion.sound = Sound.createSound(config.explosion.sound.name.text);
					this.explosion.sound.gain = config.explosion.sound.gain.value;
				}else{
					this.explosion.sound = Sound.createSound('explosion_fire');
					this.explosion.sound.gain = 0.1;
				}
			}
		}
		return{
			construct: function(state,x,y,dir){
				fillProperties(state, Entities.createStandardCollisionState({},x,y,16,16,1));
				
				state.configure = configure;
				state.doHitCheck = true;
				state.doHitDamage = true;
			},
			create: function(state,x,y,dir){
				state.x = x;
				state.a = [];
				state.y = y;
				state.dir = dir;
				state.vel[0] = Math.cos(dir)*state.speed;
				state.vel[1] = Math.sin(dir)*state.speed;
				if(state.acceleration){
					state.accel[0] = Math.cos(dir)*state.acceleration.speed.value;
					state.accel[1] = Math.sin(dir)*state.acceleration.speed.value;
				}
				state.fuse = state.fuseStart;
				state.explode = false;
				state.hasCollided = false;
				physics.add(state);
				graphics.addToDisplay(state,'gl_main');
			},
			update: function(state,delta){
				state.a = [];	
				state.fuse -= delta;
				if (state.fuse < 0) state.alive = false;
				
				if(state.decceleration){
					if (state.vel[0] != 0) {
						if (state.vel[0] < 0) {
							state.vel[0] += Math.abs(delta*Math.cos(state.dir)*state.decceleration.speed.value);
							if (state.vel[0] > 0) {
								state.vel[0] = 0;
							}
						}
						if (state.vel[0] > 0) {
							state.vel[0] -= Math.abs(delta*Math.cos(state.dir)*state.decceleration.speed.value);
							if (state.vel[0] < 0) {
								state.vel[0] = 0;
							}
						}
					}
					if (state.vel[1] != 0) {
						if (state.vel[1] < 0) {
							state.vel[1] += Math.abs(delta*Math.sin(state.dir)*state.decceleration.speed.value);
							if (state.vel[1] > 0) {
								state.vel[1] = 0;
							}
						}
						if (state.vel[1] > 0) {
							state.vel[1] -= Math.abs(delta*Math.sin(state.dir)*state.decceleration.speed.value);
							if (state.vel[1] < 0) {
								state.vel[1] = 0;
							}
						}
					}
				}
				
				if(state.doHitCheck){
					var enemies = physics.getColliders(state.a, state.x,state.y,state.width,state.height);
					for (var i = 0; i < enemies.length; i++) {
						var e = enemies[i];
						if (e.isEnemy && Collisions.boxBox(state.x,state.y,state.width,state.height,e.x,e.y,e.width,e.height)){
							if(state.destroyOnContact) state.alive = false;
							state.x = state.px || 0;
							state.y = state.py || 0;
							i = enemies.length;
							if(state.doHitDamage)e.doDamage(state.damage,((this.playerProjectile)?Entities.player.getInstance():null));
							state.hasCollided = true;
							state.collidedWith = e;
						}
					}
				}
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
				if(state.explosion && state.explode){
					state.explosion.sound.play(0);
					Entities.explosion_basic.newInstance(
						state.x + state.width/2 - state.explosion.radius/2, state.y + state.height/2 - state.explosion.radius/2,
						state.explosion.radius,0,state.explosion.damage,0,state.explosion.force, state.explosion.interp,((this.playerProjectile)?Entities.player.getInstance():null))
				}
			}
		}
	})())
);

//Rocket -- 
Entities.add('rocket', Entities.create(
	(function(){
		var buffered = false;
		return {
			parent: Entities.projectile,
			construct: function(state,x,y,dir){
				state.configure(configs.weaponValues.rocket);
				
				var sizew = configs.weaponValues.rocket.width.value;
				var sizeh = configs.weaponValues.rocket.height.value;
				
				state.glInit = function(manager){
					if (!buffered) {
						this.animator.glInit(manager);
						buffered = true;
					}
				}
				state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
					mvMatrix.translate(this.x+this.width/2, this.y+this.height/2, 0);
					mvMatrix.rotateZ(this.theta);
					this.animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
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
							0,sizeh,0,
							-sizew,-sizew,0,
							0,sizeh/2,0,
							sizew,-sizew,0,
							0,sizeh,0
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
							0,sizeh,0,
							-sizew/2,-sizeh/2,0,
							0,0,0,
							sizew/2,-sizeh/2,0,
							0,sizeh,0
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
							0,sizeh,0,
							-sizew,-sizeh,0,
							0,-sizeh/4,0,
							sizew,-sizeh,0,
							0,sizeh,0
						],
						{
							attributeId: "vertexPosition",
							items: 6,
							itemSize: 3
						})
					},
					{},6);
					
					
				state.onCollision = function() {
					this.alive = false;
				}
				
				state.playerProjectile = true;
			},
			create: function(state,x,y,dir){
				state.alive = true;
				state.theta = dir-(Math.PI/2);
				state.explode = true;
				state.animator.setCurrentKeyframe("fat",0);
				state.animator.setCurrentKeyframe("slim", state.delay);
			}
		};
	})())
);

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
						enemies[i].doDamage(damage,Entities.player.getInstance());
					}
				}
			},
			destroy: function(state){
				sound.play(0);
				var enemies = physics.getColliders(state.a, state.blastbox.x, state.blastbox.y, state.blastbox.width, state.blastbox.height);
				Entities.explosion_basic.newInstance(state.x + state.width/2 - state.blastRadius/2,state.y + state.height/2 - state.blastRadius/2,state.blastRadius,0,damage,0,blastForce, interp,Entities.player.getInstance());
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		};
	})())
);

// Black Hole -- 
Entities.add('blackhole', Entities.create(
	(function(){
		var buffered = false;
		var verts = [];
		var alpha = [];
		var t = 10;
		return {
			parent: Entities.projectile,
			construct: function(state,x,y,dir){
				state.z = 0;
				state.configure(configs.weaponValues.blackHole);
				state.destroyOnContact = false;
				state.theta = 0;
				state.sound_charge = Sound.createSound('blackhole_charge');
				state.sound_active = Sound.createSound('blackhole_active');
				var sizew = configs.weaponValues.blackHole.width.value;
				var sizeh = configs.weaponValues.blackHole.height.value;
				state.glInit = function(manager)
				{
					if (!buffered){
						var color = [];
						color.push(1,1,1,1)
						for(var i = 0; i<15; i++){
							color.push(1,1,1,0)
						}
						manager.addArrayBuffer('blackhole_frag_color',true,color,16,4);
					
						verts.push(0,0,0);
						alpha.push(1);
						for (var i = 0; i < 6; i++) {
							verts.push(sizew*Math.cos(i*2*Math.PI/6),sizeh*Math.sin(i*2*Math.PI/6),0.0);
							alpha.push(0);
						}
						verts.push(sizew,0,0.0);
						alpha.push(0);
						manager.addArrayBuffer("hexagon_pos",true,verts,8,3);
						manager.addArrayBuffer('hexagon_alpha',true,alpha,8,1);
						buffered = true;
					}
				}
				state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
					if (state.collided) {
						manager.bindProgram('basic');
						manager.setArrayBufferAsProgramAttribute('primitive_circle_fan','basic','vertexPosition');
						manager.setArrayBufferAsProgramAttribute('blackhole_frag_color','basic','vertexColor');
						manager.setUniform1f('basic','alpha',1);
						mvMatrix.rotateZ(-1*state.theta);
						mvMatrix.scale(state.scale,state.scale,1);
						state.scale += delta*20;
						mvMatrix.translate(state.x+state.width/2,state.y+state.height/2,state.z);
						mvMatrix.scale(state.width,state.height,1);
						manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current);
						gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
						gl.drawArrays(gl.TRIANGLE_FAN,0,16);
					} else {
						gl.enable(gl.BLEND);
						gl.blendFunc(gl.SRC_ALPHA,gl.DST_ALPHA);
						manager.bindProgram("noise_alpha");
						mvMatrix.rotateZ(state.theta);
						mvMatrix.translate(state.x+state.width/2,state.y+state.height/2,this.z);
						manager.setUniform1f("noise_alpha","time",t);
						manager.setArrayBufferAsProgramAttribute("hexagon_pos","noise_alpha","vertexPosition");
						manager.setArrayBufferAsProgramAttribute("hexagon_alpha","noise_alpha","alpha");
						manager.setMatrixUniforms('noise_alpha',pMatrix,mvMatrix.current);
						gl.drawArrays(gl.TRIANGLE_FAN,0,8);
						t%=10;
						t++;
					}
				}
		
				state.onCollision = function() {
					this.alive = true;
				}
				
			},
			create: function(state,x,y,dir){
				state.isBlackhole=true;
				state.collided = false;
				state.alive = true;
				state.radius = configs.weaponValues.blackHole.blastRadius.value;
				state.force = -1*configs.weaponValues.blackHole.force.value;
				state.theta = dir-(Math.PI/2);
				state.activate = false;
				state.explode = false;
				state.delay = configs.weaponValues.blackHole.delay.value;
				state.sound_charge.gain = 0;
				state.sound_active.gain = 0.01;
				state.scale = 1;
				state.forcesEnabled = false;
				state.factor = 1;
				state.doHitCheck = false;
			},
			update: function(state,delta) {
				state.theta = (state.theta-4*delta) % (2*Math.PI)
				// apply forces
				//if (state.activate) {
					physics.getColliders(state.a,state.x,state.y,state.width,state.height);
					for (var i = 0; i < state.a.length; i++) {
						var b = state.a[i];
						if (b != state && !b.isEnemy) {
							if (b.isBlackhole && b.activate && Collisions.boxBox(state.x,state.y,state.width,state.height,b.x,b.y,b.width,b.height)){
								state.explode = true;
								b.explode = true;
								if (!state.collided) {
									state.collided = true;
									b.collided = true;
									state.delay = configs.weaponValues.blackHole.pause.value;
									b.delay = configs.weaponValues.blackHole.pause.value;
								}
							}
						}
					}
					
					state.factor += delta;
					physics.createGravityWell(state.x+state.width/2,state.y+state.height/2,2*state.radius,state.force,0);
					state.sound_active.play(0);
				//}
				if (state.delay <= 0) {
					state.activate = true;
					if (state.collided) {
						state.alive = false;
						state.sound_charge.stop(0);
					}
				} else {
					state.delay -= delta;
					if (state.collided) {
						if (state.sound_charge.gain < 0.4)state.sound_charge.gain += delta;
						//console.log(state.sound_charge.gain);
						state.sound_active.gain = 0;
						state.sound_active.stop(0);
						if (!state.sound_charge.playing)state.sound_charge.play(0);
					}
				}
			}
		};
	})())
);

// Boomerang -- 
Entities.add('boomerang', Entities.create(
	(function(){
		var buffered = false;
		var verts = [];
		var color = [];
		return {
			parent: Entities.projectile,
			construct: function(state,x,y,dir,amt,follow){
				state.configure(configs.weaponValues.boomerang);
				var sizew = configs.weaponValues.boomerang.width.value;
				var sizeh = configs.weaponValues.boomerang.height.value;
				state.range = configs.weaponValues.boomerang.range.value;
				state.sound_bounce = Sound.createSound('boomerang_bounce');
				state.sound_bounce.gain = 0.2;
				state.destroyOnContact = false;
				state.playerProjectile = true;
				state.glInit = function(manager) {
					if (!buffered) {
						var alt = false;
						verts.push(0,0,0);
						color.push(1,0.5,0,1);
						for (var i = 0; i < 8; i++) {
							color.push(1,0.5,0,1);
							alt = !alt;
							if (alt) {
								verts.push(sizew*Math.cos(i*2*Math.PI/8),sizeh*Math.sin(i*2*Math.PI/8),0.0);
							}
							else {
								verts.push(sizew/3*Math.cos(i*2*Math.PI/8),sizeh/3*Math.sin(i*2*Math.PI/8),0.0);
							}
						}
						verts.push(sizew,0,0);
						color.push(1,0.5,0,1);
						manager.addArrayBuffer('boomerang_pos', true, verts, 10, 3);
						manager.addArrayBuffer('boomerang_color',true, color, 10, 4);
						buffered = true;
					}
				}
				
				state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
					manager.bindProgram('basic');
					mvMatrix.rotateZ(state.theta);
					mvMatrix.translate(state.x+state.width/2,state.y+state.height/2,0);
					manager.setArrayBufferAsProgramAttribute('boomerang_pos','basic','vertexPosition');
					manager.setArrayBufferAsProgramAttribute('boomerang_color','basic','vertexColor');
					manager.setMatrixUniforms('basic',pMatrix,mvMatrix.current);
					gl.drawArrays(gl.TRIANGLE_FAN,0,10);
				}
									
				state.onCollision = function() {
					//state.amt--;
				}
			},
			create: function(state,x,y,dir,amt){
				state.alive = true;
				state.theta = dir-(Math.PI/2);
				state.amt = amt;
				state.famt = amt;
				state.theta = 0;
				state.e = null;
				state.locked = false;
				state.doHitDamage = true;
				state.firstHit = true;
			},
			update: function(state,delta) {
				state.theta = (state.theta + 4*delta) % (2*Math.PI);
				
				if (state.hasCollided) {
					if(state.firstHit){
						state.fuse = state.fuseStart;
						state.firstHit = false;
						state.doHitDamage = false;
					}
					if (state.e != null && state.locked) {
						state.moveToward(state.e.x,state.e.y,state.speed);
					} else {
						var distance = 99999;
						var enemies = physics.getColliders(state.a, state.x+state.width/2-state.range/2,state.y+state.width/2-state.range/2,state.range,state.range);
						for (var i = 0; i < enemies.length; i++) {
							var e = enemies[i];
							if (e.isEnemy) {
								var u = Math.sqrt(Math.pow(e.x+e.width/2-state.x+state.width/2,2) + Math.pow(e.y+e.height/2-state.y+state.height/2,2));
								if (u < distance && state.e != e) {
									distance = u;
									state.e = e;
									state.locked = true;
								}
							}
						}
					}
				}
				
				if (state.hasCollided && state.e != null && Collisions.boxBox(state.x,state.y,state.width,state.height,state.e.x,state.e.y,state.e.width,state.e.height)){
					state.amt--;
					state.locked = false;
					state.fuse = state.fuseStart;
					state.sound_bounce.play(0);
					state.e.doDamage(state.damage,Entities.player.getInstance())
				}
				if (state.amt <= 0) {
					state.alive = false;
				}
			},
			destroy: function(state){
				//console.log(state.amt);
			}
		};
	})())
);

// Disk ---
Entities.add('disk', Entities.create(
	(function(){
		//var sound = Sound.createSound('explosion_fire');
		//sound.gain = 0.2;
		var p;
		return {
			parent: Entities.projectile,
			construct: function(state,x,y) {
				state.configure(configs.weaponValues.disk);
				var sizew = configs.weaponValues.disk.width.value;
				var sizeh = configs.weaponValues.disk.height.value;
				state.destroyOnContact = false;
				p = Entities.player.getInstance(0);
				state.glInit = function(manager){};
				
				state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
				console.log("draw");
					manager.fillEllipse(p.cx,p.cy,0,state.width,state.height,0,1,1,1,1);
				};
			},
			create: function(state,x,y){
				state.explode = true;
				state.alive = true;
			},
			update:function(state,delta){
			// todo
				// var enemies = physics.getColliders(state.a, state.x, state.y, state.width, state.height);
// 				for(var i = 0; i<enemies.length; i++){
// 					if(enemies[i].isEnemy && Collisions.boxBox(state.x,state.y,state.width,state.height,enemies[i].x,enemies[i].y,enemies[i].width,enemies[i].height)){
// 						state.alive = false;
// 						enemies[i].doDamage(damage,Entities.player.getInstance());
// 					}
// 				}
			},
			destroy: function(state){
				//sound.play(0);
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		};
	})())
);