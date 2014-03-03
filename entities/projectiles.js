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
				
				physics.add(state);
				graphics.addToDisplay(state,'gl_main');
			},
			update: function(state,delta){
				state.a = [];	
				state.fuse -= delta;
				if (state.fuse < 0) state.alive = false;
				
				if(state.decceleration){
					if ((state.vel[0] < 20 && state.vel[0] > -20)) {
						state.vel[0] = 0;
					}
					if ((state.vel[1] < 20 && state.vel[1] > -20)) {
						state.vel[1] = 0;
					}
					if (state.vel[0] != 0) {
						if (state.vel[0] < 0) {
							state.vel[0] += Math.abs(delta*Math.cos(state.dir)*state.decceleration.speed.value);
							
						} else if (state.vel[0] > 0) {
							state.vel[0] -= Math.abs(delta*Math.cos(state.dir)*state.decceleration.speed.value);
						}
					}
					if (state.vel[1] != 0) {
						if (state.vel[1] < 0) {
							state.vel[1] += Math.abs(delta*Math.sin(state.dir)*state.decceleration.speed.value);
						} else if (state.vel[0] > 0) {
							state.vel[1] -= Math.abs(delta*Math.sin(state.dir)*state.decceleration.speed.value);
						}
					}
				}
				
				var enemies = physics.getColliders(state.a, state.x,state.y,state.width,state.height);
				for (var i = 0; i < enemies.length; i++) {
					var e = enemies[i];
					if (e.isEnemy && Collisions.boxBox(state.x,state.y,state.width,state.height,e.x,e.y,e.width,e.height)){
						if(state.destroyOnContact) state.alive = false;
						state.x = state.px || 0;
						state.y = state.py || 0;
						i = enemies.length;
						e.life -= state.damage;
					}
				}
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
				if(state.explosion){
					state.explosion.sound.play(0);
					Entities.explosion_basic.newInstance(
						state.x + state.width/2 - state.explosion.radius/2, state.y + state.height/2 - state.explosion.radius/2,
						state.explosion.radius,0,state.explosion.damage,0,state.explosion.force, state.explosion.interp)
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
				
				state.glInit = function(manager)
						{
							if (!buffered)
							{
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
				
			},
			create: function(state,x,y,dir){
				state.alive = true;
				state.theta = dir-(Math.PI/2);
				
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

// Black Hole -- 
Entities.add('blackhole', Entities.create(
	(function(){
		var buffered = false;
		var verts = [];
		var t = 10;
		return {
			parent: Entities.projectile,
			construct: function(state,x,y,dir){
				state.configure(configs.weaponValues.blackHole);
				state.destroyOnContact = false;
				var sizew = configs.weaponValues.blackHole.width.value;
				var sizeh = configs.weaponValues.blackHole.height.value;
				
				for (var i = 0; i < 6; i++) {
					verts.push(sizew*Math.sin(i*Math.PI/6),sizeh*Math.cos(i*Math.PI/6),0.0);
				}
				
				state.glInit = function(manager)
				{
					if (!buffered){
						manager.addArrayBuffer("hexagon",false,verts,6,3);
						buffered = true;
					}
				}
				state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
					manager.setArrayBuffer("hexagon",false,verts,verts.length/3,3);
					manager.bindProgram("noise");
					manager.setUniform1f("noise","time",t);
					manager.setArrayBufferAsProgramAttribute("hexagon","noise","vertexPosition");
					manager.setMatrixUniforms('noise',pMatrix,mvMatrix.current);
					gl.drawArrays(gl.TRIANGLE_FAN,0,verts.length/3);
					t%=10;
					t++;
				}
		
				state.onCollision = function() {
					this.alive = true;
				}
				
			},
			create: function(state,x,y,dir){
				state.isBlackhole=true;
				state.alive = true;
				state.forcesEnabled = false;
				state.radius = configs.weaponValues.blackHole.blastRadius.value;
				state.force = -1*configs.weaponValues.blackHole.force.value
				state.theta = dir-(Math.PI/2);
				state.activate = false;
			},
			update: function(state,delta) {
				// apply forces
				if (state.activate) {
					physics.getColliders(state.a,state.x-state.radius,state.y-state.radius,state.radius*2,state.radius*2);
					//var xsum = state.x;
					//var ysum = state.y;
					//var c = 1;
					//for (var i = 0; i < state.a.length; i++) {
					//	var b = state.a[i];
					//	if (b.isBlackhole && b.id != state.id) {
					//		xsum += b.x;
					//		ysum += b.y;
					//		c++;
					//	}
					//}
					//xsum /= c;
					//ysum /= c;
					//state.accelerateToward(xsum,ysum,500);
					
					physics.radialForce(state.x+state.width/2,state.y+state.height/2,2*state.radius,state.force,delta);
					
					// test to see if collide with another black hole
				}
				if (state.vel[0] == 0 && state.vel[1] ==0) {
					state.activate = true;
				}
			}
		};
	})())
);