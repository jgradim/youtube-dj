/* CONSTANTS
------------------------------------------------------------------------------*/

var PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=";
var WIDTH = 480;
var HEIGHT = 295;
var SWF_PARAMS = { allowScriptAccess: "always" };

/* PLAYER
------------------------------------------------------------------------------*/
function create_player(div_id) {
  var swfobject_url = PLAYER_URL + div_id;
  var swfobject_attrs = { id: div_id };
  
  // create the player with swfobject
  swfobject.embedSWF(swfobject_url, div_id, WIDTH, HEIGHT, "8", null, null, SWF_PARAMS, swfobject_attrs);
}

function updatePlayerInfo()

/* CALLBACKS
------------------------------------------------------------------------------*/
function onYouTubePlayerReady(player_id) {
	ytplayer = document.getElementById(player_id);
	setInterval(updatePlayerInfo, 250);
	updatePlayerInfo();
	ytplayer.addEventListener("onStateChange", "onPlayerStateChange"+player_id);
	ytplayer.addEventListener("onError", "onPlayerError");
	//ytplayer1.cueVideoById("jI5_wV0Pk_k");
}
