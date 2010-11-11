$(document).ready(function() {

  // play / pause for both players
  $("button.play").click(function() {
    var fn_play = "playVideo"+$(this).parent().data('player-id');
    var fn_pause = "pauseVideo"+$(this).parent().data('player-id');
    var playing = $(this).data('playing');
    
    if(playing) {
      window[fn_pause]();
    }
    else {
      window[fn_play]();
    }
    $(this).data('playing', !playing);
  });
  
  // mute / unmute
  $("button.mute").click(function(){
    var fn_mute = "muteVideo"+$(this).parent().data('player-id');
    var fn_unmute = "unMuteVideo"+$(this).parent().data('player-id');
    var muted = $(this).data('muted');
    
    if(muted) {
      window[fn_unmute](); 
    }
    else {
      window[fn_mute]();
    }
    $(this).data('muted', !muted);
  });
});
