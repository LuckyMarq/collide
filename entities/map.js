/**
*	This file defines a map object for the current game
*/

function Map(limit, roomChance, minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth){
	var num= 0;
	var lines= new Array();
	this.lines = lines;
	var rooms= new Array();
	var check = function(x,y){
		for(var i in rooms) {
			if( rooms[i].x == x && rooms[i].y == y){
				return false;
			}
		}
		return true;
	}
	var  Room = function(north,east,south,west,x,y){
		this.x = x;
		this.y= y;
		north = north || null;
		south = south || null;
		east = east || null;
		west = west || null;
		var first = true;
		rooms.push(this);
		num++;
		while(((this.north==null && this.east == null && this.south==null && this.west == null)||first) && num<=limit){
			first = false;
			if((Math.random() <= roomChance) && north == null && check(x, y+size)){
				this.north = new Room(null,null,this,null,x,y+size);
			}
			if((Math.random() <= roomChance) && south == null && check(x, y-size)){
				this.south = new Room(this,null,null,null,x,y-size);
			}
			if((Math.random() <= roomChance) && east == null && check(x+size,y)){
				this.east = new Room(null,null,null,this, x+size,y);
			}
			if((Math.random() <= roomChance) && west == null && check(x-size, y)){
				this.west= new Room(null,this,null,null,x-size,y);
			}      
		}
		this.north = (north!=null) ? north : this.north;
		this.south =  (south!=null) ? south : this.south;
		this.east =  (east!=null) ? east : this.east;
		this.west = (west!=null) ? west : this.west;
		
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
	}
	Room.prototype = {
		north: null,
		east: null,
		south: null,
		west: null,
		connected: false
	}
	this.room = new Room(null,null,null,null,0,0);
	
	this.init = function(enemies,margin,keyframes,weapons,player){
		if(player){
			player.set(this.room.x+size/2,this.room.y + size/2,0,0,0,0)
		}else{
			//create player
			var index = Math.round(Math.random()*(keyframes.length -1))
			Entities.player.newInstance(this.room.x+size/2,this.room.y + size/2,keyframes[index],weapons[index]);
			weapons.splice(index,1);
			keyframes.splice(index,1);
		}
		var weaponRoom = this.room;
		while(weaponRoom == this.room){
			weaponRoom = rooms[Math.round(Math.random()*(rooms.length -1))]
		}
		var index = Math.round(Math.random()*(keyframes.length - 1));
		Entities.weapon_pickup.newInstance(weaponRoom.x + size/2,weaponRoom.y + size/2,keyframes[index],weapons[index]);
		weaponRoom.weaponRoom = true;
		//add enemies
		if(enemies){
			var populate = function(room,d){
				if(!room.weaponRoom){
					for(var i in enemies){
						var num = enemies[i].def.max * Math.random();
						for(var j = 0; j< num; j++){
							var x = room.x+ (size/2) - (room.width/2) + margin + (Math.random()*(room.width-(margin*2)));
							var y = room.y+ (size/2) - (room.height/2) + margin + (Math.random()*(room.height-(margin*2)));
							enemies[i].newInstance(x,y);
						}
					}
				}
				
				if(room.north!=null && d!=1)populate(room.north,0);
				if(room.south!=null && d!=0)populate(room.south,1);
				if(room.east!=null && d!=3)populate(room.east,2);
				if(room.west!=null && d!=2)populate(room.west,3);
			}
			
			if(this.room.north!=null)populate(this.room.north,0);
			if(this.room.south!=null)populate(this.room.south,1);
			if(this.room.east!=null)populate(this.room.east,2);
			if(this.room.west!=null)populate(this.room.west,3);
		}
		
		
	}
	
}
Map.prototype=fillProperties(new GLDrawable(),{
	draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
		for(var i = 0; i<this.lines.length; i+=4){
			var x = Math.min(this.lines[i],this.lines[i+2]);
			var y = Math.min(this.lines[i+1],this.lines[i+3]);
			var width = Math.abs(this.lines[i]-this.lines[i+2]);
			var height = Math.abs(this.lines[i+1]-this.lines[i+3]);
			if(screen.collision(x,y,width,height)){
				//manager.line(this.lines[i],this.lines[i+1],this.lines[i+2],this.lines[i+3],98);
				width = Math.max(6,width);
				height = Math.max(6,height)
				manager.fillRect(x+width/2,y+height/2,this.z,width,height,0,1,1,0,1)
				
			}
		}
	},
	z:98,
	boundless:true
});