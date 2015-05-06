module.exports = {

	getFileStruct : function(req, res){
		//load the file struct info from GitHub
		//and convert Base64 to plain text
		//and load it all into JSON 
		console.log("getTree in fileStruct.js")	
		var tmp = 'https://api.github.com/repos/BraveBravos/CodeColab'
		console.log("req.url is ", req.url)
		req.url = tmp;
		req.accepts('json, text');
		req.protocol('https')
		// console.log("req.url is now", req.url)
		console.log("req.body is ", req.body)
		console.log("res.body is ", res.body)
		// console.log("res.bodyparser is", res.bodyparser)
		// console.log("res.data is ", res.data)
		// console.log("whole response is ", res)
		// console.log("response headers are ", res.headers)
		// console.log("request headers are ")
		// console.log("REQUEST PARAMETERS ", req.params )
		console.log("maybe json?", res.json)
		res.send(data);
	},

	drawTree : function(){
		
	}
}