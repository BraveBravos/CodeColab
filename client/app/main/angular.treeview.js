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
				var testDiv = '<div>{{node.'+nodeId+'}}</div>'
				var menuEndDiv0 = '<div class="dropdown position-fixed" id="{{node.'+nodeId+'}}-menu">'+
				  '<ul class="dropdown-menu" role="menu">'+
				    '<li>'+
				    	'test'+
				    '</li>'+
				    '<li>'+
				    	'test0'+
				    '</li>'+
				    '<li>'+
				    	'test1'+
				    '</li>'+
				    '<li>'+
				      'test2'+
				    '</li>'+
				    '<li>'+
				    	'test3'+
				    '</li>'+
				    '<li>'+
				      'test4'+
				    '</li>'+
				  '</ul>'+
				'</div>'

				var menuEndDiv = '<div class="dropdown position-fixed" id="{{node.'+nodeId+'}}-menu" style="position:fixed">'+
				  '<ul class="dropdown-menu" role="menu">'+
				    '<li>'+
				    	'<a class="pointer" role="menuitem" tabindex="1"'+
				    		'ng-click="'+treeId+'.newFile(node)">'+
				    			'Add file in this folder'+
				    	'</a>'+
				    '</li>'+
				    '<li>'+
				    	'<a class="pointer" role="menuitem" tabindex="2"'+
				    		'ng-click="panel.highlight = false">'+
				    			'Add subfolder in this folder'+
				    	'</a>'+
				    '</li>'+
				    '<li>'+
				    	'<a class="pointer" role="menuitem" tabindex="3" '+
				         'ng-click="'+treeId+'.newFile()">' +
				         'Add file in root folder' +
				      '</a>' +
				    '</li>'+
				    '<li>'+
				      '<a class="pointer" role="menuitem" tabindex="4" '+
				         'ng-click="panel.expanded = false"> '+
				        'Add folder in root folder'+
				      '</a>' +
				    '</li>'+
				    // '<li>'+
				    //   '<a class="pointer" role="menuitem" tabindex="5"'+
				    //     'ng-click="addPanel()">'+
				    //     'Add a panel'+
				    //   '</a>'+
				    // '</li>'+
				    '<li>'+
				      '<a href="https://github.com/ianwalter/ng-context-menu"'+
				        'role="menuitem"'+
				        'tabindex="-1">'+
				        'ng-context-menu on GitHub'+
				      '</a>'+
				    '</li>'+
				  '</ul>'+
				'</div>'

				//need separate templates for files and folders, I think -AG
				//tree template
				var template =
					'<ul>' +
						'<li data-ng-repeat="node in ' + treeModel + '">' + 
							menuStartDiv + 
							'<i class="collapsed" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
							'<i class="expanded" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
							'<i class="normal" data-ng-hide="node.' + nodeChildren + '.length"></i> ' +
							'<span data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
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
							console.log('selected: ',selectedNode)
							console.log('tree: ',scope[treeId], scope)
							// console.log('treeID thing: ',scope[treeId], treeId, scope)
							console.log('treeModel: ',treeModel)
							//set currentNode
							scope[treeId].currentNode = selectedNode;
							if (scope[treeId].currentNode.type !== 'folder') {
								scope.loadFile(scope[treeId].currentNode)
							}
						};
					}

					scope[treeId].newFile = scope[treeId].newFile || function(node) {
						var fileName = prompt('Enter the name of your new file (including the file extension, such as .js or .html).')
						if(node) {
							var newFile = {
								children: [],
								fullPath: node.fullPath+'/'+fileName,
								label:fileName,
								//probably need to update url and id after GitHub API call
								url:'',
								id:'',
							}

							node.children.push(newFile)
						} else {
							var newFile = {
								children: [],
								fullPath: fileName,
								label:fileName,
								//probably need to update url and id after GitHub API call
								url:'',
								id:'',
								top:true,
								type:'file'
							}

							scope.tree.push(newFile)
							// node.children.push(newFile)							
						}
						//call service to create file in GH
						scope.addFile(newFile)

					}

					scope[treeId].addFile = scope[treeId].addFile || function(selectedNode) {
						var fileName = prompt('Enter the name of your new file.')

						//if argument is passed, we use that folder (and only folder) and add to its children
						if(selectedNode) {
							var newFile = {
								children: [],
								fullPath: selectedNode.fullPath+'/'+fileName,
								label:fileName,
								//probably need to update url and id after GitHub API call
								url:'',
								id:''
							}
							selectedNode.children.push(newFile)
							//also need to call something in $scope that calls the GitHub api and adds the file to the directory.
						} else {
							//add to the root directory
						}
					}

					//Rendering template.
					element.html('').append( $compile( template )( scope ) );
				}

			// 	//Rendering template.
			// 	element.html('').append( $compile( template )( scope ) );
			// }
		}
	}
}]);



