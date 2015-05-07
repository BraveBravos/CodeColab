
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var isAutoAnswer = false;

  var peer = new Peer({ 
    key: 'npzhit884gupiudi', 
    //port: 9000,
    //key: 'peerjs',
    //host: 'cs-code-colab.herokuapp.com',
    //path: 'peerpath', 
    //debug: 3,
    //allow_discovery: true,
    //secure: true,
    config: { 'iceServers': [
          { 'url': 'stun:stun.l.google.com:19302' }  
    ] }
  });

  peer.on('open', function(){
    document.getElementById('my-id').innerHTML = peer.id;
    console.log('PeerJS peer.on open');
  });

  peer.on('connection',function(dataConnection){
    console.log('PeerJS peer.on connection');
    //document.getElementById('peers-list').innerHTML += peer.id;
  });

  peer.on('disconnected',function(){
    console.log('PeerJS peer.on disconnected');
    setCallStatus('DISCONNECTED');
  });

  peer.on('call', function(call){
    if(isAutoAnswer){
      call.answer(window.localStream);
      call.on('stream', function(stream){
        document.getElementById('their-video').setAttribute('src', URL.createObjectURL(stream));
      });
    }else{
      setCallStatus('INCOMING CALL');
      document.getElementById('btn-answer').onclick = function(){
        var btnStatus = this.innerHTML;
        if (btnStatus === 'Answer'){
          call.answer(window.localStream);
          call.on('stream', function(stream){
            document.getElementById('their-video').setAttribute('src', URL.createObjectURL(stream));
          });
          this.innerHTML = 'End Call';
          setCallStatus('IN CALL');
        }else if(btnStatus === 'End Call'){
          endCall();
          
        }
      }
    }
  });

  peer.on('error', function(err){
    alert(err.message);
    console.log('error : ',err.message);
  });


  function init() {
    console.log('PeerJS : init');
    //console.log(peer.listAllPeers());
    navigator.getUserMedia({audio: true, video: true}, function(stream){
      document.getElementById('my-video').setAttribute('src', URL.createObjectURL(stream));
      window.localStream = stream;
    }, function(){ console.log('PeerJS : init error') });
  };

  function callPeer(call) {
    if (window.existingCall) {
      window.existingCall.close();
    }
    var call = peer.call(document.getElementById('video-callto-id').value, window.localStream);
    window.existingCall = call;
    call.on('stream', function(stream){
      document.getElementById('their-video').setAttribute('src', URL.createObjectURL(stream));
    });      
    document.getElementById('their-id').innerHTML = call.peer;
    call.on('close', function(){
      setCallStatus('CALL ENDED');
    });
  };

  function answerCall(){
    var call = peer.call(navigator.getUserMedia.peer.id, window.localStream);
    call.answer(window.localStream);
    call.on('stream', function(stream){
      document.getElementById('their-video').setAttribute('src', URL.createObjectURL(stream));
    });
  };

  function endCall(){
    console.log('endCall')
    peer.call.close();
  };

  function setCallStatus(strStatus){
    document.getElementById('video-call-status').innerHTML = strStatus;
  };

  document.getElementById('btn-answer').onclick = function(){
    var btnStatus = this.innerHTML;
    if (btnStatus === 'Answer'){
      // TODO add answer logic here
      this.innerHTML = 'End Call';
    }else{
      endCall();
      this.innerHTML = 'Answer';
    }
  };

  document.getElementById('cbx-autoanswer').onchange = function(){
    if(this.checked){
      isAutoAnswer = true;
    }else{
      isAutoAnswer = false;
    }
  };

  document.getElementById('btn-call').onclick = function(){
    var callId = document.getElementById('video-callto-id').value;
    callPeer(window.existingCall);
  };

  init();










  
