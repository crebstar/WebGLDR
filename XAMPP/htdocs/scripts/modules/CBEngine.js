
define( [ "require", "CBRenderer", "MathUtil", "MatrixStack", "Actor", "Mesh" ], function( require, CBRenderer )
{
	console.log( "CBEngine.js has finished loading" );

	InitializeEngine();
	InitializeGameDirector();
	StartGameLoop();
});


var testActor = null;

function InitializeEngine()
{
	var bRendererInitializedAndReady = LoadRenderer();
	if ( !bRendererInitializedAndReady )
	{
		ShowWebGLNotSupportedError();
		return;
	}

	console.log( "Renderer is initialized and ready!" );

	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();

	// ======= TEST ======= //
	var triangle_vertex =
    [
        -1,-1,0,
        0,0,1,
        1,-1,0,
        1,1,0,
        1,1,0,
        1,0,0
    ];

    var triangle_faces = [0,1,2];

	testActor = new Actor();
	CreateMeshComponentWithVertDataForActor( testActor, triangle_vertex, triangle_faces, 'testVertexShader.glsl', 'testFragmentShader.glsl' );
}


function InitializeGameDirector()
{

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


function StartGameLoop()
{
	RunFrame( 0.0 );
}


var previousTimeSeconds = 0.0;
var millisToSecondsRatio = 1.0 / 1000.0;

function RunFrame( timeSeconds )
{
	var deltaSeconds = millisToSecondsRatio * ( timeSeconds - previousTimeSeconds );
	previousTimeSeconds = timeSeconds;
	
	// ==== INPUT ==== //


	// ==== Update ==== //
	testActor.update( deltaSeconds );
	

	// ==== Render ==== //

	// TEST
	var sharedRenderer = CBRenderer.getSharedRenderer();

	// TODO:: Move this to CBRenderer
	sharedRenderer.renderer.viewport( 0.0, 0.0, sharedRenderer.canvasDOMElement.width, sharedRenderer.canvasDOMElement.height );
    sharedRenderer.renderer.clear( sharedRenderer.renderer.COLOR_BUFFER_BIT | sharedRenderer.renderer.DEPTH_BUFFER_BIT );

	sharedRenderer.renderScene( testActor, deltaSeconds );

	// ==== Clean up for next frame ==== //
	sharedRenderer.renderer.flush();

	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();

	window.requestAnimationFrame( RunFrame );
}

