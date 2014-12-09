
define( [ "require", "InputManager", "CBStorage", "CBRenderer", "MathUtil", "MatrixStack", "Actor", "Mesh", "GameWorld", "GBuffer", "LBuffer", "PointLight", "PostRenderScene", "JQuery" ], 
	function( require, CBRenderer )
{
	console.log( "CBEngine.js has finished loading" );

	InitializeEngine();
	StartGameLoop();

});


var gameWorld 						= null;
var def_GBuffer 					= null;
var def_LBuffer 					= null;
var sceneLights 					= [];
var debugRenderTargetBuffersScene 	= null;
var finalRenderScene 				= null;
var bUseGBuffer 					= false;
var fpsCounterDOMElement 			= null;


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
	InitializeFPSCounter();
	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();

	def_GBuffer = new GBuffer();
	def_GBuffer.initializeGBuffer();

	def_LBuffer = new LBuffer();
	def_LBuffer.initializeLBuffer();

	var pl = new PointLight( 30.0, 20.0 );
	pl.initializePointLight();
	pl.m_position[0] = 30.0;
	pl.m_position[1] = 10.0;
	pl.m_position[2] = 30.0;
	pl.m_colorAndBrightness[0] = 0.0;
	pl.m_colorAndBrightness[1] = 1.0;
	pl.m_colorAndBrightness[2] = 0.0;
	pl.m_colorAndBrightness[3] = 1.0; 
	sceneLights.push( pl );

	var pl1 = new PointLight( 40.0, 30.0 );
	pl1.initializePointLight();
	pl1.m_position[0] = 30.0;
	pl1.m_position[1] = 10.0;
	pl1.m_position[2] = 30.0;
	pl1.m_colorAndBrightness[0] = 1.0;
	pl1.m_colorAndBrightness[1] = 0.0;
	pl1.m_colorAndBrightness[2] = 1.0;
	pl1.m_colorAndBrightness[3] = 1.0; 
	sceneLights.push( pl1 );
	
	// Scenes
	gameWorld 						= new GameWorld();
	debugRenderTargetBuffersScene 	= new PostRenderScene();
	finalRenderScene 				= new FinalPostRenderScene();
	finalRenderScene.initializeFinalPostRenderScene();

	CreateDeferredRendereringActors();
}


function InitializeFPSCounter()
{
	fpsCounterDOMElement = document.getElementById("fps_counter");
}


function CreateDeferredRendereringActors()
{
	var quadWidth = 300.0;
	var quadHeight = 150.0;

	var quadVertices = 
	[
         quadWidth,  quadHeight,  0.0,
        -quadWidth,  quadHeight,  0.0,
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

    var renderTargetOneActor 	= null; 
    var renderTargetTwoActor 	= null;
    var renderTargetThreeActor  = null;
    var renderTargetFourActor  	= null;
    var renderTargetFiveActor 	= null;
	var depthBufferActor 		= null;

    renderTargetOneActor = new Actor();
    renderTargetOneActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.77;
    renderTargetOneActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.84;

    renderTargetTwoActor = new Actor();
    renderTargetTwoActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.77;
    renderTargetTwoActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.40;

    renderTargetThreeActor = new Actor();
    renderTargetThreeActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.155;
    renderTargetThreeActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.40;

    depthBufferActor = new Actor();
    depthBufferActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.155;
    depthBufferActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.84;

    renderTargetFourActor = new Actor();
    renderTargetFourActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.4625;
    renderTargetFourActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.84;

    renderTargetFiveActor = new Actor();
    renderTargetFiveActor.m_position[0] = sharedRenderer.canvasDOMElement.width * 0.4625;
    renderTargetFiveActor.m_position[1] = sharedRenderer.canvasDOMElement.height * 0.40;

    CreateMeshComponent2DQuad( renderTargetOneActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );
    CreateMeshComponent2DQuad( renderTargetTwoActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );
    CreateMeshComponent2DQuad( renderTargetThreeActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );
    CreateMeshComponent2DQuad( depthBufferActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );
    CreateMeshComponent2DQuad( renderTargetFourActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );
    CreateMeshComponent2DQuad( renderTargetFiveActor, quadVertices, quadTexCoords, quadFaces, 'FBOVertexShader.glsl', 'FBOFragmentShader.glsl' );

    renderTargetOneActor.meshComponent.material.m_diffuseTexture = def_GBuffer.m_diffuseComponentTexture;
    renderTargetTwoActor.meshComponent.material.m_diffuseTexture = def_GBuffer.m_renderTargetTwoTexture;
    renderTargetThreeActor.meshComponent.material.m_diffuseTexture = def_GBuffer.m_renderTargetThreeTexture;
    depthBufferActor.meshComponent.material.m_diffuseTexture = def_GBuffer.m_depthComponentTexture;
    renderTargetFourActor.meshComponent.material.m_diffuseTexture = def_LBuffer.m_diffuseAccumulationTarget;
    renderTargetFiveActor.meshComponent.material.m_diffuseTexture = def_LBuffer.m_specularAccumulationTarget;

    debugRenderTargetBuffersScene.addActor( renderTargetOneActor );
    debugRenderTargetBuffersScene.addActor( renderTargetTwoActor );
    debugRenderTargetBuffersScene.addActor( renderTargetThreeActor );
    debugRenderTargetBuffersScene.addActor( depthBufferActor );
    debugRenderTargetBuffersScene.addActor( renderTargetFourActor );
    debugRenderTargetBuffersScene.addActor( renderTargetFiveActor );

	//var dragonAsJSON = loadDragonJson();
	//dragonActor = new Actor();
	//CreateMeshComponentWithVertDataForActor( dragonActor, dragonAsJSON.vertices, dragonAsJSON.indices, 'testVertexShader.glsl', 'testFragmentShader.glsl' );

	var geomVertexShader = 'GeometryVertexShader.glsl';
	var geomFragShader = 'GeometryFragmentShader.glsl';
	var dataFileName = 'Datafiles/teapot.json';
	var importMeshJSONData = LoadMeshDataFromJSONFile( dataFileName );

	var numColumns 				= 8;
	var numRows 				= 8;
	var numHeightRows 			= 3;
	var rowOffsetAmount 		= 50.00;
	var columnOffsetAmount 		= 50.00;
	var heightOffsetAmount 		= 50.0;

	for ( var i = 0; i < numColumns; ++i )
	{
		for ( var j = 0; j < numRows; ++j )
		{
			for ( var k = 0; k < numHeightRows; ++k )
			{
				var teapotActor = new Actor();

				CreateMeshComponentWithVertDataForActor( teapotActor, importMeshJSONData, geomVertexShader, geomFragShader );
				teapotActor.m_position[0] = i * columnOffsetAmount;
				teapotActor.m_position[1] = k * heightOffsetAmount;
				teapotActor.m_position[2] = j * rowOffsetAmount;

				gameWorld.addActor( teapotActor );
			}
		}
	}
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

	UpdateFPSCounter( deltaSeconds );
	
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
		sharedRenderer.renderSceneLightsToLBuffer( sceneLights, def_GBuffer, def_LBuffer, deltaSeconds );

		sharedRenderer.renderScene( gameWorld, deltaSeconds );

		sharedRenderer.renderPostRenderScene( debugRenderTargetBuffersScene, def_GBuffer, deltaSeconds );
	}
	else
	{
		sharedRenderer.renderSceneToGBuffer( gameWorld, def_GBuffer, deltaSeconds );
		sharedRenderer.renderSceneLightsToLBuffer( sceneLights, def_GBuffer, def_LBuffer, deltaSeconds );
		sharedRenderer.renderSceneFinalPass( finalRenderScene, def_GBuffer, def_LBuffer, deltaSeconds );

		//sharedRenderer.renderScene( gameWorld, deltaSeconds );
	}
	

	// ==== Clean up for next frame ==== //
	sharedRenderer.renderer.flush();

	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();
	MouseStopped();

	window.requestAnimationFrame( RunFrame );
}

var fpsTime 				= 0.0;
var fpsFrames 				= 0;
var frequencyOfFPSUpdate 	= 2;

function UpdateFPSCounter( deltaSeconds )
{
	fpsTime += deltaSeconds;
    ++fpsFrames;

    if ( fpsTime > frequencyOfFPSUpdate ) 
    {

      var fps = fpsFrames / fpsTime;

      fpsCounterDOMElement.innerHTML = Math.round( fps ) + " FPS";

      fpsTime 		= 0.0;
      fpsFrames 	= 0;
    }
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


