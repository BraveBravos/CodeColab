//videochat.js

//'use strict';

angular.module('codeColab.videochat',[])

.controller('videochatCtrl',function($scope){

  var CHANNEL_ID = 'chat-codecolab';
  var SESSION_ID = 'vidchat';    // room-id

  var USER_ID         = 'initiator';    // user-id
  var SESSION    = {         // media-type
      audio: true,
      video: true
  };
  var EXTRA      = {};       // empty extra-data

  var tempSession = null;
  var tempChannel = null;  

  var connection = new RTCMultiConnection();
  connection.sessionid = SESSION_ID;
  //connection.transmitRoomOnce = true;

  $scope.$watch('selectRepo', function(){
    if(typeof $scope.selectRepo.name != 'undefined'){
      connection.disconnect();
      CHANNEL_ID = $scope.selectRepo.name;
      CHANNEL_ID = CHANNEL_ID.replace("/","")
      connection.channel = CHANNEL_ID;
      tempChannel = connection.channel;
      ctrlJoin.className = 'shown';
      ctrlLeave.className = 'hidden';
    }
  });

  connection.extra = EXTRA;

  var firebaseURL = 'https://glaring-fire-1858.firebaseio.com/',
      remoteMediaStreams = document.getElementById('remote-media-streams'),
      localMediaStream = document.getElementById('local-media-stream'),
      ctrlJoin = document.getElementById('setup-new-meeting'),
      ctrlLeave = document.getElementById('leave-current-meeting'),
      locMedStream = null;

  var remMedStreams = [];    

  connection.session = {
      audio: true,
      video: true
  };

  connection.onstream = function(e) {
    console.log('connection.onstream e = ',e);
    if(e.type === 'local'){
      localMediaStream.insertBefore(e.mediaElement, localMediaStream.firstChild);
      locMedStream = e.stream;
      e.mediaElement.className = 'my-video';
    }else if(e.type === 'remote'){
      remoteMediaStreams.insertBefore(e.mediaElement, remoteMediaStreams.firstChild);
      //remMedStreams.push(e.stream);
      e.mediaElement.className = 'their-video';
    } 
  };

  connection.onstreamended = function(e) {
    e.mediaElement.parentNode.removeChild(e.mediaElement);
  }

  connection.openSignalingChannel = function (config) {
    config.channel = config.channel || this.channel;  
    //console.log('connection.openSignalingChannel config.channel',config.channel)
    var socket = new Firebase(firebaseURL + config.channel);
    socket.channel = config.channel;
    socket.on('child_added', function (data) {
      config.onmessage(data.val());
    });
    socket.send = function(data) {
      this.push(data);
    };
    config.onopen && setTimeout(config.onopen, 1);
    socket.onDisconnect().remove();
    return socket;
  };

  function afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes) {
    startedTimes = (startedTimes || 0) + 1;
    if (startedTimes >= numberOfTimes) return;
    setTimeout(function() {
      callback();
      afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes);
    }, setTimeoutInteval);
  }

  connection.onspeaking = function(e){
    e.mediaElement.volume = 0.7;
  }

  connection.onsilence = function(e){
    e.mediaElement.volume = 0.01;
  }

  connection.onunmute = function(event) {
      // event.isAudio == audio-only-stream
      // event.audio == has audio tracks

      if (event.isAudio || event.session.audio) {
          // set volume=0
          event.mediaElement.volume = 0;

          // steadily increase volume
          afterEach(200, 5, function() {
              event.mediaElement.volume += .20;
          });
      }
  };

  $scope.joinChat = function(){  
    // setup signaling channel
    //console.log('$scope.joinChat connection.channel',connection.channel);
    var roomFirebase = new Firebase(firebaseURL + connection.channel + '-session');
    tempChannel = connection.channel;
    roomFirebase.once('value', function (data) {
      var sessionDescription = data.val();

      // checking for room; if not available "open" otherwise "join"
      if (sessionDescription === null) {
        connection.open({
          sessionid: connection.sessionid,
          captureUserMediaOnDemand: false,
          dontTransmit: true,
          onMediaCaptured: function() {
              // storing room on server
              tempSession = connection.sessionid;
              roomFirebase.set(connection.sessionDescription);
              //console.log('$scope.joinChat connection.open onMediaCaptured');
              // if room owner leaves; remove room from the server
              roomFirebase.onDisconnect().remove();
          }
        });
      } else { // you can join with only audio or audio+video
        var joinWith = {
          audio: true,
          video: true
        };
        
        // pure "sessionDescription" object is passed over "join" method
        // 2nd parameter is optional which allows you customize how to join the session
        connection.join(sessionDescription, joinWith);
        //console.log('$scope.joinChat connection.join');
      }
    });
    ctrlJoin.className = 'hidden';
    ctrlLeave.className = 'shown';
  }

  $scope.leaveChat = function(){
    connection.leave();
    connection.streams.stop();
    //connection.refresh();
    connection.sessionid = tempSession;
    connection.channel = tempChannel;
    ctrlJoin.className = 'shown';
    ctrlLeave.className = 'hidden';
  }

});
