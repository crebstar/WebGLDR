
define( [ "require", "CBRenderer", "Actor", "Mesh" ], function( require, CBRenderer )
{
	console.log( "CBEngine.js has finished loading" );

	InitializeEngine();
});


function InitializeEngine()
{
	var bRendererInitializedAndReady = LoadRenderer();
	if ( !bRendererInitializedAndReady )
	{
		ShowWebGLNotSupportedError();
		return;
	}

	console.log( "Renderer is initialized and ready!" );

	var testActor = new Actor();
	CreateMeshComponentForActor( testActor, 'testVertexShader.glsl', 'testFragmentShader.glsl' );

	var testActor2 = new Actor();
	CreateMeshComponentForActor( testActor, 'testVertexShader.glsl', 'testFragmentShader.glsl' );
}


function LoadRenderer()
{
	var sharedRenderer = CBRenderer.getSharedRenderer();

	// PR TODO:: Load from config file
	var CanvasID = "DRCanvas";
	sharedRenderer.initializeRenderer( CanvasID );

	var bRendererInitializedAndReady = sharedRenderer.isWebGLContextValid() && sharedRenderer.bRendererInitialized;

	return bRendererInitializedAndReady;
}


function ShowWebGLNotSupportedError()
{
	var statusP = document.getElementById( 'DefferedRendererStatus' );
	if ( statusP !== null )
	{
		statusP.innerHTML = 'Sorry, your browser does not support WebGL! Cannot load application';
	}
}