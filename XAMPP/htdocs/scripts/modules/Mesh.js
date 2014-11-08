
define( [ "Collections", "MathUtil", "Material", "CBRenderer" ], function( Collections, MathUtil, Material, CBRenderer )
{
	console.log( "Mesh.js has finished loading" );
});


var CreateMeshComponentForActor = function( actorToCreateFor, vertexShaderName, fragmentShaderName )
{
	if ( actorToCreateFor == null )
	{
		return null;
	}

	actorToCreateFor.meshComponent = new MeshComponent();
	actorToCreateFor.meshComponent.createMaterial( vertexShaderName, fragmentShaderName );
}


var MeshComponent = function()
{
	this.material = null;
}


MeshComponent.prototype = 
{
	constructor : MeshComponent,


	update : function( deltaSeconds )
	{

	},


	render : function( deltaSeconds )
	{
		
	},


	createMaterial : function( vertexShaderName, fragmentShaderName )
	{
		material = null;
		material = new Material();
		material.loadAndSetShaderProgram( vertexShaderName, fragmentShaderName );
	},
}