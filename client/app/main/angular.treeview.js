/*
	@license Angular Treeview version 0.1.6
	ⓒ 2013 AHN JAE-HA http://github.com/eu81273/angular.treeview
	License: MIT


	[TREE attribute]
	angular-treeview: the treeview directive
	tree-id : each tree's unique id.
	tree-model : the tree model on $scope.
	node-id : each node's id
	node-label : each node's label
	node-children: each node's children

	<div
		data-angular-treeview="true"
		data-tree-id="tree"
		data-tree-model="roleList"
		data-node-id="roleId"
		data-node-label="roleName"
		data-node-children="children" >
	</div>
*/


'use strict';

angular.module( 'angularTreeview', [] ).directive( 'treeModel', ['$compile', function( $compile ) {
	return {
		restrict: 'A',


		link: function ( scope, element, attrs ) {
			//tree id
			var treeId = attrs.treeId;

			//tree model
			var treeModel = attrs.treeModel;

			//node id
			var nodeId = attrs.nodeId || 'id';

			//node label
			var nodeLabel = attrs.nodeLabel || 'label';

			//children
			var nodeChildren = attrs.nodeChildren || 'children';

			//need to mess with z-indices
			var menuStartDiv = "<div context-menu class=\"position-fixed\" data-target=\"{{node."+nodeId+"}}-menu\" ng-class=\"{ 'highlight': highlight, 'expanded' : expanded }\">"

			//need to change this based on whether node is file or folder, top or not - probably use ng-show
			var menuEndDiv = '<div class="dropdown position-fixed" id="{{node.'+nodeId+'}}-menu" style="position:fixed">'+
			  '<ul class="dropdown-menu" role="menu">'+
			    '<li data-ng-show="!node.top || node.type===\'folder\'">'+
			    	'<a class="pointer" role="menuitem" tabindex="1"'+
			    		'ng-click="'+treeId+'.newFile(node)">'+
			    			'Add file in folder {{node.type==="folder" ? node.label : node.parentLabel}}'+
			    	'</a>'+
			    '</li>'+
			    '<li data-ng-show="!node.top || node.type===\'folder\'">'+
			    	'<a class="pointer" role="menuitem" tabindex="2"'+
			    		'ng-click="'+treeId+'.newFolder(node)">'+
			    			'Add subfolder in folder {{node.type==="folder" ? node.label : node.parentLabel}}'+
			    	'</a>'+
			    '</li>'+
			    '<li data-ng-show="node.top && node.type!==\'folder\'">'+
			    	'<a class="pointer" role="menuitem" tabindex="3" '+
			         'ng-click="'+treeId+'.newFile()">' +
			         'Add file in {{node.type==="folder" ? "folder "+node.label : "root folder"}}' +
			      '</a>' +
			    '</li>'+
			    '<li data-ng-show="node.top && node.type!==\'folder\'">'+
			      '<a class="pointer" role="menuitem" tabindex="4" '+
			         'ng-click="'+treeId+'.newFolder()">'+
			        'Add folder in {{node.type==="folder" ? "folder "+node.label : "root folder"}}'+
			      '</a>' +
			    '</li>'+
			    '<li data-ng-show="node.type!==\'folder\'">'+
			      '<a class="pointer" role="menuitem" tabindex="5" '+
			         // 'ng-click="'+treeId+'.deleteFile(node)">'+
			         'ng-click="'+treeId+'.deleteFile(node)">'+
			        'Delete {{node.'+nodeLabel+'}}'+
			      '</a>' +
			    '</li>'+
			  '</ul>'+
			'</div>'

			//should we put the right-click directive menu on the entire dom element, in case the directory is empty?
			var template =
				'<ul>' +
					'<li data-ng-repeat="node in ' + treeModel + '">' + 
						menuStartDiv + 
						'<i class="collapsed fa fa-folder" data-ng-show="node.type===\'folder\' && node.collapsed && node.' + nodeChildren + '.length>0" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="expanded fa fa-folder-open" data-ng-show="node.type===\'folder\' && !node.collapsed && node.' + nodeChildren + '.length>0" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="normal fa fa-file-o" data-ng-show="node.type!==\'folder\'"></i> ' +
						'<span data-ng-class="node.selected" data-ng-hide="node.type===\'folder\' && node.' + nodeChildren + '.length===0" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' + //changed from .selectNodeLabel(node) to .selectNodeHead(node)
						'<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
						"</div>"+
						menuEndDiv +
					'</li>' +
				'</ul>'

			//check tree id, tree model
			if( treeId && treeModel ) {

				//root node
				if( attrs.angularTreeview ) {

					//create tree object if not exists
					scope[treeId] = scope[treeId] || {};

					//if node head clicks,
					scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode ){

						//Collapse or Expand
						selectedNode.collapsed = !selectedNode.collapsed;
					};

				    scope[treeId].findParent = scope[treeId].findParent || function findParent(path,searchNode,origFullPath) {
							var searchArr = searchNode ? searchNode.children : scope.tree
							if(path.indexOf('/') > -1) {
								var divider = path.indexOf('/')
								var newDirectory = path.slice(0,divider)
								var newPath = path.slice(divider+1)

								for (var i = 0; i < searchArr.length; i++) {
									if(searchArr[i].label === newDirectory && searchArr[i].type === 'folder') {
										return scope[treeId].findParent(newPath,searchArr[i],path)
									}
								}
							} else {
								return searchNode
								//should be able to return searchNode out here, though the for loop might be a good final confirmation
								// for (var i = 0; i < searchArr.length; i++) {
								// 	if(searchArr[i].fullPath === origFullPath && searchArr[i].type !== 'folder') {
								// 		return searchNode
								// 	}
								// }
							}
						};

					//if node label clicks,
					scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode ){

						//remove highlight from previous node
						if( scope[treeId].currentNode && scope[treeId].currentNode.selected ) {
							scope[treeId].currentNode.selected = undefined;
						}

						//set highlight to selected node
						selectedNode.selected = 'selected';

						//set currentNode
						scope[treeId].currentNode = selectedNode;
						
						if (scope[treeId].currentNode.type !== 'folder') {
							scope.loadFile(scope[treeId].currentNode)
						} else {
							selectedNode.collapsed = !selectedNode.collapsed;
						}
					};

					scope[treeId].deleteFile = scope[treeId].deleteFile || function deleteNode(node) {
						//add confirmation popup - Are you sure you want to delete {{node.label}}?

						// console.log('selected node: ',node)
						
						//basically run this function on each of this node's children - might finish this some other time
						// if(node.type==='folder') {
						// 	//need to work backwards since items are constantly removed from the array
						// 	for (var i = node.children.length-1; i >= 0; i--) {
						// 		deleteNode(node.children[i])
						// 	}
						// }

						if (node.top) {
							scope.tree.splice(scope.tree.indexOf(node),1)
							console.log('after root - index: ',scope.tree)
							// console.log('root parent: ',node.parent)
						} else {
							var parentNode = scope[treeId].findParent(node.fullPath)
							parentNode.children.splice(parentNode.children.indexOf(node),1)
							// console.log('after remove - index: ',scope.tree)
						}

						scope.deleteFile(node)
					}

					//need to set the treeId
					//newFile function
					scope[treeId].newFile = scope[treeId].newFile || function(node) {
						var fileName = prompt('Enter the name of your new file (including the file extension, such as .js or .html).')
						
						//if the field is empty or if they hit cancel, just don't run any more of the function
						if(!fileName) return;

						// console.log('node: ',node)
						if(node) {
							//basic error handling - if clicked-on element is a file, instead of a folder
							var fullPath = node.type==='folder' ? node.fullPath : node.fullPath.slice(0,node.fullPath.lastIndexOf('/'))

							var newFile = {
								children: [],
								fullPath: fullPath+'/'+fileName,
								label:fileName,
								//probably need to update url, sha, and id after GitHub API call
								url:'',
								id:'',
								parentLabel: node.label
							}
							var parentNode = node.type === 'folder' ? node : scope[treeId].findParent(node.fullPath)
							// console.log('parent node: ',parentNode)
							scope.addFile(newFile,parentNode.children)

						} else {
							var newFile = {
								children: [],
								fullPath: fileName,
								label:fileName,
								//need to update url, sha, and id after GitHub API call
								url:'',
								id:'',
								top:true,
								type:'file'
							}
							// console.log('added to root scope')
							scope.addFile(newFile,scope.tree)

						}

						// the update of other users' tree is triggered in the controller
					}

					//newFolder function - still needs a lot of work
					scope[treeId].newFolder = scope[treeId].newFolder || function(node) {
						var folderName = prompt('Enter the name of your new folder.')

						//if the field is empty or if they hit cancel, just don't run any more of the function
						if(!folderName) return;

						if(node) {
							//basic error handling - if clicked-on element is a file, instead of a folder
							var fullPath = node.type==='folder' ? node.fullPath : node.fullPath.slice(0,node.fullPath.lastIndexOf('/'))

							var placeholderFile = {
								children: [],
								fullPath: fullPath+'/'+folderName + '/placeholder.txt',
								label:'placeholder.txt',
								//probably need to update url, sha, and id after GitHub API call
								url:'',
								id:''
							}

							var newFolder = {
								children:[placeholderFile],
								fullPath: fullPath+'/'+folderName,
								label:folderName,
								url:'',
								id:'',
								type:'folder'
							}
							// node.children.push(newFolder)
							var parentNode = node.type === 'folder' ? node : scope[treeId].findParent(node.fullPath)
							// console.log('parent node: ',parentNode)

							//need to adjust this to account for child file in passed folder
							// scope.addFile(newFile,parentNode.children)




						} else {
							var placeholderFile = {
								children: [],
								fullPath: folderName + '/placeholder.txt',
								label:'placeholder.txt',
								//probably need to update url and id after GitHub API call
								url:'',
								id:''
							}

							var newFolder = {
								children:[placeholderFile],
								fullPath: folderName,
								label:folderName,
								url:'',
								id:'',
								top:true,
								type:'folder'
							}

							scope.tree.push(newFolder)

						}
					}


				}

				//Rendering template.
				element.html('').append( $compile( template )( scope ) );
			}
		}
	};
}]);


