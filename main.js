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
	if(!frozen)Loop.paused = !Loop.paused;
}

function goToMap(){
	if(!frozen && graphics){
		var screen = graphics.getScreen('gl_main');
		if(screen){
			if(map_view){
				screen.scale(1/map_scale_factor);
				map_view = false;
				Loop.paused = false; 
			}else{
				ticker.addTimer(function(){screen.scale(map_scale_factor);map_view = true;Loop.paused = true;},0,0,false);
			}
		}
	}
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
	
	keyboard.addKeyListener(80,'p',(function(){
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
	
	keyboard.addKeyListener(27,'esc',(function(){
		var pressed = false;
		return {
			onPress:function(){
				if(!pressed){
					pressed = true;
					Entities.player.getInstance(0).alive=false;
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
	loadResources(initScene);
}

function initScene(){
	var screen = graphics.getScreen('gl_main');
	mouse.box = graphics.getScreen('gl_main');

	screen.scale(2)
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
			for(var o in gamepad.pads){
				var p = gamepad.pads[o];
				if(p.start){
					if(!this.sePressed){
						Loop.paused = !Loop.paused;
						this.sePressed = true;
					}
				}else{
					this.sePressed = false;
				}
				if(p.select){
					if(!this.stPressed){
						Loop.paused = !Loop.paused;
						this.stPressed = true;
						if(graphics){
							var screen = graphics.getScreen('gl_main');
							if(screen){
								if(map_view){
									screen.scale(1/map_scale_factor);
									map_view = false;
									Loop.paused = false; 
								}else{
									ticker.addTimer(function(){screen.scale(map_scale_factor);map_view = true;Loop.paused = true;},0,0,false);
								}
							}
						}
					}
				}else{
					this.stPressed = false;
				}
			}
		}
	})
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
	graphics.setDisplayDimensions(configs.misc.displayDimensions.attributes.width,configs.misc.displayDimensions.attributes.height)
}

function reinitScene(){
	current_level = 1;
	Entities.reset();
	Entities.reset();
	
	currentMap.rebuild(true);
	
	currentMap.init();
	
	physics.setGeometry(currentMap.lines);
}
//initializes game
loadSource();
document.addEventListener("DOMContentLoaded", function(){initInput();init();}, false);