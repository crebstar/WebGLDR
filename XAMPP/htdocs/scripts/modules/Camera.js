
define( [ "require", "MathUtil", "Collections" ], function( require, MathUtil, Collections )
{
	console.log( "Camera.js has finished loading" );
});


var keysDown = {};
var CAMERA_MAX_VELOCITY_PER_SECOND = 40.0;

var Camera = function()
{
	this.m_position 				= vec3.create();
	this.m_orientationDegrees 		= vec3.create();
	this.m_velocity 				= vec3.create();

	this.m_position[0] 				= 0.0;
	this.m_position[1] 				= 0.0;
	this.m_position[2] 				= -80.0;
}


Camera.prototype = 
{
	constructor : Camera,

	update : function( deltaSeconds )
	{
		this.updatePhysics( deltaSeconds );
	},


	updatePhysics : function( deltaSeconds )
	{
		if ( keysDown['W'] )
		{
			this.m_velocity[2] = CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown['S'] )
		{
			this.m_velocity[2] = -CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown['A'] )
		{
			this.m_velocity[0] = CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown['D'] )
		{
			this.m_velocity[0] = -CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown['R'] )
		{
			this.m_velocity[1] = -CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown['F'] )
		{
			this.m_velocity[1] = CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		this.m_position[0] += this.m_velocity[0];
		this.m_position[1] += this.m_velocity[1];
		this.m_position[2] += this.m_velocity[2];

		// Zero out velocity each frame
		this.m_velocity[0] = 0.0;
		this.m_velocity[1] = 0.0;
		this.m_velocity[2] = 0.0;
	},


	render : function( deltaSeconds )
	{

	},


	applyCameraSettingsForRendering : function( deltaSeconds )
	{
		var viewMatrix = this.getCameraViewMatrix();

		CBMatrixStack.applyViewMatrixAndCache( viewMatrix );
	},


	getCameraViewMatrix : function()
	{
		var viewMatrix = mat4.create();
 
		mat4.translate( viewMatrix, viewMatrix, this.m_position );

		return viewMatrix;
	},
}

// TEMP Input Hacks

var onKeyDown = function(e) 
{
	keysDown[ String.fromCharCode( e.keyCode ) ] = true;
}


var onKeyUp = function(e)
{
	keysDown[ String.fromCharCode( e.keyCode ) ] = false;
}


window.addEventListener( "keydown", onKeyDown );
window.addEventListener( "keyup", onKeyUp );


