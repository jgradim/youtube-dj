String.prototype.yt_id = function() {
  return this.match(/\/videos\/(.*)$/)[1];
}
$(document).ready(function() {

  // create video players
  create_player("#player-left", 1);
  //create_player("#player-right", 2);

  // mustache templates
  var searched_video, queued_video;
  $.get('/templates/searched_video.html', function(data){
    searched_video = data;
  });
  $.get('/templates/queued_video.html', function(data){
    queued_video = data;
  });
  
  // searching
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
        "max-results": 5
      },
      cache: false,
      dataType:'jsonp',
      success: function(results) {
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
    return false;
  });
  
  // allow removal of queued videos
  $("ol.queue li a.close").live('click', function(){
    $(this).parent().remove();
    return false;
  });
  
  // record / play buttons status
  $('button#record-set').click(function() { $(this).toggleClass('recording'); return false; });
  $('button#play-set').click(function() { $(this).toggleClass('playing'); return false; });
  
  // crossfade functionality
  $("div#crossfade-control").slider({
    min: -50,
    max: 50,
    value: -50,
    slide: function(ev, ui) {
		if(ui.value == 0){
			$("div#player-left div.volume").slider('value', 50);
			$("div#player-right div.volume").slider('value', 50);
		}else if(ui.value < 0){
			$("div#player-left div.volume").slider('value', 50+(ui.value*-1));
			$("div#player-right div.volume").slider('value', 50+ui.value*-1);
		}else{
			$("div#player-left div.volume").slider('value', 50+(ui.value*-1));
			$("div#player-right div.volume").slider('value', 50+ui.value);
		}
    }
  })
  
});
