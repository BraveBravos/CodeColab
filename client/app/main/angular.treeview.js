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
			    '<li>'+
			      '<a class="pointer" role="menuitem" tabindex="5" '+
			         // 'ng-click="'+treeId+'.deleteFile(node)">'+
			         'ng-click="'+treeId+'.deleteFile(node)">'+
			        'Delete {{node.'+nodeLabel+'}}'+
			      '</a>' +
			    '</li>'+
			  '</ul>'+
			'</div>'

			//need separate templates for files and folders, I think -AG
			//tree template
			var template =
				'<ul>' +
					'<li data-ng-repeat="node in ' + treeModel + '">' + 
						menuStartDiv + 
						'<i class="collapsed fa fa-folder" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="expanded fa fa-folder-open" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
						'<i class="normal fa fa-file-o" data-ng-hide="node.' + nodeChildren + '.length"></i> ' +
						'<span data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' + //changed from .selectNodeLabel(node) to .selectNodeHead(node)
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

					function findParent(path,searchNode,origFullPath) {
						var searchArr = searchNode ? searchNode.children : scope.tree

						if(path.indexOf('/') > -1) {
							var divider = path.indexOf('/')
							var newDirectory = path.slice(0,divider)
							var newPath = path.slice(divider+1)

							for (var i = 0; i < searchArr.length; i++) {
								if(searchArr[i].label === newDirectory && searchArr[i].type === 'folder') {
									return findParent(newPath,searchArr[i],path)
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
					}

					scope[treeId].deleteFile = scope[treeId].deleteFile || function(node) {

						console.log('selected node: ',node)
						//should we put the right-click directive menu on the entire dom element, in case there are no files?
						if (node.top) {
							scope.tree.splice(scope.tree.indexOf(node),1)
							console.log('after root - index: ',scope.tree)
							// console.log('root parent: ',node.parent)
						} else {
							// node.parent.children.splice(node.parent.children.indexOf(node),1)
							var parentNode = findParent(node.fullPath)
							parentNode.children.splice(parentNode.children.indexOf(node),1)
							console.log('after remove - index: ',scope.tree)
							// console.log('elem parent: ',findParent(node.fullPath))
							// console.log('index - scope.tree: ',scope.tree.indexOf(node))
							// console.log('after index: ',node.parent.children)
							// console.log('tree after index: ',node.parent.children)
						}

						//do stuff with node path
						scope.deleteFile(node)
					}

					//need to set the treeId
					//newFile function
					scope[treeId].newFile = scope[treeId].newFile || function(node) {
						var fileName = prompt('Enter the name of your new file (including the file extension, such as .js or .html).')
						console.log('node: ',node)
						if(node) {
							//basic error handling - if clicked-on element is a file, instead of a folder
							var fullPath = node.type==='folder' ? node.fullPath : node.fullPath.slice(0,node.fullPath.lastIndexOf('/'))

							var newFile = {
								children: [],
								fullPath: fullPath+'/'+fileName,
								label:fileName,
								//probably need to update url and id after GitHub API call
								url:'',
								id:'',
								parentLabel: node.label
							}
							var parentNode = node.type === 'folder' ? node : findParent(node.fullPath)
							console.log('parent node: ',parentNode)
							scope.addFile(newFile,parentNode.children)

						} else {
							var newFile = {
								children: [],
								fullPath: fileName,
								label:fileName,
								//need to update url and id after GitHub API call
								url:'',
								id:'',
								top:true,
								type:'file'
							}
							console.log('added to root scope')
							scope.addFile(newFile,scope.tree)

						}

						// the update of other users' tree is triggered in the controller
					}

					//newFolder function - still needs a lot of work
					scope[treeId].newFolder = scope[treeId].newFolder || function(node) {
						var folderName = prompt('Enter the name of your new folder.')
						if(node) {
							var placeholderFile = {
								children: [],
								fullPath: node.fullPath+'/'+folderName + '/placeholder.txt',
								label:'placeholder.txt',
								//probably need to update url and id after GitHub API call
								url:'',
								id:''
							}

							var newFolder = {
								children:[placeholderFile],
								fullPath: node.fullPath+'/'+folderName,
								label:folderName,
								url:'',
								id:'',
								type:'folder'
							}
							node.children.push(newFolder)
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


