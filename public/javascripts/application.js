var events = new Array();
var recording_start;
var playset_start;

// demo set
var demoset = [
    {   "timestamp": 1,
        "action": "addToQueue",
        "params": {
            "player_id": 1,
            "title": "Nataly Dawn Pomplamoose Music",
            "video_id": "6VLXgsDQNr8"
        }
    },
    {   "timestamp": 2,
        "action": "addToQueue",
        "params": {
            "player_id": 2,
            "title": "The Prodigy - Firestarter",
            "video_id": "wmin5WkOuPw"
        }
    },
    {   "timestamp": 3,
        "action": "nextVideo",
        "params": {
            "player_id": "player-left",
        }
    },
    {   "timestamp": 4,
        "action": "nextVideo",
        "params": {
            "player_id": "player-right",
        }
    }
];

String.prototype.yt_id = function() {
  return this.match(/\/videos\/(.*)$/)[1];
}

var searched_video, queued_video;
$(document).ready(function() {
	

  // create video players
  create_player("#player-left",  1);
  create_player("#player-right", 2);

  // mustache templates
  $.get('/templates/searched_video.html', function(data){
    searched_video = data;
  });
  $.get('/templates/queued_video.html', function(data){
    queued_video = data;
  });
  
  // searching
  $('input[name=q]').keypress(function(ev){ ev.stopPropagation(); });
  $("div.player form").submit(function(){
    var q = $(this).find("input").val();
    var ol = $(this).siblings('div.search-results').find('ol');
    ol.empty();
    
    $.ajax({
      type: "GET",
      url: "http://gdata.youtube.com/feeds/api/videos",
      data: {
        "q": q,
        "alt": "json-in-script",
        "format": 5,
        "restriction": "PT",
        "category": "music",
        "max-results": 6
      },
      cache: false,
      dataType:'jsonp',
      success: function(results) {
        try {
          $.each(results.feed.entry, function(i, result){
            
            var li = Mustache.to_html(searched_video, {
              video_id: result.id["$t"].yt_id(),
              img: result["media$group"]["media$thumbnail"][0].url,
              alt: result.title["$t"],
              title: result.title["$t"]
            });
            
            ol.append(li);
          });
          ol.parent().show();
          $(this).find("input").val('');
        }
        catch(err) {  // no results
        }
      }
    });
    return false;
  });
  
  // add searched videos to queue
  $("div.search-results ol li").live('click', function(){
    var li = Mustache.to_html(queued_video, {
      video_id: $(this).data('video-id'),
      title: $(this).find('span').text()
    })
    $(this).parents('div.search-results').siblings('ol.queue').append(li);
    $(this).parents('div.search-results').hide();
    // register event
    var ev = {
        player_id: $(this).parents('div.search-results').siblings('div.status').data('player-id'),
        video_id: $(this).data('video-id'),
        title: $(this).find('span').text()
    };
    addEvent("addToQueue",ev);
    return false;
  });
  
  // allow removal of queued videos
  $("ol.queue li a.close").live('click', function(){
    // register event
    var ev = {
        "queued_video_id": $(this).parent().data('video-id')
    }
    addEvent("removeFromQueue",ev);

    $(this).parent().remove();
    return false;
  });
  
  // allow sorting of the queued videos
  $('ol.queue').sortable();
  
  // record / play buttons status
  $('button#record-set').click(function() {
    $(this).toggleClass('recording');
    if($(this).hasClass('recording')) {
        recording_start = new Date().getTime();
    }
    return false;
  });
  $('button#play-set').click(function() {
    $(this).toggleClass('playing');
    if($(this).hasClass('playing')) {
        playset_start = new Date().getTime();
        setInterval("playSet();", 1000);
    }
  });
  
  // crossfade functionality
  $("div#crossfade-control").slider({
    min: -50,
    max: 50,
    value: -50,
    //animate: true,
    slide: function(ev, ui) {
		  var playerLeft = document.getElementById('ytplayer1');
		  var playerRight = document.getElementById('ytplayer2');
		  if(ui.value == 0){
			  $("div#player-left div.volume").slider('value', 50);
			  $("div#player-right div.volume").slider('value', 50);
		  }
		  else if(ui.value < 0){
			  $("div#player-left div.volume").slider('value', 50+(ui.value*-1));
			  $("div#player-right div.volume").slider('value', 50+ui.value);
		  }
		  else{
			  $("div#player-left div.volume").slider('value', 50+(ui.value*-1));
			  $("div#player-right div.volume").slider('value', 50+ui.value);
		  }
		
	    var R = 255;
	    var G = parseInt(255*((100-playerLeft.getVolume())/100));
	    var B = parseInt(255*((100-playerLeft.getVolume())/100));
	    var rgb = "rgb(" + R + "," + G + "," + B + ")";
	    $("div#vLeft").css("background-color",rgb);
	    var R = 255;
	    var G = parseInt(255*((100-playerRight.getVolume())/100));
	    var B = parseInt(255*((100-playerRight.getVolume())/100));
	    var rgb = "rgb(" + R + "," + G + "," + B + ")";
	    $("div#vRight").css("background-color",rgb);

        // register event
        var ev = {
          "value": ui.value
        };
        addEvent("crossfade", ev);
    }
  });
  
  // keyboard control
  $(window).keypress(function(ev){
  
    var vc = $("div#crossfade-control").slider('value');
    var vl = $("div#player-left div.volume").slider('value');
    var vr = $("div#player-right div.volume").slider('value');
    
    switch(ev.which) {
      case 113: $("div#player-left button.play").click(); break; // Q
      case 119: $("div#player-left button.mute").click(); break; // W
      case 101: $("div#player-left button.next").click(); break; // E
      case 114: $("div#player-left input.loop").change(); break; // R
      
      case 117: $("div#player-right button.play").click(); break; // U
      case 105: $("div#player-right button.mute").click(); break; // I
      case 111: $("div#player-right button.next").click(); break; // O
      case 112: $("div#player-right input.loop").change(); break; // P
      
      case 116: $("button#record-set").click(); break;            // T
      case 121: $("button#play-set").click(); break;              // Y
      
      case 103: {
        $("div#crossfade-control").slider('value', vc - 5);
        $("div#player-left div.volume").slider('value', vl + 5);
        $("div#player-right div.volume").slider('value', vr - 5);
      } break;                                                    // G
      case 104: {
        $("div#crossfade-control").slider('value', vc + 5);
        $("div#player-left div.volume").slider('value', vl - 5);
        $("div#player-right div.volume").slider('value', vr + 5);
      } break;                                                    // H
      
      case  97: $("div#player-left div.volume").slider('value', vl + 5); break; // A
      case 122: $("div#player-left div.volume").slider('value', vl - 5); break; // Z
    }
  })
  
});

function addEvent(action, ev)
{
    if($('button#record-set').hasClass('recording')) {
        var timestamp = new Date().getTime() - recording_start;
        var myevent = {
            "timestamp": timestamp,
            "action": action,
            "params": ev
        };
        events.push(myevent);
    }
}

function playSet()
{
    // play a given set
/*
    var i=0;
    for(i=0; i < demoset.length; i++) {
      var ev = demoset[i];
      switch(ev.action) {
        case "addToQueue":
            //TODO refactor
            var li = Mustache.to_html(queued_video, {
              video_id: ev.params.video_id,
              title: ev.params.title
            })
            plyr = (ev.params.player_id == 1) ? "player-left" : "player-right";
            $("div#"+plyr+" ol.queue").append(li);
            break;
        case "nextVideo":
            var li = $("div#"+ev.params.player_id+" ol.queue li:first");
            var playerid = (ev.params.player_id == "player-left") ? "ytplayer1" : "ytplayer2";
            var ytplayer = document.getElementById(playerid);

            ytplayer.loadVideoById(li.data('video-id'));
            li.remove();
            break;
        default:
            break;
      } 
    }
*/
    var ev = demoset[0];
    var playing_set_time = new Date().getTime() - playset_start; 
    if(ev.timestamp <= playing_set_time) {
      demoset.shift();
      switch(ev.action) {
        case "addToQueue":
            //TODO refactor
            var li = Mustache.to_html(queued_video, {
              video_id: ev.params.video_id,
              title: ev.params.title
            })
            plyr = (ev.params.player_id == 1) ? "player-left" : "player-right";
            $("div#"+plyr+" ol.queue").append(li);
            break;
        case "nextVideo":
            var li = $("div#"+ev.params.player_id+" ol.queue li:first");
            var playerid = (ev.params.player_id == "player-left") ? "ytplayer1" : "ytplayer2";
            var ytplayer = document.getElementById(playerid);

            ytplayer.loadVideoById(li.data('video-id'));
            li.remove();
            break;
        case "crossfade":
		    var playerLeft = document.getElementById('ytplayer1');
		    var playerRight = document.getElementById('ytplayer2');
		    if(ev.params.value == 0){
			  $("div#player-left div.volume").slider('value', 50);
		  	  $("div#player-right div.volume").slider('value', 50);
		    }
		    else if(ev.params.value < 0){
		  	  $("div#player-left div.volume").slider('value', 50+(ev.params.value*-1));
		  	  $("div#player-right div.volume").slider('value', 50+ev.params.value);
		    }
		    else{
		  	  $("div#player-left div.volume").slider('value', 50+(ev.params.value*-1));
		  	  $("div#player-right div.volume").slider('value', 50+ev.params.value);
		    }
		
            var R = 255;
            var G = parseInt(255*((100-playerLeft.getVolume())/100));
            var B = parseInt(255*((100-playerLeft.getVolume())/100));
            var rgb = "rgb(" + R + "," + G + "," + B + ")";
            $("div#vLeft").css("background-color",rgb);
            var R = 255;
            var G = parseInt(255*((100-playerRight.getVolume())/100));
            var B = parseInt(255*((100-playerRight.getVolume())/100));
            var rgb = "rgb(" + R + "," + G + "," + B + ")";
            $("div#vRight").css("background-color",rgb);
            break;
        default:
            break;
      } 
    }
}
