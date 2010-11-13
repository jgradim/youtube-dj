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

/* HELPER FUNCTIONS
*/
function timestring(seconds) {
  var m = Math.floor(seconds / 60);
  var s = Math.floor(seconds % 60);
  if(m < 10) m = "0"+m;
  if(s < 10) s = "0"+s;
  return m+":"+s;
}

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
	
	// bind player controls to buttons
	var container_div = $("#"+player_id).parents("div.player");
	
	// update player info / status
	setInterval(function(){	
	
	  // perform loop based on range sliders
    var values = container_div.find('div.loop').slider("values");
	  var time = [(ytplayer.getDuration()*values[0])/100, (ytplayer.getDuration()*values[1])/100];
		if(container_div.find('input.loop').is(":checked")) {
			if(ytplayer.getCurrentTime() >= time[1]) {
				ytplayer.seekTo(time[0], true);
			}
		}
		
		// update progress bar
		var progress = ytplayer.getCurrentTime() / ytplayer.getDuration() * 100;
		container_div.find('div.progress span').css({width: progress+"%"});
		container_div.find('div.progress p').text(timestring(ytplayer.getCurrentTime()));
		
		// update loop labels
		container_div.find('span.loop-left').text(timestring(time[0]));
		container_div.find('span.loop-right').text(timestring(time[1]));
		
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
	
	//
	var adjust_left;
	var adjust_right;
	if(player_id == "ytplayer1") {
		ytplayer.loadVideoById("jI5_wV0Pk_k");
		ytplayer.pauseVideo();
		ytplayer.addEventListener("onStateChange", "state_changed_left");
		ytplayer.setVolume(100);
		adjust_left = 17;
		adjust_right = 25;
	}
	else if(player_id == "ytplayer2") {
		ytplayer.loadVideoById("bf5x3LtWzVA");
		ytplayer.pauseVideo();
		ytplayer.addEventListener("onStateChange", "state_changed_right");
		ytplayer.setVolume(0);
		adjust_left = 37;
		adjust_right = 5;
	}
	
	// progess / seek bar
	container_div.find('div.progress').click(function(ev) {
	  var width = $(this).width();
	  var pos = ev.clientX - $(this).offset().left;
	  var percent = pos / width;
	  ytplayer.seekTo(ytplayer.getDuration()*percent, true);

      // register event
      var ev = {
        "player_id": container_div.attr('id'),
        "percent": ytplayer.getDuration()*percent
      };
      addEvent("seek", ev);
	});
	
	// volume slider
	container_div.find('div.volume').slider({
	  orientation: 'vertical',
	  animate: true,
	  value: ytplayer.getVolume(),
	  slide: function(event, ui) {
		  ytplayer.setVolume(ui.value);
		  if(player_id == "ytplayer1"){
			  var R = 255;
			  var G = parseInt(255*((100-ytplayer.getVolume())/100));
			  var B = parseInt(255*((100-ytplayer.getVolume())/100));
			  var rgb = "rgb(" + R + "," + G + "," + B + ")";
			  $("div#vLeft").css("background-color",rgb);
		  }else  if(player_id == "ytplayer2"){
			  var R = 255;
			  var G = parseInt(255*((100-ytplayer.getVolume())/100));
			  var B = parseInt(255*((100-ytplayer.getVolume())/100));
			  var rgb = "rgb(" + R + "," + G + "," + B + ")";
			  $("div#vRight").css("background-color",rgb);
		  }

          // register event
          var ev = {
            "player_id": container_div.attr('id'),
            "volume": ui.value
          };
          addEvent("updateVolume", ev);
	  },
	  change: function(event, ui) {
		  ytplayer.setVolume(ui.value);

          // register event
          var ev = {
            "player_id": container_div.attr('id'),
            "volume": ui.value
          };
          addEvent("updateVolume", ev);
	  },	  
	  stop: function(event, ui) {
		  ytplayer.setVolume(ui.value);

          // register event
          var ev = {
            "player_id": container_div.attr('id'),
            "volume": ui.value
          };
          addEvent("updateVolume", ev);
	  }
	  
	});
	
	// video controls
	container_div.find("button.play").click(function() {
	  var state = ytplayer.getPlayerState();	  
	  if(state == PAUSED || state == QUEUED) ytplayer.playVideo();
	  else if(state == PLAYING) ytplayer.pauseVideo();

      // register event
      var ev = {
        "player_id": container_div.attr('id')
      };
      addEvent("togglePlaying", ev);
      return false;
  });
  
  container_div.find("button.mute").click(function() {
    if(ytplayer.isMuted()) ytplayer.unMute();
    else ytplayer.mute();
    $(this).toggleClass('muted');

    // register event
    var ev = {
      "player_id": container_div.attr('id')
    };
    addEvent("toggleMute", ev);
  });
  
  container_div.find("button.next").click(function() {
    var li = container_div.find('ol.queue li:first');
    ytplayer.loadVideoById(li.data('video-id'));
    li.remove();

    // register event
    var ev = {
      "player_id": container_div.attr('id')
    };
    addEvent("nextVideo", ev);
  });
  
  container_div.find('input[type=checkbox]').change(function(){
    container_div.find('label').toggleClass('looping');

    // register event
    var ev = {
      "player_id": container_div.attr('id')
    };
    addEvent("toggleLoop", ev);
  });
	
	// loop
	container_div.find('div.loop').slider({
	  animate: true,
	  range: true,
	  step: 0.1,
	  values: [ 0, 100 ],
	  step: 0.1,
	  slide: function(event, ui) {
	    var ll = ui.values[0] * container_div.find('div.loop').width() / 100 - adjust_left;
	    var lr = ui.values[1] * container_div.find('div.loop').width() / 100 + adjust_right;
		  container_div.find('span.loop-left').css({ left: ll });
		  container_div.find('span.loop-right').css({ left: lr  });

          // register event
          var ev = {
            "player_id": container_div.attr('id'),
            "ll": ll,
            "lr": lr
          };
          addEvent("updateLoop", ev);
	  },
	  change: function(event, ui) {
	    var ll = ui.values[0] * container_div.find('div.loop').width() / 100 - adjust_left;
	    var lr = ui.values[1] * container_div.find('div.loop').width() / 100 + adjust_right;
		  container_div.find('span.loop-left').css({ left: ll });
		  container_div.find('span.loop-right').css({ left: lr  });

          // register event
          var ev = {
            "player_id": container_div.attr('id'),
            "ll": ll,
            "lr": lr
          };
          addEvent("updateLoop", ev);
	  }
	}).slider('values', 0, [0]).slider('values', 0, [100]);
	
	// ytplayer disappears from now on, for some freakish reason;
}

