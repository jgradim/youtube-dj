/* CONSTANTS
------------------------------------------------------------------------------*/

var PLAYER_URL = "http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=";
var WIDTH = 480;
var HEIGHT = 295;
var SWF_PARAMS = { allowScriptAccess: "always" };

// player states: unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
var UNSTARTED = -1;
var ENDED = 0;
var PLAYING = 1;
var PAUSED = 2;
var BUFFERING = 3;
var QUEUED = 5;

/* PLAYER
------------------------------------------------------------------------------*/
// create_player("#player-left", 1);
// create_player("#player-right", 2);
function create_player(container_div, id) {
  swfobject_url = PLAYER_URL + "ytplayer" + id;
  swfobject_attrs = { id: "ytplayer" + id }; // id of the <object> element
  div_id = $(container_div).find("div.video div").attr('id');
  
  // create the player with swfobject
  swfobject.embedSWF(swfobject_url, div_id, WIDTH, HEIGHT, "8", null, null, SWF_PARAMS, swfobject_attrs);
}

/* CALLBACKS
------------------------------------------------------------------------------*/
function onYouTubePlayerReady(player_id) {

  // load video, set listeners
	var ytplayer = document.getElementById(player_id);
	
	//ytplayer.addEventListener("onError", "onPlayerError");
	ytplayer.cueVideoById("jI5_wV0Pk_k");
	ytplayer.setVolume(100);
	
	// bind player controls to buttons
	var container_div = $("#"+player_id).parents("div.player");
	
	// update player info / status
	setInterval(function(){	
	
	  // perform loop based on range sliders
		if(container_div.find('input.loop').is(":checked")){
			var values = container_div.find('div.loop').slider("values");
			var time = [(ytplayer.getDuration()*values[0])/100,
						(ytplayer.getDuration()*values[1])/100];
			if(ytplayer.getCurrentTime() >= time[1]){
				ytplayer.seekTo(time[0], true);
			}
		}
	}, 250);
	
	// respond to player state changes
	ytplayer.addEventListener("onStateChange", function(state) {
	
	  // button state
	  if(state == PLAYING) { container_div.find('button.play').addClass('playing'); }
	  if(state == PAUSED) { container_div.find('button.play').removeClass('playing'); }
	  
		// time for the next song? (only if not looping)
		if(!container_div.find('input.loop').is(":checked") && state == ENDED) {
		  var li = container_div.find('ol.queue li:first');
      ytplayer.loadVideoById(li.data('video-id'));
      li.remove();
		}
	});
	
	// volume slider
	container_div.find('div.volume').slider({
	  orientation: 'vertical',
	  animate: true,
	  value: 100,
	  slide: function(event, ui) {
		ytplayer.setVolume(ui.value);
	  },
	  change: function(event, ui) {
		ytplayer.setVolume(ui.value);
	  }
	});
	
	// loop
	container_div.find('div.loop').slider({
	  animate: true,
	  values: [ 0, 100 ],
	  slide: function(event, ui) {
		ui.values[ 0 ] ,ui.values[ 1 ] 
	  }
	});
	
	container_div.find("button.play").click(function() {
	  var state = ytplayer.getPlayerState();	  
	  if(state == PAUSED || state == QUEUED) ytplayer.playVideo();
	  else if(state == PLAYING) ytplayer.pauseVideo();
    $(this).toggleClass('playing');
  });
  
  container_div.find("button.mute").click(function() {
    if(ytplayer.isMuted()) ytplayer.unMute();
    else ytplayer.mute();
    $(this).toggleClass('muted');
  });
  
  container_div.find("button.next").click(function() {
    var li = container_div.find('ol.queue li:first');
    ytplayer.loadVideoById(li.data('video-id'));
    li.remove();
  });
}
