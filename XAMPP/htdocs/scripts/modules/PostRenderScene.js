define( [ "CBRenderer", "MathUtil", "GBuffer", "Collections" ], function()
{
	console.log( "PostRenderScene.js has finished loading" );
});


var PostRenderScene = function()
{
	this.m_gameActors 		= new Array();
}


PostRenderScene.prototype = 
{
	constructor : PostRenderScene,


	update : function( deltaSeconds )
	{
		this.m_updateActors( deltaSeconds );
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


	render : function( deltaSeconds, GBufferTarget )
	{
		this.setUpSceneForRendering( deltaSeconds );

		this.renderActors( deltaSeconds, GBufferTarget );
	},


	setUpSceneForRendering : function( deltaSeconds )
	{

	},


	renderActors : function( deltaSeconds, GBufferTarget )
	{
		var actor = null;

		for ( var i = 0; i < this.m_gameActors.length; ++i )
		{
			actor = this.m_gameActors[i];
			actor.meshComponent.material.m_diffuseTexture = GBufferTarget.m_diffuseComponentTexture;
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
			console.log( "Warning: Cannot add a null actor to PostRenderScene Actors" );
		}
	},
}
