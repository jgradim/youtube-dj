/*play, volume, next controls*/
var playlist1 = new Array();
var playlist2 = new Array();

function addToPlaylist1(videoID){
	playlist1.push(videoID);
}

function addToPlaylist2(videoID){
	playlist2.push(videoID);
}

function nextVideo1(){
	var newSong = playlist1.shift();

	if(newSong === undefined){
		alert("No more songs in the playlist1!");
	}else{
		loadVideo(newSong);
	}
}

function nextVideo2(){
	var newSong = playlist1.shift();

	if(newSong === undefined){
		alert("No more songs in the playlist2!");
	}else{
		loadVideo(newSong);
	}
}

//Player1 controlers 
function playVideo1(){
	if (ytplayer1){
		ytplayer1.playVideo();
	}
}
function pauseVideo1(){
	if (ytplayer1){
		ytplayer1.pauseVideo();
	}
}
function muteVideo1(){
	if(ytplayer1){
		ytplayer1.mute();
	}
}
function unMuteVideo1(){
	if(ytplayer1){
		ytplayer1.unMute();
	}
}
function setVideoVolume1(volume){
	if(ytplayer1){
		ytplayer1.setVolume(volume);
	}
}

//Player2 controlers 
function playVideo2(){
	if (ytplayer2){
		ytplayer2.playVideo();
	}
}
function pauseVideo2(){
	if (ytplayer2){
		ytplayer2.pauseVideo();
	}
}
function muteVideo2(){
	if(ytplayer2){
		ytplayer2.mute();
	}
}
function unMuteVideo2(){
	if(ytplayer2){
		ytplayer2.unMute();
	}
}
function setVideoVolume2(volume){
	if(ytplayer2){
		ytplayer2.setVolume(volume);
	}
}

// Loads the selected video into the player.
function loadVideo1(videoID) {
	if(ytplayer1) {
		ytplayer1.loadVideoById(videoID);
	}
}

function loadVideo2(videoID) {
	if(ytplayer2) {
		ytplayer2.loadVideoById(videoID);
	}
}
/*
* Polling the player for information
*/
// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
	document.getElementById(elmId).innerHTML = value;
}

// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
	alert("An error occured of type:" + errorCode);
}

// This function is called when the player changes state
function onPlayerStateChange(newState) {
	updateHTML("playerState", newState);
}

// This function is called when the player changes state
function onPlayerStateChange2(newState) {
	updateHTML("playerState2", newState);
}

// Display information about the current state of the player
function updatePlayerInfo() {
// Also check that at least one function exists since when IE unloads the
// page, it will destroy the SWF before clearing the interval.
	if(ytplayer1 && ytplayer1.getDuration) {
		updateHTML("videoDuration", ytplayer1.getDuration());
		updateHTML("videoCurrentTime", ytplayer1.getCurrentTime());
		updateHTML("bytesTotal", ytplayer1.getVideoBytesTotal());
		updateHTML("startBytes", ytplayer1.getVideoStartBytes());
		updateHTML("bytesLoaded", ytplayer1.getVideoBytesLoaded());
	}
}

// Display information about the current state of the player
function updatePlayerInfo2() {
	if(ytplayer2 && ytplayer2.getDuration) {
		updateHTML("videoDuration2", ytplayer2.getDuration());
		updateHTML("videoCurrentTime2", ytplayer2.getCurrentTime());
		updateHTML("bytesTotal2", ytplayer2.getVideoBytesTotal());
		updateHTML("startBytes2", ytplayer2.getVideoStartBytes());
		updateHTML("bytesLoaded2", ytplayer2.getVideoBytesLoaded());
	}
}

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
	// The player ID comes from the "playerapiid" parameter that was set
	// when the embedded player was loaded
	if(playerId == "player1") {
		ytplayer1 = document.getElementById("ytPlayer1");
		// This causes the updatePlayerInfo function to be called every 250ms to
		// get fresh data from the player
		setInterval(updatePlayerInfo, 250);
		updatePlayerInfo();
		ytplayer1.addEventListener("onStateChange", "onPlayerStateChange");
		ytplayer1.addEventListener("onError", "onPlayerError");
		ytplayer1.cueVideoById("jI5_wV0Pk_k");
	}
	else if(playerId == "player2") {
		ytplayer2 = document.getElementById("ytPlayer2");
		// This causes the updatePlayerInfo function to be called every 250ms to
		// get fresh data from the player
		setInterval(updatePlayerInfo2, 250);
		updatePlayerInfo2();
		ytplayer2.addEventListener("onStateChange", "onPlayerStateChange2");
		ytplayer2.addEventListener("onError", "onPlayerError");
		ytplayer2.cueVideoById("uVefPPr69NU");
	}
}

// The "main method" of this sample. Called when someone clicks "Run".
function loadPlayer1() {
	// Lets Flash from another domain call JavaScript
	var params = { allowScriptAccess: "always" };
	// The element id of the Flash embed
	var atts = { id: "ytPlayer1" };
	// All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
	swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
	"&enablejsapi=1&playerapiid=player1", 
	"videoDiv1", "480", "295", "8", null, null, params, atts);
}

function loadPlayer2(){                         
	// Now do it all again with a different player
	var params = { allowScriptAccess: "always" };
	var atts = { id: "ytPlayer2" };
	swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
	"&enablejsapi=1&playerapiid=player2", 
	"videoDiv2", "480", "295", "8", null, null, params, atts);
}

function _run() {
	loadPlayer1();
	loadPlayer2();
}
google.setOnLoadCallback(_run);
