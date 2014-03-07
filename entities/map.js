/**
*	This file defines a map object for the current game
*/

function Map(config){
	var num= 0;
	var lines= new Array();
	this.lines = lines;
	this.config = config;
	this.populators = new Array();
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
	this.getNodeValue = getNodeValue;
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
		this.north = north || null;
		this.south = south || null;
		this.east = east || null;
		this.west = west || null;
		var first = true;
		rooms.push(this);
		num++;
		
		this.build = function(){
			if(num<limit && (this.north == null || !this.north) && (Math.random() <= roomChance) && north == null && check(x, y+size)){
				this.north = new Room(null,null,this,null,x,y+size, limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}
			if(num<limit && (this.south == null || !this.south) && (Math.random() <= roomChance) && south == null && check(x, y-size)){
				this.south = new Room(this,null,null,null,x,y-size,limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}
			if(num<limit && (this.east == null || !this.east) && (Math.random() <= roomChance) && east == null && check(x+size,y)){
				this.east = new Room(null,null,null,this, x+size,y,limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}
			if(num<limit && (this.west == null || !this.west) && (Math.random() <= roomChance) && west == null && check(x-size, y)){
				this.west= new Room(null,this,null,null,x-size,y,limit, roomChance,minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth);
			}
		}
		
		
		this.initLines= function(){
			this.width = Math.min(1,(minWidth + (Math.random() * (maxWidth - minWidth))))*size;
			this.height= Math.min(1,(minHeight + (Math.random() * (maxHeight - minHeight))))*size;
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
	
	
	this.rebuild = function(reset){
		config = getConfiguration(this.config);
		if(reset){
			this.keyframes = this.config.keyframes.value.slice(0,this.config.keyframes.value.length);
			this.weapons = this.config.weapons.value.slice(0,this.config.weapons.value.length);
		}
		size = getNodeValue(config.rooms.size);
		this.size = size;
		num = 0;
		var limit = Math.round(getNodeValue(config.rooms));
		lines.length = 0;
		rooms.length = 0;
		this.setColor(2);
		this.room = new Room(null,null,null,null,0,0,limit, getNodeValue(config.rooms.density), 
				config.rooms.width.min.value, config.rooms.width.max.value, config.rooms.height.min.value,
				config.rooms.width.max.value, size, getNodeValue(config.rooms.connectorSize));
		while(num<limit){
			var rms = rooms.slice(0,rooms.length)
			for(var i = 0; num<limit && i<rms.length; i++){
				rms[i].build();
			}
		}
		this.room.checkConnections(getNodeValue(config.rooms.connectivity));
		this.room.initLines();
		
		this.populators.length = 0;
		for(var i = 0; i<config.populators.children.length; i++){
			this.populators.push(RoomPopulators[config.populators.children[i].name].apply(new Object(),
				(config.populators.children[i].value instanceof Array) ? config.populators.children[i].value : []));
		}
		this.populators.sort(function(a,b){return a.priority-b.priority})
	}
	this.init = function(player,weaponId){
		if(player){
			Entities.player_initializer.newInstance(this.room.x+size/2,this.room.y + size/2,player);
		}else{
			//create player
			var index = (configs.map.startWeapon) ? configs.map.startWeapon.value : weaponId || Math.floor(Math.random()*this.keyframes.length)
			Entities.player_initializer.newInstance(this.room.x+size/2,this.room.y + size/2,Entities.player.newInstance(this.room.x+size/2,this.room.y + size/2,this.keyframes[index],this.weapons[index]));
			this.weapons.splice(index,1);
			this.keyframes.splice(index,1);
		}
		this.room.full = true;
		
		for(var i = 0; i<this.populators.length; i++){
			shuffle(rooms);
			var pop = this.populators[i];
			var num = rooms.length;
			var c = 0;
			if(pop.max){
				var min = ((pop.min)?pop.min:0);
				num = min +(pop.max-pop.min)*Math.random();
			}
			for(var j = 0; j<rooms.length && c<num; j++){
				if(!rooms[j].full && pop.populate(config,rooms[j],this))c++;
			}
		}
		
		for(var i = 0; i<rooms.length; i++){
			rooms[i].visited = false;
		}
		// var weaponRoom = this.room;
		// while(weaponRoom == this.room || weaponRoom.adjacentTo(this.room)){
			// weaponRoom = rooms[Math.round(Math.random()*(rooms.length -1))]
		// }
		// var index = Math.round(Math.random()*(this.keyframes.length - 1));
		// Entities.weapon_pickup.newInstance(weaponRoom.x + size/2 - 256,weaponRoom.y + size/2 - 256,this.keyframes[index],this.weapons[index]);
		// console.log(this.keyframes[index])
		// weaponRoom.full = true;
		// this.weapons.splice(index,1);
		// this.keyframes.splice(index,1);
		
		// var endRoom = this.room;
		// while(endRoom == this.room || endRoom == weaponRoom || endRoom.adjacentTo(this.room)){
			// endRoom = rooms[Math.round(Math.random()*(rooms.length -1))]
		// }
		// Entities.level_end.newInstance(endRoom.x + size/2 - 128,endRoom.y + size/2 - 128)
		// endRoom.full = true;
		
		// if(config.entities){
			// var populate = function(room){
				// if(!room.full){
					// for(var i = 0; i<config.entities.children.length; i++){
						// var entity = config.entities.children[i];
						// var num = getNodeValue(entity);
						// var margin = entity.attributes.margin;
						// for(var j = 0; j< num; j++){
							// var x = room.x+ (size/2) - (room.width/2) + margin + (Math.random()*(room.width-(margin*2)));
							// var y = room.y+ (size/2) - (room.height/2) + margin + (Math.random()*(room.height-(margin*2)));
							// Entities[entity.attributes.name].newInstance(x,y);
						// }
					// }
				// }
				// room.populated = true
				// if(room.north!=null && !room.north.populated)populate(room.north);
				// if(room.south!=null && !room.south.populated)populate(room.south);
				// if(room.east!=null && !room.east.populated)populate(room.east);
				// if(room.west!=null && !room.west.populated)populate(room.west);
			// }
			// this.room.populated = true;
			// if(this.room.north!=null)populate(this.room.north);
			// if(this.room.south!=null)populate(this.room.south);
			// if(this.room.east!=null)populate(this.room.east);
			// if(this.room.west!=null)populate(this.room.west);
		// }
	}
	this.visit= function(x,y,width,height){
		for(var i = 0; i<rooms.length; i++){
			var rx = rooms[i].x+(size/2)-(rooms[i].width/2);
			var ry = rooms[i].y+(size/2)-(rooms[i].height/2);
			if(Collisions.boxBox(x,y,width,height,rx,ry,rooms[i].width,rooms[i].height)){
				rooms[i].visited = true;
				break;
			}
		}
	},
	this.fogOver = function(){
		for(var i = 0; i<rooms.length; i++){
			rooms[i].visited = false;
		}
	},
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
		if(configs.misc.fogOfWar.value && map_view){
			for(var i = 0; i<rooms.length; i++){
				var r = rooms[i];
				if(!r.visited && screen.collision(r.x,r.y,size,size)){
					manager.fillRect(r.x+(size/2),r.y+(size/2),-99.99999,size,size,0,0,0,0,1);
				}
			}
		}
	}
	this.rebuild(true)
}
Map.prototype=fillProperties(new GLDrawable(),{
	z:98,
	boundless:true,
	setColor: function(gr){
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
});

RoomPopulators = {
	RandomEnemies: function(){
		return{
			populate: function(config,room,map){
				var size = map.size;
				for(var i = 0; i<config.entities.children.length; i++){
					var entity = config.entities.children[i];
					var num = map.getNodeValue(entity);
					var margin = entity.attributes.margin;
					for(var j = 0; j< num; j++){
						var x = room.x+ (size/2) - (room.width/2) + margin + (Math.random()*(room.width-(margin*2)));
						var y = room.y+ (size/2) - (room.height/2) + margin + (Math.random()*(room.height-(margin*2)));
						Entities[entity.attributes.name].newInstance(x,y);
					}
				}
				room.full = true;
			},
			priority: 100
		}
	},
	WeaponRoom: function(){
		return {
			populate: function(config,room,map){
				var size = map.size;
				if(room.adjacentTo(map.room)){
					return false;
				}else if(map.weapons.length>0){
					var index = Math.floor(Math.random()*(map.keyframes.length));
					Entities.weapon_pickup.newInstance(room.x + size/2 - 256,room.y + size/2 - 256,map.keyframes[index],map.weapons[index]);
					room.full = true;
					map.weapons.splice(index,1);
					map.keyframes.splice(index,1);
				}
				return true;
			},
			min: 1,
			max: 1,
			priority: 0
		}
	},
	EndRoom: function(){
		return {
			populate: function(config,room,map){
				var size = map.size;
				if(room.adjacentTo(map.room)){
					return false;
				}
				Entities.level_end.newInstance(room.x + size/2 - 128,room.y + size/2 - 128)
				room.full = true;
				return true;
			},
			min: 1,
			max: 1,
			priority: 0
		}
	},
	RoomCenter: function(min,max,priority,fill,entity,xOffset,yOffset){
		
		xOffset = xOffset || constructor.xOffset || constructor.width/2 || 0
		yOffset = yOffset || constructor.yOffset || constructor.height/2 || 0
		return {
			populate: function(config,room,map){
				Entities[entity].newInstance(room.x + map.size/2 - xOffset,room.y + map.size/2 - yOffset)
				if(fill)room.full = true;
				return true;
			},
			min: min,
			max: max,
			priority: priority
		}
	},
	FourCorners: function(min,max,priority,fill,entity,xOffset,yOffset,xMargin,yMargin){
		
		xOffset = xOffset || constructor.xOffset || constructor.width/2 || 0
		yOffset = yOffset || constructor.yOffset || constructor.height/2 || 0
		return {
			populate: function(config,room,map){
				Entities[entity].newInstance(room.x + (map.size/2) - (room.width/2) + xMargin - xOffset,room.y + map.size/2 - (room.height/2) + yMargin - yOffset);
				Entities[entity].newInstance(room.x + (map.size/2) + (room.width/2) - xMargin - xOffset,room.y + map.size/2 - (room.height/2) + yMargin - yOffset);
				Entities[entity].newInstance(room.x + (map.size/2) + (room.width/2) - xMargin - xOffset,room.y + map.size/2 + (room.height/2) - yMargin - yOffset);
				Entities[entity].newInstance(room.x + (map.size/2) - (room.width/2) + xMargin - xOffset,room.y + map.size/2 + (room.height/2) - yMargin - yOffset)
				if(fill)room.full = true;
				return true;
			},
			min: min,
			max: max,
			priority: priority
		}
	}
}