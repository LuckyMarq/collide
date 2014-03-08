initSound();

function initSound(){
	var context = (function(){
		if(typeof AudioContext == "function"){
			return new AudioContext();
		}else{
			return new webkitAudioContext();
		}
	})();
	var globalGain = context.createGain();
	globalGain.connect(context.destination);
	var sfxGain = context.createGain();
	sfxGain.connect(globalGain);
	var musicGain = context.createGain();
	musicGain.connect(globalGain);
	
	var buffers = {};
	
	var Sound = function(bufferId,loop,music){
		this.loop = loop || false;
		var gainNode = context.createGain();
		var playing=false;
		var source=null;
		var onendFunc = function(){
			playing = false;
			source = null;
		}
		this.play = function(t){
			if(buffers[bufferId].loaded){
				source = context.createBufferSource(); // Create Sound Source
				source.buffer = buffers[bufferId].data; // Add Buffered Data to Object
				source.loop = this.loop;
				source.connect(gainNode);
				source.onend = onendFunc;
				if(music) gainNode.connect(musicGain); else gainNode.connect(sfxGain);
				source.start(0);
				playing = true;
			}
		}
		this.stop = function(t){
			if(playing){
				source.stop(t);
				playing = false;
			}
		}
		return Object.defineProperties(this,{
			playing:{
				get: function(){
					return playing;
				},
				set: function(p){
					if(playing && !p){
						this.stop(0);
					}else if(!playing && p){
						this.play(0);
					}
				}
			},
			loaded:{
				get:function(){
					return buffers[bufferId].loaded;
				},
				set:function(){}
			},
			gain:{
				get:function(){
					return gainNode.gain.value;
				},
				set:function(gain){
					gainNode.gain.value = gain;
				}
			}
		});
	}
	
	var SoundBuffer = function(url,onloadCallback,onerrCallback){
		var loaded = false;
		var data = null;
			
		(function(){
			try{
				var request = new XMLHttpRequest();
				request.open("GET", url, true); // Path to Audio File
				request.responseType = "arraybuffer"; // Read as Binary Data
				request.onload = function() {
					context.decodeAudioData(request.response, function(b){
						data=b;
						loaded=true;
						if(onloadCallback) onloadCallback();
					}, function(){
						console.error('error loading audio');
						if(onerrCallback)onerrCallback();
					})
				};
				request.onerror = function() {
					console.error("failed to load audio file "+url);
					if(onerrCallback)onerrCallback();
				}
				request.onabort = function() {
					console.error("failed to load audio file "+url);
					if(onerrCallback)onerrCallback();
				}
				request.send();
			}catch(e){}
		})();
		
		
		return Object.defineProperties(this,{
			data:{
				get:function(){
					return data;
				},
				set:function(){}
			},
			loaded:{
				get:function(){
					return loaded;
				},
				set:function(){}
			}
		});	
	}
	
	window.Sound = Object.defineProperties(
		{
			addBuffer:function(id,url,callback){
				buffers[id] = new SoundBuffer(url,callback);
				return id;
			},
			createSound:function(bufferId,loop,music){
				return new Sound(bufferId,loop,music);
			},
			isLoaded: function(id){
				return buffers[id] && buffers[id].loaded;
			}
		},
		{
			globalGain:{
				get: function(){
					return globalGain.gain.value;
				},
				set: function(gain){
					globalGain.gain.value = gain;
				}
			},
			musicGain:{
				get: function(){
					return musicGain.gain.value;
				},
				set: function(gain){
					musicGain.gain.value = gain;
				}
			},
			sfxGain:{
				get: function(){
					return sfxGain.gain.value;
				},
				set: function(gain){
					sfxGain.gain.value = gain;
				}
			}
		});
}