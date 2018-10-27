//-----------------------------------------------------------------------------
//  Galv's Collide SE
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_CollideSE.js
//-----------------------------------------------------------------------------
//  2017-03-02 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_CollideSE = true;

var Galv = Galv || {};              // Galv's main object
Galv.CSE = Galv.CSE || {};          // Galv's stuff


//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.0) Play a SE when player collides with impassable tile or event
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Sound Effect
 * @desc Sound effect played when hitting the wall.
 * FileName,volume,pitch.
 * @default Blow1,70,120
 *
 * @param Repeat Wait
 * @desc How many frames between playing sounds when constantly colliding with something
 * @default 30
 *
 * @help
 *   Galv's Collide SE
 * ----------------------------------------------------------------------------
 * Just a simple plugin to play a sound effect when the player collides with
 * something impassable.
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {


Galv.CSE.wait = Number(PluginManager.parameters('Galv_CollideSE')["Repeat Wait"]);

Galv.CSE.makeSound = function(txt) {
	if (!txt || txt === "") {
		txt = ",0,0";
	};
	var arr = txt.split(",");
	var obj = {
		name: arr[0],
		pan: 0,
		pitch: Number(arr[2]),
		volume: Number(arr[1])
	};
	return obj;
};

Galv.CSE.se = Galv.CSE.makeSound(PluginManager.parameters('Galv_CollideSE')["Sound Effect"]);

Galv.CSE.Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
	this._collideSeDelay = 0;
	Galv.CSE.Game_Player_initMembers.call(this);
};

Galv.CSE.Game_Player_moveStraight = Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d) {
    if (!this.canPass(this.x, this.y, d) && this._collideSeDelay <= Graphics.frameCount) {
		AudioManager.playSe(Galv.CSE.se);
		this._collideSeDelay = Graphics.frameCount + Galv.CSE.wait;
    }
    Galv.CSE.Game_Player_moveStraight.call(this, d);
};

})();