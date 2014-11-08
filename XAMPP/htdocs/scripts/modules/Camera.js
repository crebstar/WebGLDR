
define( [ "require", "MathUtil", "Collections" ], function( require, MathUtil, Collections )
{
	console.log( "Camera.js has finished loading" );
});


var Camera = function()
{
	this.position 				= vec3.create();
	this.orientationDegrees 	= vec3.create();
	this.velocity 				= vec3.create();
}


Camera.prototype = 
{
	constructor : Camera,

	update : function( deltaSeconds )
	{

	},


	render : function( deltaSeconds )
	{

	},


	getCameraViewMatrix : function()
	{

	},
}

