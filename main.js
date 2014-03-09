//this javascript file is responsible for setting up the engine and loading all of the other script files

//global object to hold all of the component objects
gameComponents = new Array();

function importS(filename){
	document.write('<script type="text/javascript" src='+filename+'><\/script>');
}

function loadSource(){
	//list script files in order here
	var scriptSource = [
		'misc.js',
		'utils/Interpolator.js',
		'config.js',
		'utils/input.js',
		'utils/collisions.js',
		'utils/geometry.js',
		'utils/ObjectPool.js',
		'components/loop.js',
		'components/ticker/ticker.js',
		'components/physics/physics.js',
		'components/graphics/graphics.js',
		'components/sound/sound.js',
		'entities/entities.js',
		'entities/map.js',
		'entities/menus.js'
	]
	
	for(var i in scriptSource){
		document.write('<script type="text/javascript" src='+scriptSource[i]+'><\/script>')
	}
	
}
frozen  = true;

function pauseGame(){
	if(!frozen){
		if(map_view){
			var screen = graphics.getScreen('gl_main');
			var p = Entities.player.getInstance();
			screen.follower = p;
			screen.scale(1/map_scale_factor);
			map_view = false;
			Loop.paused = false; 
		}
		if(!Loop.paused){
			previous_menu = PauseMenu;
			ticker.add(PauseMenu);
			graphics.addToDisplay(PauseMenu,'gl_main')
		}else{
			ticker.remove(PauseMenu);
			graphics.removeFromDisplay(PauseMenu,'gl_main')
			ticker.remove(OptionsMenu);
			graphics.removeFromDisplay(OptionsMenu,'gl_main')
		}
		Loop.paused = !Loop.paused;
	}
}

function goToMap(){
	if(!frozen && graphics){
		var screen = graphics.getScreen('gl_main');
		if(screen){
			var p = Entities.player.getInstance();
			if(map_view){
				screen.follower = p;
				screen.scale(1/map_scale_factor);
				map_view = false;
				Loop.paused = false; 
			}else{
				if(Loop.paused){
					ticker.remove(PauseMenu);
					graphics.removeFromDisplay(PauseMenu,'gl_main')
				}
				ticker.addTimer(function(){	
					mapMover.cx = p.cx;
					mapMover.cy = p.cy;
					screen.follower = mapMover;
					screen.scale(map_scale_factor);
					map_view = true;
					Loop.paused = true;
				},0,0,false);
			}
		}
	}
}

function restart(){
	Entities.player.getInstance(0).alive=false;
}

//initializes the keyboard and mouse objects
function initInput(){
	keyboard = new input.Keyboard(window);
	keyboard.addFlag(38,"up");
	keyboard.addFlag(40,"down");
	keyboard.addFlag(37,"left");
	keyboard.addFlag(39,"right");
	keyboard.addFlag(32,"space");
	keyboard.addFlag(87,"w");
	keyboard.addFlag(65,"a");
	keyboard.addFlag(83,"s");
	keyboard.addFlag(68,"d");
	keyboard.addFlag(69,"e");
	keyboard.addFlag(81,"q");
	keyboard.addFlag(33,"page_up");
	keyboard.addFlag(34,"page_down");
	keyboard.addFlag(13,'enter');
	keyboard.addFlag(48,'_0');
	keyboard.addFlag(49,'_1');
	keyboard.addFlag(50,'_2');
	keyboard.addFlag(51,'_3');
	keyboard.addFlag(52,'_4');
	keyboard.addFlag(53,'_5');
	keyboard.addFlag(54,'_6');
	keyboard.addFlag(55,'_7');
	keyboard.addFlag(56,'_8');
	keyboard.addFlag(57,'_9');
	
	keyboard.addKeyListener(27,'esc',(function(){
		var pressed = false;
		return {
			onPress:function(){
				if(!pressed){
					pressed = true;
					pauseGame();
				}
			},
			onRelease:function(){
				pressed = false;
			}
		}
		})()
	);
	
	keyboard.addKeyListener(9,'tab',(function(){
		var pressed = false;
		map_view = false;
		map_scale_factor = 10;
		return {
			onPress:function(){
				if(!pressed){
					pressed = true;
					goToMap();
				}
			},
			onRelease:function(){
				pressed = false;
			}
		}
		})()
	);
	
	keyboard.addKeyListener(112,'f1',(function(){
		var pressed = false;
		var mapView = false;
		var scaleFactor = 10;
		return {
			onPress:function(){
				if(!pressed){
					pressed = true;
					draw_bounding_boxes = !draw_bounding_boxes;
				}
			},
			onRelease:function(){
				pressed = false;
			}
		}
		})()
	)
	mouse = new input.Mouse(window,document.getElementById("Display"));
	
	gamepad = new input.Gamepad();
}

function loadResources(callback){ 
	var resourceConfig = new ResourceConfig('resources.xml');
	
	var n = 0;
	
	var loadNextSound = function(){
		if(n < resourceConfig.audio.length){
			var node = resourceConfig.audio[n];
			var name = node.attributes['name'];
			Sound.addBuffer(name,node.text,function(){
				console.log("audio buffer: "+name+" loaded from "+node.text);
				loadNextSound()
			},function(){
				console.error("error loading audio buffer: "+name);
				loadNextSound()
			});
			n++;
		}else{
			callback();
		}
	}
	configs = resourceConfig.configs;
	loadNextSound();
}

//initialization code goes here
function init(){
	for(var i in gameComponents){
		Loop.add(gameComponents[i])
	}
	Loop.add(Entities)
	Loop.start();
	loadResources(initStartScreen);
}

function initStartScreen(){
	var screen = graphics.getScreen('gl_main');
	screen.scale(2);
	var dw=configs.misc.displayDimensions.attributes.width,dh=configs.misc.displayDimensions.attributes.height;
	graphics.setDisplayDimensions(dw,dh)
	
	mouse.box = graphics.getScreen('gl_main');
	
	high_scores = localStorage.getItem('collide_game_high_scores');
	if(!high_scores){
		high_scores = {};
		for(var i = 0; i<10; i++){
			high_scores[i]={name:"empty",score:0};
		}
	}else{
		high_scores = JSON.parse(high_scores);
	}
	
	var options = localStorage.getItem('collide_game_options');
	if(!options){
		options = 
			{
				globalGain:1,
				musicGain:1,
				sfxGain:1,
				displayWidth:dw,
				displayHeight:dh
			}
	}else{
		options = JSON.parse(options);
		Sound.globalGain = options.globalGain;
		Sound.sfxGain = options.sfxGain;
		Sound.musicGain = options.musicGain;
		dw = options.displayWidth,dh=options.displayHeight;
		graphics.setDisplayDimensions(dw,dh)
	}
	
	PauseMenu = new Menu(0.7)
	var PauseTitle = new Title(screen.width/2,screen.height*0.8,'PAUSED',128,'Menu','rgba(255,255,255,255)')
	PauseMenu.title = PauseTitle;
	PauseMenu.add(PauseTitle)
	PauseMenu.add(new Button(screen.width/2,screen.height*0.4,512,128,608,160,'OPTIONS',64,'Menu','rgba(255,255,255,255)',function(){
		graphics.removeFromDisplay(PauseMenu,'gl_main');
		ticker.remove(PauseMenu);
		ticker.add(OptionsMenu);
		graphics.addToDisplay(OptionsMenu,'gl_main')
	}))
	PauseMenu.add(new Button(screen.width/2,screen.height*0.2,512,128,608,160,'RESTART',64,'Menu','rgba(255,255,255,255)',function(){pauseGame();restart();}))
	PauseMenu.add(new MenuCursor())
	
	
	
	OptionsMenu = new Menu(1);
	OptionsMenu.add(new Title(screen.width/2,screen.height - 100,'OPTIONS',128,'Menu','rgba(255,255,255,255)'))
	OptionsMenu.add(new Title(screen.width*(1/4),screen.height - 200,'Master Volume',64,'Menu','rgba(255,255,255,255)'))
	OptionsMenu.add(new Slider(screen.width*(3/4),screen.height - 200,512,64,function(x){
		Sound.globalGain = x;
		options.globalGain =x;
	},options.globalGain))
	OptionsMenu.add(new Title(screen.width*(1/4),screen.height - 300,'SFX Volume',64,'Menu','rgba(255,255,255,255)'))
	OptionsMenu.add(new Slider(screen.width*(3/4),screen.height - 300,512,64,function(x){
		Sound.sfxGain = x;
		options.sfxGain =x;
	},options.sfxGain))
	OptionsMenu.add(new Title(screen.width*(1/4),screen.height - 400,'Music Volume',64,'Menu','rgba(255,255,255,255)'))
	OptionsMenu.add(new Slider(screen.width*(3/4),screen.height - 400,512,64,function(x){
		Sound.musicGain = x;
		options.musicGain =x;
	},options.musicGain))
	OptionsMenu.add(new Title(screen.width*(1/4),screen.height - 500,'Display Dimensions',64,'Menu','rgba(255,255,255,255)'))
	var gettingInput = false;
	var resolutionButton = OptionsMenu.add(new Button(screen.width*(3/4),screen.height - 500,512,64,608,160,dw+'x'+dh,48,'Menu','rgba(255,255,255,255)',function(){
		if(!gettingInput){
			gettingInput = true
			var input = prompt('Enter new dimensions as WIDTHxHEIGHT',dw+'x'+dh);
			if(input && input!=null){
				var a = input.split('x');
				if(a.length==2){
					var w = parseFloat(a[0]);
					var h = parseFloat(a[1]);
					if(!isNaN(w) && !isNaN(h)){
						var dif = screen.width;
						graphics.setDisplayDimensions(w,h)
						dif = (screen.width-dif)/2
						this.text = w+'x'+h
						dw = w;
						dh = h;
						options.displayWidth = w;
						options.displayHeight = h;
						gettingInput = false;
						OptionsMenu.translate(dif,0);
						PauseMenu.translate(dif,0);
						StartMenu.translate(dif,0);
						WeaponSelect.translate(dif,0);
						return;
					}
				}
				alert('failed to parse value:'+input)
			}
			gettingInput = false;
		}
	}))
	OptionsMenu.add(new Button(screen.width*(1/2),screen.height - 600,512,64,608,160,'FULLSCREEN',48,'Menu','rgba(255,255,255,255)',function(){
		dw = innerWidth;
		dh = innerHeight;
		options.displayWidth = dw;
		options.displayHeight = dh;
		resolutionButton.text = dw+'x'+dh;
		var dif = screen.width;
		graphics.setDisplayDimensions(dw,dh)
		dif = (screen.width-dif)/2
		OptionsMenu.translate(dif,0);
		PauseMenu.translate(dif,0);
		StartMenu.translate(dif,0);
		WeaponSelect.translate(dif,0);
	}));
	OptionsMenu.add(new Button(screen.width-128,80,160,80,208,124,'Back',48,'Menu','rgba(255,255,255,255)',function(){
		graphics.removeFromDisplay(OptionsMenu,'gl_main');
		ticker.remove(OptionsMenu);
		ticker.add(previous_menu);
		graphics.addToDisplay(previous_menu,'gl_main');
		localStorage.setItem('collide_game_options',JSON.stringify(options));
	}))
	
	OptionsMenu.add(new MenuCursor())
	
	LeaderBoard = new Menu(1);
	LeaderBoard.add(new Title(screen.width/2,screen.height - 32,'HIGHSCORES',48,'Menu','rgba(255,255,255,255)'))
	LeaderBoard.add({
		draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
			for(var i = 0; i<10; i++){
				manager.fillText((i+1)+"",200,screen.height-(100+(i*70)),0,40,'Menu','rgba(255,255,255,255)',manager.LEFT)
				manager.fillText(":",248,screen.height-(100+(i*70)),0,40,'Menu','rgba(255,255,255,255)',manager.LEFT)
				manager.fillText(high_scores[i].name,296,screen.height-(100+(i*70)),0,40,'Menu','rgba(255,255,255,255)',manager.LEFT)
				manager.fillText(high_scores[i].score,512,screen.height-(100+(i*70)),0,40,'Menu','rgba(255,255,255,255)',manager.LEFT)
				
			}
		}
	})
	LeaderBoard.add(new Button(screen.width-128,80,160,80,208,124,'Back',32,'Menu','rgba(255,255,255,255)',function(){
		graphics.removeFromDisplay(LeaderBoard,'gl_main');
		ticker.remove(LeaderBoard);
		ticker.add(previous_menu);
		graphics.addToDisplay(previous_menu,'gl_main');
		localStorage.setItem('collide_game_options',JSON.stringify(options));
	}))
	LeaderBoard.add(new MenuCursor())
	
	WeaponSelect = new Menu(1)
	WeaponSelect.add(new Title(screen.width/2,screen.height - 128,'Select Your Weapon',64,'Menu','rgba(255,255,255,255)'))
	WeaponSelect.add(new Button(screen.width-128,80,160,80,208,124,'Back',32,'Menu','rgba(255,255,255,255)',function(){
		graphics.removeFromDisplay(WeaponSelect,'gl_main');
		ticker.remove(WeaponSelect);
		ticker.add(previous_menu);
		graphics.addToDisplay(previous_menu,'gl_main');
		localStorage.setItem('collide_game_options',JSON.stringify(options));
	}))
	WeaponSelect.add(new Button(128,80,208,80,248,124,'Random',32,'Menu','rgba(255,255,255,255)',function(){
		start_weapon = (configs.map.startWeapon) ? configs.map.startWeapon.value : Math.floor(Math.random()*configs.map.keyframes.value.length);
		graphics.removeFromDisplay(WeaponSelect,'gl_main');
		ticker.remove(WeaponSelect);
		if(first){
			initScene();
			first = false;
		}else{
			currentMap.rebuild(true);
	
			currentMap.init();
			
			physics.setGeometry(currentMap.lines);
		}
	}))
	WeaponSelect.add(new Button(screen.width/2,80,208,80,248,124,'Select',32,'Menu','rgba(255,255,255,255)',function(){
		start_weapon = weaponIndex;
		graphics.removeFromDisplay(WeaponSelect,'gl_main');
		ticker.remove(WeaponSelect);
		if(first){
			initScene();
			first = false;
		}else{
			currentMap.rebuild(true);
	
			currentMap.init();
			
			physics.setGeometry(currentMap.lines);
		}
	}))
	var weaponIndex = 0;
	var keyframes = configs.map.keyframes.value;
	var names = configs.map.weaponNames.value;
	var animator =  getPlayerAnimator();
	animator.setCurrentKeyframe(keyframes[0],0)
	WeaponSelect.add({
		leftSelected:false,
		rightSelected:false,
		leftPressed:false,
		rightPressed:false,
		glInit: function(manager){
			animator.glInit(manager)
		},
		triangleSize:64,
		lt:0,
		rt:0,
		draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
			if(this.leftSelected){
				this.lt=Math.min(0.2,this.lt+delta);
			}else{
				this.lt=Math.max(0,this.lt-delta);
			}
			if(this.rightSelected){
				this.rt=Math.min(0.2,this.rt+delta);
			}else{
				this.rt=Math.max(0,this.rt-delta);
			}
			manager.fillText(names[weaponIndex],screen.width/2,100+screen.height/2,0,48,'Menu','rgba(255,255,255,255)')
			
			mvMatrix.push();
				mvMatrix.translate(screen.width/2,screen.height/2,0)
				mvMatrix.scale(2,2,1)
				animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
			mvMatrix.pop();
			
			mvMatrix.translate(screen.width/2,screen.height/2,0)
			
			mvMatrix.push();
				mvMatrix.translate(256,0,0);
				manager.fillTriangle(0,0,0,this.triangleSize,this.triangleSize,-Math.PI/2,1,1,1,1)
				mvMatrix.scale(1+this.rt,1+this.rt,1)
				manager.strokeTriangle(0,0,0,this.triangleSize,this.triangleSize,-Math.PI/2,1,1,1,1)
			mvMatrix.pop();
			
			mvMatrix.translate(-256,0,0)
			manager.fillTriangle(0,0,0,this.triangleSize,this.triangleSize,Math.PI/2,1,1,1,1)
			mvMatrix.scale(1+this.lt,1+this.lt,1)
			manager.strokeTriangle(0,0,0,this.triangleSize,this.triangleSize,Math.PI/2,1,1,1,1)
			
			this.lx = this.triangleSize/2+screen.width/2-256-64;
			this.ly = this.triangleSize/2+screen.height/2-64;
			
			this.rx = this.triangleSize/2+screen.width/2+256-64;
			this.ry = this.triangleSize/2+screen.height/2-64;
		},
		tick: function(delta,mx,my){
			var x = this.lx;
			var y = this.ly;
			// console.log(x,y,this.triangleSize)
			if(mx>x && mx<x+this.triangleSize && my>y && my<y+this.triangleSize){
				if(mouse.pressed){
					this.leftPressed = true;
				}else if(this.leftPressed){
					weaponIndex--;
					if(weaponIndex<0)weaponIndex = keyframes.length+weaponIndex;
					animator.setCurrentKeyframe(keyframes[weaponIndex],0.5)
					this.leftPressed = false;
				}
				this.leftSelected = true;
			}else{
				this.leftSelected = false;
				this.leftPressed = false;
			}
			var x = this.rx;
			var y = this.ry;
			// console.log(x,y,this.triangleSize)
			if(mx>x && mx<x+this.triangleSize && my>y && my<y+this.triangleSize){
				if(mouse.pressed){
					this.rightPressed = true;
				}else if(this.rightPressed){
					weaponIndex++;
					if(weaponIndex>=keyframes.length)weaponIndex = 0;
					animator.setCurrentKeyframe(keyframes[weaponIndex],0.5)
					this.rightPressed = false;
				}
				this.rightSelected = true;
			}else{
				this.rightSelected = false;
				this.rightPressed = false;
			}
		}
	})
	WeaponSelect.add(new MenuCursor())
	
	StartMenu = new Menu(1);
	var first = true
	
	StartMenu.add(new MenuCursor())
	StartMenu.add(new Title(screen.width/2,screen.height - 200,'COLLIDE',192,'Menu','rgba(255,255,255,255)'))
	StartMenu.add(new Button(screen.width/2,screen.height - 400,512,128,608,160,'PLAY',64,'Menu','rgba(255,255,255,255)',function(){
		graphics.removeFromDisplay(StartMenu,'gl_main');
		ticker.remove(StartMenu);
		ticker.add(WeaponSelect);
		graphics.addToDisplay(WeaponSelect,'gl_main')
	}))
	StartMenu.add(new Button(screen.width/2,screen.height - 600,512,128,608,160,'OPTIONS',64,'Menu','rgba(255,255,255,255)',function(){
		graphics.removeFromDisplay(StartMenu,'gl_main');
		ticker.remove(StartMenu);
		ticker.add(OptionsMenu);
		graphics.addToDisplay(OptionsMenu,'gl_main')
	}))
	StartMenu.add(new Button(screen.width/2,screen.height - 800,512,128,608,160,'HIGHSCORES',64,'Menu','rgba(255,255,255,255)',function(){
		graphics.removeFromDisplay(StartMenu,'gl_main');
		ticker.remove(StartMenu);
		ticker.add(LeaderBoard);
		graphics.addToDisplay(LeaderBoard,'gl_main')
	}))
	
	
	
	previous_menu = StartMenu;
	ticker.add(StartMenu);
	graphics.addToDisplay(StartMenu,'gl_main')
}

function initScene(){
	var screen = graphics.getScreen('gl_main');
	

	//fps counter using a simple low pass filter
	var fpsCounter = (function(){
		var element = document.getElementById('fps');
		var filterStrength = 10;
		var frameTime = 0, lastLoop = new Date, thisLoop;
		return {
			tick: function(delta){
				var thisFrameTime = (thisLoop=Date.now()) - lastLoop;
				frameTime+= (thisFrameTime - frameTime) / filterStrength;
				lastLoop = thisLoop;
				var fps = 'fps: '+(1000/frameTime);
				element.innerHTML = fps;
			}
		}
	})();
	
	ticker.add(fpsCounter);
	
	ticker.add({
		sePressed: false,
		stPressed: false,
		tick: function(){
			gamepad.query();
			for(var o in gamepad.pads){
				var p = gamepad.pads[o];
				if(p.start){
					if(!this.sePressed){
						pauseGame();
						this.sePressed = true;
					}
				}else{
					this.sePressed = false;
				}
				if(p.select){
					if(!this.stPressed){
						goToMap();
						this.stPressed = true;
					}
				}else{
					this.stPressed = false;
				}
			}
		}
	})
	
	mapMover = (function(){
		var controls = {
			up:'w',
			down:'s',
			right:'d',
			left:'a'
		}
		return {
			cx: 0,
			cy: 0,
			speed: configs.misc.mapMoveSpeed.value,
			tick: function(){
				var count=0,angle=0;
				if(keyboard[controls.down]){
					count++;
					angle+=Math.PI*(3/2);
				}
				if(keyboard[controls.up]){
					count++;
					angle+=Math.PI/2;
				}
				if(keyboard[controls.left]){
					count++;
					angle+=Math.PI;
				}
				if(keyboard[controls.right]){
					count++;
					if(keyboard[controls.down]){
						angle+=Math.PI*2;
					}
				}
				angle /= count;
				if(count>0){
					this.cx += this.speed * Math.cos(angle);
					this.cy += this.speed * Math.sin(angle);
				}else{
					var p = gamepad.padA[0];
					if(p && p.leftStick.mag>0.1){
						var s = this.speed*p.leftStick.mag
						this.cx +=  s * p.leftStick.xAxis;
						this.cy += -s * p.leftStick.yAxis;
					}
				}
			}		
		}
	})();
	
	ticker.add(mapMover)
	
	var cursor = fillProperties(new GLDrawable(),(function(){
		var first = true;
		var x=0, y=0;
		return{
			draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.point(mouse.x,mouse.yInv,-99.99,12,1,1,1,1);
			},
			tick: function(){
				x = mouse.x;
				y = mouse.yInv;
				this.x=x-6;
				this.y=y-6;
			},
			width:12,
			height:12
		};
	})());
	graphics.addToDisplay(cursor,"gl_main")
	ticker.add(cursor);
	
	god_mode = configs.misc.godMode.value;
	
	current_level = 1;
	
	// graphics.addToDisplay(testMap,"gl_main")
	player_weapons = [BeamWeapon,RocketWeapon,WaveWeapon,MineWeapon];
	player_keyframes = ['triangle','rocket','circle','square'];
	instance_keyframes = player_keyframes.slice(0,player_keyframes.length);
	instance_weapons = player_weapons.slice(0,player_keyframes.length);
	
	currentMap = new Map(configs.map);
	currentMap.init();
	
	physics.setGeometry(currentMap.lines);
	graphics.addToDisplay(currentMap,'gl_main');
}

function reinitScene(){
	current_level = 1;
	current_points = 0;
	Entities.reset();
	Entities.reset();
	
	previous_menu = StartMenu;
	ticker.add(StartMenu);
	graphics.addToDisplay(StartMenu,'gl_main');
	frozen = true;
	// currentMap.rebuild(true);
	
	// currentMap.init();
	
	// physics.setGeometry(currentMap.lines);
}
//initializes game
loadSource();
document.addEventListener("DOMContentLoaded", function(){initInput();init();}, false);