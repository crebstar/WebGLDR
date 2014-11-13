
define( [ "require", "CBRenderer", "MathUtil", "MatrixStack", "Actor", "Mesh", "GameWorld", "GBuffer", "JQuery" ], function( require, CBRenderer )
{
	console.log( "CBEngine.js has finished loading" );

	//loadDragonJson();
	InitializeEngine();
	InitializeGameDirector();
	StartGameLoop();
});


var gameWorld 		= null;
var def_GBuffer 	= null;
var bUseGBuffer 	= false;

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

	def_GBuffer = new GBuffer();
	def_GBuffer.initializeGBuffer();

	gameWorld = new GameWorld();

	//testActor = new Actor();
	//CreateMeshComponentWithVertDataForActor( testActor, triangle_vertex, triangle_faces, 'testVertexShader.glsl', 'testFragmentShader.glsl' );

	//var dragonAsJSON = loadDragonJson();
	//dragonActor = new Actor();
	//CreateMeshComponentWithVertDataForActor( dragonActor, dragonAsJSON.vertices, dragonAsJSON.indices, 'testVertexShader.glsl', 'testFragmentShader.glsl' );
	var dataFileName = 'Datafiles/teapot.json';
	var importTestMeshJSONData = LoadMeshDataFromJSONFile( dataFileName );
	var importTestActor = new Actor();
	CreateMeshComponentWithVertDataForActor( importTestActor, importTestMeshJSONData, 'testVertexShader.glsl', 'testFragmentShader.glsl' );

	gameWorld.addActor( importTestActor );
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
	gameWorld.update( deltaSeconds );
	

	// ==== Render ==== //

	// TEST
	var sharedRenderer = CBRenderer.getSharedRenderer();

	// TODO:: Move this to CBRenderer
	sharedRenderer.renderer.viewport( 0.0, 0.0, sharedRenderer.canvasDOMElement.width, sharedRenderer.canvasDOMElement.height );
    sharedRenderer.renderer.clear( sharedRenderer.renderer.COLOR_BUFFER_BIT | sharedRenderer.renderer.DEPTH_BUFFER_BIT );

	if ( bUseGBuffer )
	{
		sharedRenderer.renderSceneToGBuffer( gameWorld, def_GBuffer, deltaSeconds );
	}
	else
	{
		sharedRenderer.renderScene( gameWorld, deltaSeconds );
	}
	

	// ==== Clean up for next frame ==== //
	sharedRenderer.renderer.flush();

	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();

	window.requestAnimationFrame( RunFrame );
}


// TEST
function loadDragonJson()
{
	var dragonAsJSON = null;

	$.ajax(
	{
	    async: false, 
	    dataType : "text",
	    url: "DataFiles/dragon.json",
	    success: function( result ) 
	    {
	        console.log( "--- dragon.json has been loaded! --- " );
	        dragonAsJSON = JSON.parse( result );

	    }
   	});

	console.log( dragonAsJSON );

   	return dragonAsJSON;
}


var onKeyDownCB = function(e)
{
	if ( String.fromCharCode( e.keyCode ) == 'G' )
	{
		bUseGBuffer = !bUseGBuffer;
	}
}

window.addEventListener( "keydown", onKeyDownCB );


