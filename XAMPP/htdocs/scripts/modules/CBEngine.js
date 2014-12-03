
define( [ "require", "InputManager", "CBRenderer", "MathUtil", "MatrixStack", "Actor", "Mesh", "GameWorld", "GBuffer", "PostRenderScene", "JQuery" ], 
	function( require, CBRenderer )
{
	console.log( "CBEngine.js has finished loading" );

	InitializeEngine();
	StartGameLoop();
});


var gameWorld 			= null;
var def_GBuffer 		= null;
var postRenderScene 	= null;
var bUseGBuffer 		= false;

var diffuseQuadActor 	= null; 
var depthBufferActor 	= null;


function InitializeEngine()
{
	var bRendererInitializedAndReady = LoadRenderer();
	if ( !bRendererInitializedAndReady )
	{
		ShowWebGLNotSupportedError();
		return;
	}

	console.log( "Renderer is initialized and ready!" );

	RequestPointerLock();
	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();

	def_GBuffer = new GBuffer();
	def_GBuffer.initializeGBuffer();

	gameWorld = new GameWorld();
	postRenderScene = new PostRenderScene();

	// TEMP FOR TESTING
	// Quad Verts

	var quadWidth = 300.0;
	var quadHeight = 150.0;

	var quadVertices = 
	[
         quadWidth,  quadHeight,    0.0,
        -quadWidth,  quadHeight,    0.0,
         quadWidth, -quadHeight,  0.0,
        -quadWidth, -quadHeight,  0.0
    ];
   
    var quadTexCoords = 
    [
      1.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      0.0, 0.0,
    ];
	

    var quadFaces =
    [
    	0, 1, 2,     
    	1, 2, 3,
    ];

    var sharedRenderer = CBRenderer.getSharedRenderer();

    diffuseQuadActor = new Actor();
    diffuseQuadActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.77;
    diffuseQuadActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.84;

    depthBufferActor = new Actor();
    depthBufferActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.18;
    depthBufferActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.84;

    CreateMeshComponent2DQuad( diffuseQuadActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );
    CreateMeshComponent2DQuad( depthBufferActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );

    postRenderScene.addActor( diffuseQuadActor );
    postRenderScene.addActor( depthBufferActor );

	//var dragonAsJSON = loadDragonJson();
	//dragonActor = new Actor();
	//CreateMeshComponentWithVertDataForActor( dragonActor, dragonAsJSON.vertices, dragonAsJSON.indices, 'testVertexShader.glsl', 'testFragmentShader.glsl' );

	var dataFileName = 'Datafiles/teapot.json';
	var importTestMeshJSONData = LoadMeshDataFromJSONFile( dataFileName );
	var importTestActor = new Actor();
	CreateMeshComponentWithVertDataForActor( importTestActor, importTestMeshJSONData, 'testVertexShader.glsl', 'testFragmentShader.glsl' );

	gameWorld.addActor( importTestActor );
}


function RequestPointerLock()
{
	var sharedRenderer = CBRenderer.getSharedRenderer();
	sharedRenderer.canvasDOMElement.requestPointerLock = sharedRenderer.canvasDOMElement.requestPointerLock ||
			    sharedRenderer.canvasDOMElement.mozRequestPointerLock ||
			    sharedRenderer.canvasDOMElement.webkitRequestPointerLock;

	sharedRenderer.canvasDOMElement.requestPointerLock();

	sharedRenderer.canvasDOMElement.exitPointerLock = sharedRenderer.canvasDOMElement.exitPointerLock ||
			   sharedRenderer.canvasDOMElement.mozExitPointerLock ||
			   sharedRenderer.canvasDOMElement.webkitExitPointerLock;
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
	UpdateInput( deltaSeconds );

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

		sharedRenderer.renderScene( gameWorld, deltaSeconds );

		sharedRenderer.renderPostRenderScene( postRenderScene, def_GBuffer, deltaSeconds );
	}
	else
	{
		sharedRenderer.renderScene( gameWorld, deltaSeconds );
	}
	

	// ==== Clean up for next frame ==== //
	sharedRenderer.renderer.flush();

	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();
	MouseStopped();

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

		if ( bUseGBuffer )
		{
			console.log( "CBEngine now rendering WITH GBuffer" );
		}
		else
		{
			console.log( "CBEngine now rendering WITHOUT GBuffer" );
		}
	}

	if ( String.fromCharCode( e.keyCode ) == 'P' )
	{
		bUsePointerLock = !bUsePointerLock;
		var sharedRenderer = CBRenderer.getSharedRenderer();
		sharedRenderer.canvasDOMElement.requestPointerLock();
	}
}

window.addEventListener( "keydown", onKeyDownCB );


