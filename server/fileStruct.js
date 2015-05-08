module.exports = {

	getSHA : function (req, res, next){  //add these later? ($scope, $http)
	  console.log("req.body in server/fileStruct ", req.body)
	  // IS THE DATA OBJECT IN THERE??
	  // var repo = repoName.name.split('/');
	  // console.log("repo is", repo)    
	  // $http.get('https://api.github.com/repos/BraveBravos/CodeColab/git/refs/heads/master')
	  // $http.get('https://api.github.com/repos/SFoskitt/MKS14-n-queens/git/refs/heads/master')
	  // $http.get('https://api.github.com/repos/' + repo[0] + '/' + repo[1] + '/git/refs/heads/master')
	  .success(function(data){
	  	// console.log(" this SUCCESS should not show up")
	    console.log("data from api.github.refs in server/fileStruct.js", data)
	  })
	  .error(function(err){
	    console.log("error inside server/fileStruct.getSHA is ", err)
	  })
	},
	  // console.log("repoName in fileStruct.js/getSHA", repoName)

	getTree : function ($scope){
	  //move some functionality from below into here - 
	  //the controller below should be just the info that goes to template
	}

}