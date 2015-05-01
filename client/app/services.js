angular.module('codeColab.services', [])


.factory('Share', function ($http) {

var loadShare = function ($scope) {

    var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
      'origRight':'testing\n\nmore stuff', //this contains the original code
      'value':'other',      //this will be the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true,
      autofocus: true,
      //I think we have to change the blink rate to get the getCursor stuff to work -
      //when its display is temporarily none, I think getCursor cannot find it.
      cursorBlinkRate: 200
    })

    //used to send custom events - only works if TogetherJS is running already
    TogetherJS.on('ready', function() {    
      // var session = TogetherJS.require("session");
      // session.send = function (msg) {
      //   if (DEBUG && IGNORE_MESSAGES.indexOf(msg.type) == -1) {
      //     console.info("Send:", msg);
      //   }
      //   msg.clientId = session.clientId;
      //   channel.send(msg);
      //   //client id = j12mltMt9s.xMa5DPu1Uz
      // };
      // console.log(session.send)
    })

    //THIS ONE SUPER WORKS
    //these happen in the order listed

    var cursorPosition={line:0,ch:0};

    //when update is received, do something
    TogetherJS.hub.on('colabUpdate',function(msg){
      console.log('received ',msg.change)
      // codeEditor.editor().replaceRange(msg.change.text,msg.change.from,msg.change.to)
      var origLine = msg.change.from.line
      var origCh = msg.change.from.ch

      if(cursorPosition.ch===origCh && cursorPosition.line===origLine) {
        return
      }

      // if msg.change.text has length, characters must have been inserted.  if not, it is possible that multiple lines were inserted
      // and that there are characters on other lines, so we check the length of that array as well.
      var added = (msg.change.text[0].length>0 || msg.change.text.length>1)

      // if something was added, the changed text is msg.change.text.  Otherwise, it's msg.change.removed.
      var changedText = added ? msg.change.text : msg.change.removed

      // we don't care about changes occurring further down the page
      // this section changes the cursor's line
      if(cursorPosition.line >= origLine) {
        // the max covers when the cursor is in the middle of an area that gets deleted
        cursorPosition.line = Math.max(origLine,cursorPosition.line+(msg.change.text.length - msg.change.removed.length))
        console.log('new line ',cursorPosition.line)
      }
      // this section changes the cursor's ch
      // right now, if two cursors overlap, one user can "drag" the other cursor with it and changes its position with adds/deletes.  need to fix that.
      // if(cursorPosition.line===msg.change.to.line){
      if((cursorPosition.line <= origLine + Math.abs(msg.change.text.length-msg.change.removed.length)) && (origCh<=cursorPosition.ch || msg.change.to.line>cursorPosition.line)) {
        // cursorPosition.ch+=(changedText[changedText.length-1].length)*(added || -1)
        //we do (from.ch-to.ch) because for inserts/additions, the from and to coordinates are the same. In that case, we skip that check.
        cursorPosition.ch+=((origCh-msg.change.to.ch) || ((changedText[cursorPosition.line-origLine].length)*(added || -1)) || (-origCh))//+(origLine<cursorPosition)*origCh
        console.log('new ch ',cursorPosition.ch)
      }
    })
    
    //before change is made, store cursor info
    codeEditor.editor().on('beforeChange', function(cm,change){
      if(!codeEditor.editor().getCursor().hasOwnProperty('bad')) {
        // cursorPosition=codeEditor.editor().getCursor()
        console.log('before change','pos: ',cursorPosition)
      } else {
        //might have to do some pseudo-error handling here
        console.log('bad: ',codeEditor.editor().getCursor())
      }
      // cursorPosition = codeEditor.editor().getCursor()
      // console.log('before: ',cursorPosition)
      if(change.origin==='setValue'){
        change.cancel()
        console.log('canceled')
        codeEditor.editor().replaceRange(change.text,change.from,change.to)
        // console.log('test change: ',change)
        console.log('replaced')
        // var newLine=cursorPosition.line+(change.text.length-1)
        // var newCh=cursorPosition.ch + some other stuff, maybe
        // codeEditor.editor().setCursor()
        // update()
      }
      console.log(change)
    })
    codeEditor.editor().on('update', function(){
    // function update() {
      // console.trace()
      console.log('cursorPosition in update: ',cursorPosition)
      codeEditor.editor().setCursor({line:cursorPosition.line,ch:cursorPosition.ch})
      console.log('cursorPosition coordinates: ',cursorPosition.line,cursorPosition.ch)
      // cursorPosition=codeEditor.editor().getCursor()
      console.log('new cursor: ',codeEditor.editor().getCursor())
      console.log('new cursorPosition: ',cursorPosition)
    })
    // codeEditor.editor().on('cursorActivity', function(cm,pos){
    //   if(!codeEditor.editor().getCursor().hasOwnProperty('bad')) {
    //     cursorPosition=codeEditor.editor().getCursor()
    //     console.log('pos: ',cursorPosition)
    //   } else {console.log('bad: ',codeEditor.editor().getCursor())}
    // })
    
    //after form is updated, set cursor in correct location
    TogetherJS.hub.on('togetherjs.form-update', function(change) {
      // codeEditor.editor().setCursor(3,3)
      // console.log('updated')
      // //need to set cursor here
      // if(cursorPosition.hasOwnProperty('xRel')) {
      //   console.log(cursorPosition.xRel+' reset ',cursorPosition.line,cursorPosition.ch)
      //   codeEditor.editor().setCursor(cursorPosition.line,cursorPosition.ch)
      // }
      // console.log('editor value: ',codeEditor.editor().getValue())
      // console.log('new cursor: ',codeEditor.editor().getCursor())
    })

    //when a user makes a change, send it (one-way) to everyone else
    codeEditor.editor().on('change', function(cm,change){

      //if the change is not due to a setValue thing, the way togetherJS does updates, we send a message containing the changes 
      //made. otherwise, there is a 'rebound' because when one person makes a change, they also receive messages when 
      //every other collaborator's editor is updated.
      if(change.origin!=='setValue' && change.origin!==undefined) {
        TogetherJS.send({
          type: 'colabUpdate',
          change: change
        })
        // console.log(change)
        // should be covered by the mousedown and keydown events, but for some reason it isn't
        cursorPosition=CodeMirror.changeEnd(change)        
        // console.log('on change','changed area end: ',CodeMirror.changeEnd(change))
      }
    })
    function newCursor() {
      setTimeout(function() {
        cursorPosition=codeEditor.editor().getCursor()
        console.log('newCursor: ',cursorPosition)
      },1)
    }

    codeEditor.editor().on('mousedown', function(cm,change) {
      console.log('mousedown',change)
      codeEditor.editor().on('cursorActivity', newCursor())
      codeEditor.editor().off('cursorActivity')
    })

    codeEditor.editor().on('keydown', function(cm,change) {
      console.log('keydown',change)
      codeEditor.editor().on('cursorActivity', newCursor())
      codeEditor.editor().off('cursorActivity')
    })
    
    // codeEditor.editor().on('cursorActivity', function(){
    //   cursorPosition=codeEditor.editor().getCursor()
    //   console.log('cursor activity: ',cursorPosition)        
    // })
    
    // might need to just track cursor position on every keyup event,
    // then use prior position and changes to determine new cursor position
    // codeEditor.editor().on('change', function(cm, change){
      // console.log(TogetherJS._knownEvents)
      // console.log('original cursor position: ',codeEditor.editor().getCursor())
      // console.log('changed area start: ',change.to.line,change.to.ch)
      // console.log('changed area end: ',CodeMirror.changeEnd(change).line,CodeMirror.changeEnd(change).ch)
      
      // var newLoc = CodeMirror.changeEnd(change)
      // codeEditor.editor().setCursor(newLoc.line,newLoc.ch)
      // console.log(change.to.line,change.to.ch)
      // codeEditor.editor().setCursor({change.to.line,change.to.ch})
    // })

    //need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

    return codeEditor
  }

  var sendFile = function ($scope, doc) {
    return $http ({
      method: 'POST',
      url: '/api/documents',
      data: {doc: doc}
    });

  }
  return {
    loadShare: loadShare,
    sendFile: sendFile
  }
})











