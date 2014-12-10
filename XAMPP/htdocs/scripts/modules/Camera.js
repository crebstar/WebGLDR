
define( [ "require", "InputManager", "CBEngine", "MathUtil", "MatrixStack", "Collections" ], function( require, MathUtil, Collections )
{
	console.log( "Camera.js has finished loading" );
});


var CAMERA_MAX_VELOCITY_PER_SECOND 			= 120.0;
var CAMERA_ROTATIONAL_VELOCITY_PER_SECOND 	= 2.50;


var Camera = function()
{
	this.m_position 				= vec3.create();
	this.m_orientationDegrees 		= vec3.create();
	this.m_velocity 				= vec3.create();

	this.m_position[0] 				= 200.0;
	this.m_position[1] 				= 50.0;
	this.m_position[2] 				= 780.0;

	this.m_orientationDegrees[0] 	= 0.0; 
	this.m_orientationDegrees[1] 	= 0.0;
	this.m_orientationDegrees[2] 	= 0.0;
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
		var yawRadians = degToRad( this.m_orientationDegrees[1] );

		var cameraForwardXY = vec3.create();
		cameraForwardXY[0] = Math.sin( yawRadians );
		cameraForwardXY[1] = 0.0;
		cameraForwardXY[2] = Math.cos( yawRadians );

		var cameraLeftXY = vec3.create();
		cameraLeftXY[0] = cameraForwardXY[2];
		cameraLeftXY[1] = 0.0;
		cameraLeftXY[2] = -cameraForwardXY[0];

		var cameraMoveVector = vec3.create(); 

		//console.log( cameraForwardXY );

		if ( keysDown[ 87 ] ) // W
		{
			cameraMoveVector[0] -= cameraForwardXY[0];
			cameraMoveVector[1] -= cameraForwardXY[1];
			cameraMoveVector[2] -= cameraForwardXY[2];

			//this.m_velocity[2] = CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown[ 83 ] ) // S
		{
			cameraMoveVector[0] += cameraForwardXY[0];
			cameraMoveVector[1] += cameraForwardXY[1];
			cameraMoveVector[2] += cameraForwardXY[2];

			//this.m_velocity[2] = -CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown[ 65 ] ) // A
		{
			cameraMoveVector[0] -= cameraLeftXY[0];
			cameraMoveVector[1] -= cameraLeftXY[1];
			cameraMoveVector[2] -= cameraLeftXY[2];
			//this.m_velocity[0] = CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown[ 68 ] ) // D
		{
			cameraMoveVector[0] += cameraLeftXY[0];
			cameraMoveVector[1] += cameraLeftXY[1];
			cameraMoveVector[2] += cameraLeftXY[2];

			//this.m_velocity[0] = -CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown[ 82 ] ) // R
		{
			cameraMoveVector[1] += 1.0;
			//this.m_velocity[1] = -CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		if ( keysDown[ 70 ] ) // F
		{
			cameraMoveVector[1] -= 1.0;
			//this.m_velocity[1] = CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds;
		}

		cameraMoveVector[0] *= ( CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds );
		cameraMoveVector[1] *= ( CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds );
		cameraMoveVector[2] *= ( CAMERA_MAX_VELOCITY_PER_SECOND * deltaSeconds );

		this.m_position[0] += cameraMoveVector[0];
		this.m_position[1] += cameraMoveVector[1];
		this.m_position[2] += cameraMoveVector[2];

		this.updateRotation( deltaSeconds );
	},


	updateRotation : function( deltaSeconds )
	{
		if ( bUsePointerLock )
		{
			this.m_orientationDegrees[0] -= ( CAMERA_ROTATIONAL_VELOCITY_PER_SECOND * Input.Mouse.moveY * mouseDampenFactor ); // Pitch
			this.m_orientationDegrees[1] -= ( CAMERA_ROTATIONAL_VELOCITY_PER_SECOND * Input.Mouse.moveX * mouseDampenFactor); // Yaw

			if ( this.m_orientationDegrees[0] > 88.0 )
			{
				this.m_orientationDegrees[0] = 88.0;
			}
			else if ( this.m_orientationDegrees[0] < -88.0 )
			{
				this.m_orientationDegrees[0] = -88.0;
			}
		}
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
		var rotMultTrans = mat4.create();
		var translate = mat4.create();
		var rotateX = mat4.create();
		var rotateY = mat4.create();
		var rotMultRot = mat4.create();

		var negativePosition = vec3.create();
		negativePosition[0] = -this.m_position[0];
		negativePosition[1] = -this.m_position[1];
		negativePosition[2] = -this.m_position[2];

		var pitchRadians = degToRad( -this.m_orientationDegrees[0] );
		var yawRadians = degToRad( -this.m_orientationDegrees[1] );

		mat4.rotateX( rotateX, rotateX, pitchRadians );
		mat4.rotateY( rotateY, rotateY, yawRadians  );
		mat4.translate( translate, translate, negativePosition );
		
		mat4.multiply( rotMultRot, rotateX, rotateY );
		mat4.multiply( viewMatrix, rotMultRot, translate );

		CBMatrixStack.cacheCurrentCameraPosition( this.m_position );

		return viewMatrix;
	},
}



