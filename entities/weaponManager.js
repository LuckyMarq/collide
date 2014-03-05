
function WeaponManager()
{
	// instance variables
 	this.weaponList = [];
 	this.position = 0;
 	this.currentWeapon = undefined;
 	this.overheatSound = Sound.createSound('overheat_fire');
 	this.overheatSound.gain = 0.6;
 	this.hasPressed = false;
}

WeaponManager.prototype = Object.defineProperties(
	{
		// Fires the weapon: starting collision checks and drawing
		// Mouse pases false, Game Pad passes true
 		fire: function(dir) {
 			if (!Loop.paused)
 				this.currentWeapon.fire(dir);
 			if (this.currentWeapon.overheated && !this.hasPressed) {
 				this.overheatSound.play(0);
 				this.hasPressed = true;
 			}
 			return;
 		},
 	
 		// Stops the weapon from performing checks and drawing
 		holdFire: function() {
 			this.hasPressed = false;
 			this.currentWeapon.holdFire();
 			return;
 		},
 
 		// Changes Weapon to the specified Index starting at 0
 		swap: function(index) {
 			if (index < this.position) {
 				this.currentWeapon.holdFire();
 				this.currentWeapon.barVisible = false;
 				this.currentWeapon = this.weaponList[index];
 				this.currentWeapon.barVisible = true;
 			} else {
 				console.error("Weapon does not exist in slot: " + index);
 			}
 			return;
 		},
 	
 		// Adds a weapon to the players inventory
 		add: function(item) {
 			item.holdFire();
			this.weaponList[this.position++] = item;
			if (this.currentWeapon == undefined) {
				this.currentWeapon = this.weaponList[0];
				this.currentWeapon.barVisible = true;			
			}
 			return;
 		},
 		
 		tick: function(delta) {
 			this.currentWeapon.tick(delta);	
 		},
 	
 		// Removes all weapons from the player
 		clear: function() {
 			if (this.currentWeapon) {
 				this.currentWeapon.holdFire();
 			}	
 			this.position = 0;
 			this.weaponList = [];
 			this.currentWeapon = undefined;
 			return;
 		}
	},
	{
		energy:{
			get: function(){
				return this.currentWeapon.energy;
			},
			set:function(e){
				this.currentWeapon.energy = e;
			}
		},
		overheated:{
			get: function() {
				return !!this.currentWeapon.overheated;
			},
			set:function(o) {
				this.currentWeapon.overheated = !!o;
			}
		}
	}
);