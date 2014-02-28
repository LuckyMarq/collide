Entities.add('projectile', Entities.create(
	(function(){
		return {
			create: function(state,weaponConfig,x,y,dir){
				state.a = [];
				state.x = x;
				state.y = y;
				state.width = weaponConfig.width.value;
				state.height = weaponConfig.height.value;
				state.dir = Vector.getDir(dir);
				state.speed = weaponConfig.speed.value;
				state.vel[0] = Math.cos(state.dir)*speed;
				state.vel[1] = Math.sin(state.dir)*speed;
				state.config = weaponConfig;
				state.damage = weaponConfig.damage.value;
				state.fuse = weaponConfig.fuse.value;
				state.alive = false;
				state.onCollision = function() {
					//TODO: move to previous point
					state.alive = false;
					physics.getColliders(state.a, state.x,state.y, state.width, state.height);
					if (state.a[0].isEnemy) state.life -= state.damage;
				}
			},
			update: function(state,delta){		
				state.fuse -= delta;
				if (state.fuse < 0) state.alive = false;
			}
		}
	})())
);

// Rocket -- 
Entities.add('rocket', Entities.create(
	(function(){
		var damage = 0;
		var blastRadius = 64;
		var speed = 1000;
		var buffered = false;
		var interp = getInverseExponentInterpolator(0.5);
		var blastForce = 800;
		return {
			construct: function(state,x,y,dir){
				var sizew = configs.weaponValues.rocket.width.value;
				var sizeh = configs.weaponValues.rocket.height.value;
				damage = configs.weaponValues.rocket.damage.value;
				speed = configs.weaponValues.rocket.speed.value;
				blastForce = configs.weaponValues.rocket.force.value;
				blastRadius = configs.weaponValues.rocket.blastRadius.value;

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
					},x,y,sizew,sizeh,1));
					
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
				Entities.explosion_basic.newInstance(state.x + state.width/2 - blastRadius/2, state.y + state.height/2 - blastRadius/2,blastRadius,0,damage,0,blastForce, interp);
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);