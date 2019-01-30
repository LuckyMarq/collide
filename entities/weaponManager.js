
function WeaponManager()
{
	// instance variables
 	this.weaponList = [];
 	this.position = 0;
 	this.currentWeapon = undefined;
 	this.overheatSound = Sound.createSound('overheat_fire');
 	this.overheatSound.gain = 0.6;
 	this.overheatEffect = Sound.createSound('overheated');
 	this.overheatEffect.gain = 0.3;
 	this.hasPressed = false;
	this.t = 0;
}

WeaponManager.prototype = Object.defineProperties(
	{
		// Fires the weapon: starting collision checks and drawing
		// Mouse passes false, Game Pad passes true
 		fire: function(dir, isGamePad) {
 			if (!Loop.paused) {
 				this.currentWeapon.fire(dir);
				this.overheated = this.currentWeapon.overheated;
 				if (this.currentWeapon.overheated && !this.hasPressed) {
 					this.overheatSound.play(0);
 					this.hasPressed = true;
 				}
 			}
 			return;
 		},
 	
 		// Stops the weapon from performing checks and drawing
 		holdFire: function(delta) {
 			if (this.currentWeapon.overheated) {
				this.t += delta || 0;
				if (this.t > 0.1) {
					this.overheatEffect.stop(0);
					this.overheatEffect.play(0);
					this.t = 0;
				}
 			}
			this.overheated = this.currentWeapon.overheated;
 			this.hasPressed = false;
			this.currentWeapon.holdFire();
 			return;
 		},
 
 		// Changes Weapon to the specified Index starting at 0
 		swap: function(index) {
 			if (index < this.position) {
 				this.currentWeapon.holdFire();
 				this.currentWeapon = this.weaponList[index];
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
 			for (var i = 0; i < this.position; i++){
				this.weaponList[i].tick(delta); 			
 			}	
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