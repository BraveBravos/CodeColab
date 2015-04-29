document.addEventListener('DOMContentLoaded',function() {
	console.log('js')
	var edits = CodeMirror(document.getElementById('area'), {
		mode: {'name': 'javascript'},
		value: 'console.log("Type your code here.")',
		keyMap: 'sublime',
		theme: 'monokai',
		autoCloseBrackets: true,
		matchBrackets: true,
		lineNumbers: true,
		showCursorWhenSelecting: true,
		autofocus: true
	})
	// var changes = CodeMirror(document.getElementById('changes'), {
	// 	mode: {'name': 'javascript'},
	// 	value: 'console.log("This is where the changes will be shown.")',
	// 	keyMap: 'sublime',
	// 	theme: 'monokai',
	// 	lineNumbers: true,
	// 	readOnly: true
	// })
	
	CodeMirror.MergeView(document.getElementById('changes'), {
		'origLeft':'testing', //this will be a hidden pane, containing the original code
		'value':'other', 			//this will be the updated value with the users' changes
		'theme':'monokai',
		lineNumbers: true,
		readOnly: 'nocursor',
		// showCursorWhenSelecting: false
	})


	// var value, orig1, orig2, dv, panes = 2, highlight = true, connect = null, collapse = false;
	// orig2='console.log("testing")';
	// function initUI() {
	//   if (value == null) return;
	//   var target = document.getElementById("area");
	//   // target.innerHTML = "";
	//   dv = CodeMirror.MergeView(target, {
	//     value: 'console.log("This is where you put your code.")',
	//     origLeft: panes == 3 ? orig1 : null,
	//     orig: orig2,
	//     lineNumbers: true,
	//     mode: {'name': 'javascript'},
	//     theme: 'monokai',
	//     autofocus: true,
	//     showCursorWhenSelecting: true,
	//     keyMap: 'sublime',
	//     highlightDifferences: highlight,
	//     connect: connect,
	//     collapseIdentical: collapse
	//   });
	// }

	// initUI();

	// function toggleDifferences() {
	//   dv.setShowDifferences(highlight = !highlight);
	// }





	//need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons
})