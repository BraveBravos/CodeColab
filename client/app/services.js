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

    //THIS ONE SUPER WORKS

    var cursorPosition={line:0,ch:0};

    //when update is received, do something
    TogetherJS.hub.on('colabUpdate',function(msg){
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
      }
      // this section changes the cursor's ch
      // right now, if two cursors overlap, one user can "drag" the other cursor with it and changes its position with adds/deletes.  need to fix that.
      if((cursorPosition.line <= origLine + Math.abs(msg.change.text.length-msg.change.removed.length)) && (origCh<=cursorPosition.ch || msg.change.to.line>cursorPosition.line)) {
        // cursorPosition.ch+=(changedText[changedText.length-1].length)*(added || -1)
        //we do (from.ch-to.ch) because for inserts/additions, the from and to coordinates are the same. In that case, we skip that check.
        cursorPosition.ch+=((origCh-msg.change.to.ch) || ((changedText[cursorPosition.line-origLine].length)*(added || -1)) || (-origCh))
      }
    })
    
    //before change is made, store cursor info
    codeEditor.editor().on('beforeChange', function(cm,change){
      if(!codeEditor.editor().getCursor().hasOwnProperty('bad')) {
        console.log('before change','pos: ',cursorPosition)
      } else {
        //might have to do some pseudo-error handling here
        console.log('bad: ',codeEditor.editor().getCursor())
      }
      if(change.origin==='setValue'){
        change.cancel()
        codeEditor.editor().replaceRange(change.text,change.from,change.to)
      }
    })
    codeEditor.editor().on('update', function(){
      codeEditor.editor().setCursor({line:cursorPosition.line,ch:cursorPosition.ch})
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
        cursorPosition=CodeMirror.changeEnd(change)        
      }
    })

    function newCursor() {
      setTimeout(function() {
        cursorPosition=codeEditor.editor().getCursor()
        console.log('newCursor: ',cursorPosition)
      },1)
    }

    codeEditor.editor().on('mousedown', function(cm,change) {
      codeEditor.editor().on('cursorActivity', newCursor())
      codeEditor.editor().off('cursorActivity')
    })

    codeEditor.editor().on('keydown', function(cm,change) {
      codeEditor.editor().on('cursorActivity', newCursor())
      codeEditor.editor().off('cursorActivity')
    })
    
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











