// Entities.add('projectile', Entities.create(
// 	(function(){
// 		return {
// 			create: function(state,weaponConfig,x,y,dir){
// 				state.a = [];
// 				state.x = x;
// 				state.y = y;
// 				state.width = weaponConfig.width.value;
// 				state.height = weaponConfig.height.value;
// 				state.dir = Vector.getDir(dir);
// 				state.speed = weaponConfig.speed.value;
// 				state.vel[0] = Math.cos(state.dir)*speed;
// 				state.vel[1] = Math.sin(state.dir)*speed;
// 				state.config = weaponConfig;
// 				state.damage = weaponConfig.damage.value;
// 				state.fuse = weaponConfig.fuse.value;
// 				state.alive = false;
// 				state.onCollision = function() {
// 					state.alive = false;
// 				}
// 			},
// 			update: function(state,delta){
// 				state.a.length = 0;	
// 				state.fuse -= delta;
// 				if (state.fuse < 0) state.alive = false;
// 				
// 				var enemies = physics.getColliders(state.a, state.x,state.y,state.width,state.height);
// 				for (var i = 0; i < enemies.length; i++) {
// 					var e = enemies[i];
// 					if (e.isEnemy && Collisions.boxBox(state.x,state.y,state.width,state.height,e.x,e.y,e.width,e.height)){
// 						state.alive = false;
// 						state.x = state.px
// 						state.y = state.py;
// 						i = enemies.length;
// 						e.life -= damage;
// 					}
// 				}
// 			}
// 		}
// 	})())
// );

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
				state.width = configs.weaponValues.rocket.width.value;
				state.height = configs.weaponValues.rocket.height.value;
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
					},x,y,state.width,state.height,1));
					
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
								0,state.height,0,
								-state.width,-state.width,0,
								0,state.height/2,0,
								state.width,-state.width,0,
								0,state.height,0
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
								0,state.height,0,
								-state.width/2,-state.height/2,0,
								0,0,0,
								state.width/2,-state.height/2,0,
								0,state.height,0
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
								0,state.height,0,
								-state.width,-state.height,0,
								0,-state.height/4,0,
								state.width,-state.height,0,
								0,state.height,0
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
				state.theta = dir-(Math.PI/2)
				state.delay = 0.1;
				state.a = []; // array for collision check
				state.sound = Sound.createSound('explosion_fire');
				state.sound.gain = 0.1;
				state.animator.setCurrentKeyframe("fat",0);
				state.animator.setCurrentKeyframe("slim", state.delay);
				state.set(x,y,0,0,0,0)
				state.width = rocketConfig.width.value;
				state.height = rocketConfig.height.value;
				state.dir = dir;
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
						state.x = state.px
						state.y = state.py;
						i = enemies.length;
						e.life -= damage;
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

// Rocket -- 
// Entities.add('rocket', Entities.create(
// 	(function(){
// 		var blastRadius = 64;
// 		var buffered = false;
// 		var interp = getInverseExponentInterpolator(0.5);
// 		var blastForce = 800;
// 		return {
//			parent: Entities.projectile,
// 			construct: function(state,x,y,dir){
// 				blastForce = configs.weaponValues.rocket.force.value;
// 				blastRadius = configs.weaponValues.rocket.blastRadius.value;
// 
// 				fillProperties(state, Entities.createStandardCollisionState(
// 					{
// 						glInit: function(manager)
// 						{
// 							if (!buffered)
// 							{
// 								this.animator.glInit(manager);
// 								buffered = true;
// 							}
// 						},
// 						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
// 							mvMatrix.translate(this.x+this.width/2, this.y+this.height/2, 0);
// 							mvMatrix.rotateZ(this.theta);
// 							this.animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
// 						}
// 					},x,y,state.width,state.height,1));
// 					
// 					state.animator = new VertexAnimator("basic", 
// 						{
// 						rocketColor: 
// 							fillProperties([
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1
// 							],
// 							{
// 								attributeId: "vertexColor",
// 								items: 6,
// 								itemSize: 4
// 							}), 
// 						rocketPosition: 
// 							fillProperties([
// 								0,0,0,
// 								0,state.height,0,
// 								-state.width,-state.width,0,
// 								0,state.height/2,0,
// 								state.width,-state.width,0,
// 								0,state.height,0
// 							],
// 							{
// 								attributeId: "vertexPosition",
// 								items: 6,
// 								itemSize: 3
// 							})
// 						},
// 						{},6);
// 						
// 					state.animator.addKeyframe("slim", 
// 						{
// 						rocketColor: 
// 							fillProperties([
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1
// 							],
// 							{
// 								attributeId: "vertexColor",
// 								items: 6,
// 								itemSize: 4
// 							}), 
// 						rocketPosition: 
// 							fillProperties([
// 								0,0,0,
// 								0,state.height,0,
// 								-state.width/2,-state.height/2,0,
// 								0,0,0,
// 								state.width/2,-state.height/2,0,
// 								0,state.height,0
// 							],
// 							{
// 								attributeId: "vertexPosition",
// 								items: 6,
// 								itemSize: 3
// 							})
// 						},
// 						{},6);
// 						
// 					state.animator.addKeyframe("fat", 
// 						{
// 						rocketColor: 
// 							fillProperties([
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1,
// 								0.8,0,0,1
// 							],
// 							{
// 								attributeId: "vertexColor",
// 								items: 6,
// 								itemSize: 4
// 							}), 
// 						rocketPosition: 
// 							fillProperties([
// 								0,0,0,
// 								0,state.height,0,
// 								-state.width,-state.height,0,
// 								0,-state.height/4,0,
// 								state.width,-state.height,0,
// 								0,state.height,0
// 							],
// 							{
// 								attributeId: "vertexPosition",
// 								items: 6,
// 								itemSize: 3
// 							})
// 						},
// 						{},6);
// 			},
// 			create: function(state,rocketConfig,x,y,dir){
// 				state.alive = true;
// 				state.theta = dir-(Math.PI/2);
// 				state.sound = Sound.createSound('explosion_fire');
// 				state.sound.gain = 0.1;
// 				state.animator.setCurrentKeyframe("fat",0);
// 				state.animator.setCurrentKeyframe("slim", state.delay);
// 				state.set(x,y,0,0,0,0);
// 				graphics.addToDisplay(state,'gl_main');
// 				ticker.add(state);
// 				physics.add(state);
// 			},
// 			destroy: function(state){
// 				state.sound.play(0);
// 				Entities.explosion_basic.newInstance(state.x + state.width/2 - blastRadius/2, state.y + state.height/2 - blastRadius/2,blastRadius,0,damage,0,blastForce, interp);
// 				graphics.removeFromDisplay(state,'gl_main');
// 				ticker.remove(state);
// 				physics.remove(state);
// 			}
// 		};
// 	})())
// );