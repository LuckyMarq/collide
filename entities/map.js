/**
*	This file defines a map object for the current game
*/

function Map(config){
	var num= 0;
	var lines= new Array();
	this.lines = lines;
	this.config = config;
	var size;
	var rooms= new Array();
	var getConfiguration = function(mapConfig){
		var configs;
		if(mapConfig.levels["level"+current_level]){
			configs = mapConfig.levels["level"+current_level].configs.children;
		}else{
			configs = mapConfig.configs.children;
		}
		var config = configs[Math.round(Math.random()*(configs.length-1))]
		if(!config){
			console.trace();
			throw "cannot configure map"
		}else{
			return config;
		}
	}
	var getNodeValue = function(node){
		if(!node)console.trace()
		if(typeof node.value == 'number'){
			return node.value
		}else{
			return node.min.value + Math.random()*(node.max.value-node.min.value);
		}
	}
	var check = function(x,y){
		for(var i in rooms) {
			if( rooms[i].x == x && rooms[i].y == y){
				return false;
			}
		}
		return true;
	}
	var  Room = function(north,east,south,west,x,y,limit, roomChance, minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth){
		this.x = x;
		this.y= y;
		north = north || null;
		south = south || null;
		east = east || null;
		west = west || null;
		var first = true;
		rooms.push(this);
		num++;
		while(((this.north==null && this.east == null && this.south==null && this.west == null)||first) && num<limit){
			first = false;
			if((Math.random() <= roomChance) && north == null && check(x, y+size)){
				this.north = new Room(null,null,this,null,x,y+size, limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}
			if((Math.random() <= roomChance) && south == null && check(x, y-size)){
				this.south = new Room(this,null,null,null,x,y-size,limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}
			if((Math.random() <= roomChance) && east == null && check(x+size,y)){
				this.east = new Room(null,null,null,this, x+size,y,limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}
			if((Math.random() <= roomChance) && west == null && check(x-size, y)){
				this.west= new Room(null,this,null,null,x-size,y,limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}      
		}
		this.north = (north!=null) ? north : this.north;
		this.south =  (south!=null) ? south : this.south;
		this.east =  (east!=null) ? east : this.east;
		this.west = (west!=null) ? west : this.west;
		
		this.initLines= function(){
			this.width = minWidth + (Math.random() * (maxWidth - minWidth));
			this.height= minHeight + (Math.random() * (maxHeight - minHeight));
			var cx = this.x + size/2;
			var cy = this.y + size/2;
			// top 
			if( this.north != null) {
				lines.push(cx+ this.width/2, cy + this.height/2, cx + connectorWidth/2, cy + this.height/2);
				lines.push(cx +connectorWidth/2, cy + this.height/2, cx +connectorWidth/2, this.y + size);
				lines.push(cx - connectorWidth/2, this.y + size, cx - connectorWidth/2, cy+ this.height/2);
				lines.push(cx - connectorWidth/2, cy+ this.height/2, cx - this.width/2, cy+ this.height/2);
			}else {
				lines.push(cx+ this.width/2, cy + this.height/2, cx - this.width/2, cy+ this.height/2);	
			}
			//left
			if( this.west != null){
				lines.push(cx - this.width/2, cy+ this.height/2, cx - this.width/2, cy + connectorWidth/2);
				lines.push(cx - this.width/2, cy + connectorWidth/2, this.x, cy + connectorWidth/2);
				lines.push(this.x, cy - connectorWidth/2, cx - this.width/2, cy - connectorWidth/2);
				lines.push(cx - this.width/2, cy - connectorWidth/2, cx - this.width/2, cy - this.height/2);
			}else{
				lines.push(cx - this.width/2, cy+ this.height/2, cx - this.width/2, cy - this.height/2);
			}
			//bottom
			if( this.south != null){
				lines.push(cx - this.width/2, cy - this.height/2, cx- connectorWidth/2, cy - this.height/2);
				lines.push(cx- connectorWidth/2, cy - this.height/2, cx- connectorWidth/2, this.y);
				lines.push(cx + connectorWidth/2, this.y, cx + connectorWidth/2, cy - this.height/2);
				lines.push(cx + connectorWidth/2, cy - this.height/2, cx + this.width/2, cy - this.height/2);
			}else{
				lines.push(cx - this.width/2, cy - this.height/2, cx + this.width/2, cy - this.height/2);
			}
			//right
			if( this.east != null) {
				lines.push(cx + this.width/2, cy - this.height/2, cx + this.width/2, cy - connectorWidth/2);
				lines.push(cx + this.width/2, cy - connectorWidth/2, this.x + size, cy - connectorWidth/2);
				lines.push(this.x+ size, cy + connectorWidth/2,cx + this.width/2, cy + connectorWidth/2);
				lines.push(cx + this.width/2, cy + connectorWidth/2, cx+ this.width/2, cy + this.height/2);
			}else{
				lines.push(cx + this.width/2, cy - this.height/2, cx+ this.width/2, cy + this.height/2);
			}
			this.linesAdded = true;
			if(this.east && !this.east.linesAdded)this.east.initLines();
			if(this.west && !this.west.linesAdded)this.west.initLines();
			if(this.south && !this.south.linesAdded)this.south.initLines();
			if(this.north && !this.north.linesAdded)this.north.initLines();
		}
		this.checkConnections = function(connectionChance){
			for(var i = 0;i<rooms.length; i++){
				var room = rooms[i];
				if(room.checked) continue;
				if(!this.west && room.x == this.x-size && room.y ==this.y){
					if(Math.random()<connectionChance){
						room.east = this;
						this.west = room;
					}
					break;
				}else if(!this.east && room.x == this.x+size && room.y ==this.y){
					if(Math.random()<connectionChance){
						room.west = this;
						this.east = room;
					}
					break;
				}else if(!this.north && room.x == this.x && room.y ==this.y+size){
					if(Math.random()<connectionChance){
						room.south = this;
						this.north = room;
						
					}
					break;
				}else if(!this.south && room.x == this.x && room.y == this.y-size){
					if(Math.random()<connectionChance){
						room.north = this;
						this.south = room;
					}
					break;
				}
			}
			this.checked = true;
			if(this.east && !this.east.checked)this.east.checkConnections(connectionChance);
			if(this.west && !this.west.checked)this.west.checkConnections(connectionChance);
			if(this.south && !this.south.checked)this.south.checkConnections(connectionChance);
			if(this.north && !this.north.checked)this.north.checkConnections(connectionChance);
		}
	}
	Room.prototype = {
		north: null,
		east: null,
		south: null,
		west: null,
		connected: false,
		adjacentTo: function(room){
			return room==this.west || room==this.east || room==this.north || room==this.south;
		}
	}
	this.setColor = function(gr){
		this.r = 0;
		this.g = 0;
		this.b = 0;
		while(gr>0){
			var p = this.r;
			this.r = Math.min(1,this.r+Math.max(0,Math.min(gr,Math.random())));
			gr -= (this.r-p);
			p = this.g;
			this.g = Math.min(1,this.g+Math.max(0,Math.min(gr,Math.random())));
			gr -= (this.g-p);
			p = this.b;
			this.b = Math.min(1,this.b+Math.max(0,Math.min(gr,Math.random())));
			gr -= (this.b-p);
		}
	}
	
	this.setColor(2);
	config = getConfiguration(config);
	size = getNodeValue(config.rooms.size);
	console.log( config.rooms.width.min)
	this.room = new Room(null,null,null,null,0,0,Math.round(getNodeValue(config.rooms)), getNodeValue(config.rooms.density), 
		config.rooms.width.min.value, config.rooms.width.max.value, config.rooms.height.min.value,
		config.rooms.width.max.value, size, getNodeValue(config.rooms.connectorSize));
	this.room.checkConnections(getNodeValue(config.rooms.connectivity));
	this.room.initLines();
	
	this.keyframes = this.config.keyframes.value.slice(0,this.config.keyframes.value.length);
	this.weapons = this.config.weapons.value.slice(0,this.config.weapons.value.length);
	
	this.rebuild = function(reset){
		config = getConfiguration(this.config);
		if(reset){
			this.keyframes = this.config.keyframes.value.slice(0,this.config.keyframes.value.length);
			this.weapons = this.config.weapons.value.slice(0,this.config.weapons.value.length);
		}
		num = 0;
		lines.length = 0;
		rooms.length = 0;
		this.setColor(2);
		this.room = new Room(null,null,null,null,0,0,Math.round(getNodeValue(config.rooms)), getNodeValue(config.rooms.density), 
				config.rooms.width.min.value, config.rooms.width.max.value, config.rooms.height.min.value,
				config.rooms.width.max.value, size, getNodeValue(config.rooms.connectorSize));
		this.room.checkConnections(getNodeValue(config.rooms.connectivity));
		this.room.initLines();
	}
	this.init = function(player){
		if(player){
			Entities.player_initializer.newInstance(this.room.x+size/2,this.room.y + size/2,player);
		}else{
			//create player
			var index = Math.round(Math.random()*(this.keyframes.length -1))
			Entities.player_initializer.newInstance(this.room.x+size/2,this.room.y + size/2,Entities.player.newInstance(this.room.x+size/2,this.room.y + size/2,this.keyframes[index],window[this.weapons[index]]));
			this.weapons.splice(index,1);
			this.keyframes.splice(index,1);
		}
		var weaponRoom = this.room;
		while(weaponRoom == this.room || weaponRoom.adjacentTo(this.room)){
			weaponRoom = rooms[Math.round(Math.random()*(rooms.length -1))]
		}
		var index = Math.round(Math.random()*(this.keyframes.length - 1));
		Entities.weapon_pickup.newInstance(weaponRoom.x + size/2 - 256,weaponRoom.y + size/2 - 256,this.keyframes[index],window[this.weapons[index]]);
		console.log(this.keyframes[index])
		weaponRoom.weaponRoom = true;
		this.weapons.splice(index,1);
		this.keyframes.splice(index,1);
		
		var endRoom = this.room;
		while(endRoom == this.room || endRoom == weaponRoom || endRoom.adjacentTo(this.room)){
			endRoom = rooms[Math.round(Math.random()*(rooms.length -1))]
		}
		Entities.level_end.newInstance(endRoom.x + size/2 - 128,endRoom.y + size/2 - 128)
		endRoom.endRoom = true;
		
		//add entities
		if(config.entities){
			var populate = function(room){
				if(!room.weaponRoom && !room.endRoom){
					for(var i = 0; i<config.entities.children.length; i++){
						var entity = config.entities.children[i];
						var num = getNodeValue(entity);
						var margin = entity.attributes.margin;
						for(var j = 0; j< num; j++){
							var x = room.x+ (size/2) - (room.width/2) + margin + (Math.random()*(room.width-(margin*2)));
							var y = room.y+ (size/2) - (room.height/2) + margin + (Math.random()*(room.height-(margin*2)));
							Entities[entity.attributes.name].newInstance(x,y);
						}
					}
				}
				room.populated = true
				if(room.north!=null && !room.north.populated)populate(room.north);
				if(room.south!=null && !room.south.populated)populate(room.south);
				if(room.east!=null && !room.east.populated)populate(room.east);
				if(room.west!=null && !room.west.populated)populate(room.west);
			}
			this.room.populated = true;
			if(this.room.north!=null)populate(this.room.north);
			if(this.room.south!=null)populate(this.room.south);
			if(this.room.east!=null)populate(this.room.east);
			if(this.room.west!=null)populate(this.room.west);
		}
	}
	this.visit= function(x,y,width,height){
		for(var i = 0; i<rooms.length; i++){
			var rx = rooms[i].x;
			var ry = rooms[i].y;
			if(Collisions.boxBox(x,y,width,height,rx,ry,size,size)){
				rooms[i].visited = true;
				break;
			}
		}
	}
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
		for(var i = 0; i<this.lines.length; i+=4){
			var x = Math.min(this.lines[i],this.lines[i+2]);
			var y = Math.min(this.lines[i+1],this.lines[i+3]);
			var width = Math.abs(this.lines[i]-this.lines[i+2]);
			var height = Math.abs(this.lines[i+1]-this.lines[i+3]);
			if(screen.collision(x,y,width,height)){
				width = Math.max(6,width);
				height = Math.max(6,height)
				manager.fillRect(x+width/2,y+height/2,this.z,width,height,0,this.r,this.g,this.b,1);
			}
		}
		if(configs.misc.fogOfWar.value){
			for(var i = 0; i<rooms.length; i++){
				var r = rooms[i];
				if(!map_view && screen.collision(r.x,r.y,size,size))r.visited = true
				if(!r.visited && screen.collision(r.x,r.y,size,size)){
					manager.fillRect(r.x+size/2,r.y+size/2,-99.99999,size,size,0,0,0,0,1);
				}
			}
		}
	}
	
}
Map.prototype=fillProperties(new GLDrawable(),{
	z:98,
	boundless:true
});