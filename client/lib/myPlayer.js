var isPlaying = false;
var sm_loaded = false;
var myPlayer;
var tmpBlobFile;

soundManager.url = '/media/';
soundManager.preferFlash = false;
soundManager.debugMode = false;
soundManager.onload = function() { sm_loaded = true; };

function startPlaying(track, pl_onload, pl_onfinish) {
    initMyPlayer(track, pl_onload, pl_onfinish);
	myPlayer.play();
}

function initMyPlayer(track, pl_onload, pl_onfinish) {
	if (isPlaying)
		stopPlaying();
    myPlayer = soundManager.createSound( {
        id: "myPlayer",
        url: track.url,
        onload: function() {
            if (pl_onload) pl_onload();
            isPlaying = true;
        },
        onfinish: function() {
            if (pl_onfinish) pl_onfinish();
            isPlaying = false;
            try { myPlayer.destruct(); }
            catch (err) {}
        }
    } );
}

function stopPlaying() {
    myPlayer.stop();
    isPlaying = false;
    try { myPlayer.destruct(); } catch(err) {}
}

function initRecorder() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;
        audio_context = new AudioContext;
    } catch (e) {
        console.log('No web audio support in this browser!');
    }
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
        console.log('No live audio input: ' + e);
    });
}

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    recorder = new Recorder(input);
}
