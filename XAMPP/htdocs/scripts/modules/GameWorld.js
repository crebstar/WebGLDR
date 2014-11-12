
define( [ "require", "MathUtil", "Collections", "Camera", "MatrixStack" ], function ( require, MathUtil, Collections, Camera, MatrixStack ) {
  
	console.log( "Define called for GameWorld" );

    return {}
});



var GameWorld = function()
{
	this.m_gameActors 		= new Array();
	this.m_camera 			= new Camera();
}


GameWorld.prototype = 
{
	constructor: GameWorld,


	update : function( deltaSeconds )
	{
		this.updateCamera( deltaSeconds );
		this.updateActors( deltaSeconds );
	},


	updateCamera : function( deltaSeconds )
	{
		if ( this.m_camera !== null )
		{
			this.m_camera.update( deltaSeconds );
		}
	},


	updateActors : function( deltaSeconds )
	{
		var actor = null;

		for ( var i = 0; i < this.m_gameActors.length; ++i )
		{
			actor = this.m_gameActors[i];

			actor.update( deltaSeconds );
		}
	},


	render : function( deltaSeconds )
	{
		this.renderCameraAndApplyCameraSettings( deltaSeconds );
		this.renderActors( deltaSeconds );
	},


	renderCameraAndApplyCameraSettings : function( deltaSeconds )
	{
		if ( this.m_camera !== null )
		{
			this.m_camera.applyCameraSettingsForRendering( deltaSeconds );
			this.m_camera.render( deltaSeconds );
		}
	},


	renderActors : function( deltaSeconds )
	{
		var actor = null;

		for ( var i = 0; i < this.m_gameActors.length; ++i )
		{
			actor = this.m_gameActors[i];
			actor.render( deltaSeconds );
		}
	},


	addActor : function( actorToAdd )
	{
		if ( actorToAdd !== null )
		{
			this.m_gameActors.push( actorToAdd );
		}
		else
		{
			console.log( "Warning: Cannot add a null actor to GameWorld Actors" );
		}
	},
}





















