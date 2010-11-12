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
	ytplayer.cueVideoById("jI5_wV0Pk_k");
	ytplayer.setVolume(100);
	
	// bind player controls to buttons
	var container_div = $("#"+player_id).parents("div.player");
	
	// update player info / status
	setInterval(function(){	
	
	  // perform loop based on range sliders
		if(container_div.find('input.loop').is(":checked")) {
			var values = container_div.find('div.loop').slider("values");
			var time = [(ytplayer.getDuration()*values[0])/100, (ytplayer.getDuration()*values[1])/100];
			if(ytplayer.getCurrentTime() >= time[1]) {
				ytplayer.seekTo(time[0], true);
			}
		}
		
		// update progress bar
		var progress = ytplayer.getCurrentTime() / ytplayer.getDuration() * 100;
		container_div.find('div.progress span').css({width: progress+"%"});
		
		// update loop labels
		container_div.find('span.loop-left').text('tempo');
		container_div.find('span.loop-right').text('tempo');
		
	}, 250);
	
	// respond to player state changes:
	//
	// needs to be on global scope, but still have access to 'ytplayer'
	// because youtube API only calls functions from strings and does not call
	// anonymous functions passed directly
	window.state_changed_left = function(state) {
	
	  var container_div = $("div#player-left");
	
	  // button state
	  if(state == PLAYING) { container_div.find('button.play').addClass('playing'); }
	  if(state == PAUSED) { container_div.find('button.play').removeClass('playing'); }
	  
		// time for the next song? (only if not looping)
		if(!container_div.find('input.loop').is(":checked") && state == ENDED) {
		  var li = container_div.find('ol.queue li:first');
      ytplayer.loadVideoById(li.data('video-id'));
      li.remove();
		}
	}
	window.state_changed_right = function(state) {
	
	  var container_div = $("div#player-right");
	
	  // button state
	  if(state == PLAYING) { container_div.find('button.play').addClass('playing'); }
	  if(state == PAUSED) { container_div.find('button.play').removeClass('playing'); }
	  
		// time for the next song? (only if not looping)
		if(!container_div.find('input.loop').is(":checked") && state == ENDED) {
		  var li = container_div.find('ol.queue li:first');
      ytplayer.loadVideoById(li.data('video-id'));
      li.remove();
		}
	}
	if(player_id == "ytplayer1") ytplayer.addEventListener("onStateChange", "state_changed_left");
	if(player_id == "ytplayer2") ytplayer.addEventListener("onStateChange", "state_changed_right");
	
	// progess / seek bar
	container_div.find('div.progress').click(function(ev) {
	  var width = $(this).width();
	  var pos = ev.clientX - $(this).offset().left;
	  var percent = pos / width;
	  ytplayer.seekTo(ytplayer.getDuration()*percent, true);
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
	
	// video controls
	container_div.find("button.play").click(function() {
	  var state = ytplayer.getPlayerState();	  
	  if(state == PAUSED || state == QUEUED) ytplayer.playVideo();
	  else if(state == PLAYING) ytplayer.pauseVideo();
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
	
	// loop
	container_div.find('div.loop').slider({
	  animate: true,
	  values: [ 0, 100 ],
	  slide: function(event, ui) {
	    var ll = ui.values[0] * container_div.find('div.loop').width() / 100 + 12;
	    var lr = ui.values[1] * container_div.find('div.loop').width() / 100 + 12;
		  container_div.find('span.loop-left').css({ left: ll });
		  container_div.find('span.loop-right').css({ left: lr  });
	  },
	  change: function(event, ui) {
	    var ll = ui.values[0] * container_div.find('div.loop').width() / 100 + 12;
	    var lr = ui.values[1] * container_div.find('div.loop').width() / 100 + 12;
		  container_div.find('span.loop-left').css({ left: ll });
		  container_div.find('span.loop-right').css({ left: lr  });
	  }
	}).slider('values', 0, [0]).slider('values', 0, [100]);
	
	// ytplayer disappears from now on, for some freakish reason;
}

