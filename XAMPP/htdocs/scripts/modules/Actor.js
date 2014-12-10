
define( [ "Collections", "MathUtil", "Mesh", "MatrixStack" ], function( Collections, MathUtil )
{
	console.log( "Actor.js has finished loading" );
});


var Actor = function()
{
	this.m_name 					= '';

	this.m_position 				= vec3.create();
	this.m_orientationDegrees 		= vec3.create();
	this.m_velocity 				= vec3.create();

	this.meshComponent 				= null;
}


Actor.prototype = 
{
	constructor : Actor,


	update : function( deltaSeconds )
	{
		this.updatePhysics( deltaSeconds );
	}, 


	updatePhysics : function( deltaSeconds )
	{

	},


	render : function( deltaSeconds )
	{
		this.applyMatrixTransformsAndPushToStack( deltaSeconds );
		this.renderMesh( deltaSeconds );
	},


	renderMesh : function( deltaSeconds )
	{
		if ( this.meshComponent !== null )
		{
			this.meshComponent.render( deltaSeconds );
		}
	},


	applyMatrixTransformsAndPushToStack : function( deltaSeconds )
	{
		var translationMatrix 	= mat4.create();

		mat4.translate( translationMatrix, translationMatrix, this.m_position );
		CBMatrixStack.applyModelMatrixAndCache( translationMatrix );
	},
}