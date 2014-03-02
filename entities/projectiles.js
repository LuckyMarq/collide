Entities.add('projectile', Entities.create(
	(function(){
		var a = [];
		var configure = function(config){
			if(config.size){
				this.width = config.size.value;
				this.height = config.size.value;
			}else{
				this.width = config.width.value;
				this.height = config.height.value;
			}
			this.fuseStart = (config.fuse) ? config.fuse.value : 1;
			this.damage = (config.damage) ? config.damage.value : 10;
			this.speed = (config.speed) ? config.speed.value : 300;
			if(config.acceleration)this.acceleration=config.acceleration.value;
			if(config.decceleration)this.decceleration=config.decceleration.value;
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
				state.y = y;
				state.dir = dir;
				state.vel[0] = Math.cos(dir)*state.speed;
				state.vel[1] = Math.sin(dir)*state.speed;
				if(state.acceleration){
					state.accel[0] = Math.cos(dir)*acceleration.speed;
					state.accel[1] = Math.sin(dir)*acceleration.speed;
				}
				state.fuse = state.fuseStart;
				
				physics.add(state);
				graphics.addToDisplay(state,'gl_main');
			},
			update: function(state,delta){
				a.length = 0;	
				state.fuse -= delta;
				if (state.fuse < 0) state.alive = false;
				
				if(state.decceleration){
				
				}
				
				var enemies = physics.getColliders(a, state.x,state.y,state.width,state.height);
				for (var i = 0; i < enemies.length; i++) {
					var e = enemies[i];
					if (e.isEnemy && Collisions.boxBox(state.x,state.y,state.width,state.height,e.x,e.y,e.width,e.height)){
						state.alive = false;
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