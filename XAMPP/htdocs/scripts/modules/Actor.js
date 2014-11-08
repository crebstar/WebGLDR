
define( [ "Collections", "MathUtil", "Mesh" ], function( Collections, MathUtil )
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

	}, 


	render : function( deltaSeconds )
	{
		renderMesh( deltaSeconds );
	},


	renderMesh : function( deltaSeconds )
	{
		if ( meshComponent !== null )
		{
			meshComponent.render( deltaSeconds );
		}
	}
}