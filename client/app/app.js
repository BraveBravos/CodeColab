document.addEventListener('DOMContentLoaded',function() {
	
	CodeMirror.MergeView(document.getElementById('area'), {
		'origRight':'testing\n\nmore stuff', //this will be a hidden pane, containing the original code
		'value':'other', 			//this will be the updated value with the users' changes
		'theme':'erlang-dark',
		lineNumbers: true
	})

	//need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

	$('#fileTree').treetable({
		'expandable':true
	})
})