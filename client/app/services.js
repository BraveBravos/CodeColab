angular.module('codeColab.services', [])


.factory('Share', function ($http) {

var loadShare = function ($scope) {

    var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
      'origRight':'testing\n\nmore stuff', //this contains the original code
      'value':'other',      //this will be the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true,
      //I think we have to change the blink rate to get the getCursor stuff to work -
      //when its display is temporarily none, I think getCursor cannot find it.
      cursorBlinkRate: 200 
      // readOnly: 'nocursor',
      // showCursorWhenSelecting: false
    })

    // there might be some togetherJS event listener we can use - not sure
    // TogetherJS.on("togetherjs.form-update", function (msg) {
    //   console.log('changed')
    //   // var elementFinder = TogetherJS.require("elementFinder");
    //   // // If the element can't be found this will throw an exception:
    //   // var element = elementFinder.findElement(msg.element);
    //   // MyApp.changeVisibility(element, msg.isVisible);
    // });

    // TogetherJS.on("update", function (msg) {
    //   console.log('changed')
    // })
    // TogetherJS.on("change", function (msg) {
    //   console.log('changed')
    // })

    //used to send custom events - only works if TogetherJS is running already
    TogetherJS.on('ready', function() {    
      var session = TogetherJS.require("session");
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
    //used to list for custom events
    
    var cursorPosition={line:0,ch:0};

    //THIS ONE SUPER WORKS
    //these happen in the order listed

    //when update is received, do something
    TogetherJS.hub.on('colabUpdate',function(msg){
      console.log('received ',msg.change)
      var origLine = msg.change.from.line
      var origCh = msg.change.from.ch
      // var added = !msg.change.origin==='+delete'
      var added = (msg.change.text[0].length>0 || msg.change.text.length>1)
      var changedText = added ? msg.change.text : msg.change.removed
      if(cursorPosition.line>=origLine) {
        cursorPosition.line+=(changedText.length-1)*(added || -1)
        console.log('new line ',cursorPosition.line)
      }
      if(cursorPosition.line===msg.change.to.line){
        cursorPosition.ch+=(changedText[changedText.length-1].length)*(added || -1)
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
        // console.log('canceled')
        codeEditor.editor().replaceRange(change.text,change.from,change.to)
        // console.log('test change: ',change)
        // console.log('replaced')
        // var newLine=cursorPosition.line+(change.text.length-1)
        // var newCh=cursorPosition.ch + some other stuff, maybe
        // codeEditor.editor().setCursor()
        // update()
      }
      console.log(change)
    })
    codeEditor.editor().on('update', function(){
    // function update() {
      console.log('cursorPosition in update: ',cursorPosition)
      codeEditor.editor().setCursor({line:cursorPosition.line,ch:cursorPosition.ch})
      cursorPosition=codeEditor.editor().getCursor()
      console.log('new cursor: ',codeEditor.editor().getCursor())
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
        console.log(change)
        cursorPosition=CodeMirror.changeEnd(change)        
        console.log('on change','changed area end: ',CodeMirror.changeEnd(change))
      }
    })
    // codeEditor.editor().on('update', function(cm,change){
    //   console.log(change)
    //   // if(change.origin==='setValue'){
    //   //   codeEditor.editor().setCursor(1,1)
    //   // }
    // })
      // console.log('other msg', codeEditor.editor().getCursor())
      // console.log(change)

    // TogetherJS._onmessage({type:'form-update'}, function() {
    //   console.log('test')
    //   console.log('this window',codeEditor.editor().getCursor())
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

    // this is the syntax needed for .getValue and .setValue.  rightOriginal, leftOriginal, and editor are all
    // of the possible CodeMirror instances; we only use editor and rightOriginal in our version right now.
    // console.log('editor: ',codeEditor.editor().getValue(),"\n",'original: ',codeEditor.rightOriginal().getValue())
    // codeEditor.editor().setValue('this is a test')
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











