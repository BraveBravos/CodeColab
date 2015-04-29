document.addEventListener('DOMContentLoaded',function() {
	console.log('js')
	var myMirror = CodeMirror(document.getElementById('area'), {
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
})