
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
var lightCounterDOMElement 			= null;

var Z_WORLD_BOUND 					= 400.0;
var Y_WORLD_BOUND 					= 110.0;
var X_WORLD_BOUND 					= 400.0;
var WORLD_MIN_BOUND 				= -10.0;

var LIGHT_MOVE_STATE 				= 0;
var NUM_STARTING_LIGHTS 			= 2;
var MAX_LIGHT_RADIUS 				= 50.0;
var MIN_LIGHT_RADIUS 				= 20.0;
var INNER_RADIUS_COEFFICIENT 		= 0.67;


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
	InitializeFPSCounterAndLightCounter();
	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();

	def_GBuffer = new GBuffer();
	def_GBuffer.initializeGBuffer();

	def_LBuffer = new LBuffer();
	def_LBuffer.initializeLBuffer();

	InitializePointLights();
	
	// Scenes
	gameWorld 						= new GameWorld();
	debugRenderTargetBuffersScene 	= new PostRenderScene();
	finalRenderScene 				= new FinalPostRenderScene();
	finalRenderScene.initializeFinalPostRenderScene();

	CreateDeferredRendereringActors();
}


function InitializePointLights()
{
	AddLightsToScene( NUM_STARTING_LIGHTS );
	UpdateLightCount( sceneLights.length );
}


function InitializeFPSCounterAndLightCounter()
{
	fpsCounterDOMElement 	= document.getElementById("fps_counter");
	lightCounterDOMElement  = document.getElementById("light_counter");
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

	var geomVertexShader = 'GeometryVertexShader.glsl';
	var geomFragShader = 'GeometryFragmentShader.glsl';
	var dataFileName = 'Datafiles/teapot.json';
	var importMeshJSONData = LoadMeshDataFromJSONFile( dataFileName );

	var numColumns 				= 8;
	var numRows 				= 8;
	var numHeightRows 			= 3;
	var rowOffsetAmount 		= 50.00;
	var columnOffsetAmount 		= 50.00;
	var heightOffsetAmount 		= 50.00;

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
	UpdateSceneLights( deltaSeconds );
	gameWorld.update( deltaSeconds );
	
	// ==== Render ==== //
	var sharedRenderer = CBRenderer.getSharedRenderer();
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
	}
	
	sharedRenderer.renderer.flush();

	// ==== Clean up for next frame ==== //
	CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();
	MouseStopped();

	window.requestAnimationFrame( RunFrame );
}


function UpdateSceneLights( deltaSeconds )
{
	for ( var i = 0; i < sceneLights.length; ++i )
	{
		light = sceneLights[i];
		light.update( deltaSeconds );
	}
}


var fpsTime 				= 0.0;
var fpsFrames 				= 0;
var frequencyOfFPSUpdate 	= 1;

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


function UpdateLightCount( numLights )
{
	lightCounterDOMElement.innerHTML = "Light Count: " + numLights;
}


function AddLightsToScene( numLightsToAdd )
{
	for ( var i = 0; i < numLightsToAdd; ++i )
	{
		var lightOuterRadius = MAX_LIGHT_RADIUS * Math.random();
		if ( lightOuterRadius < MIN_LIGHT_RADIUS )
		{
			lightOuterRadius = MIN_LIGHT_RADIUS;
		}
		var lightInnerRadius = lightOuterRadius * INNER_RADIUS_COEFFICIENT;

		var pl = new PointLight( lightOuterRadius, lightInnerRadius );
		pl.initializePointLight();
		pl.m_position[0] = Math.random() * X_WORLD_BOUND;
		pl.m_position[1] = Math.random() * Y_WORLD_BOUND;
		pl.m_position[2] = Math.random() * Z_WORLD_BOUND;
		pl.m_colorAndBrightness[0] = Math.random() * 1.0;
		pl.m_colorAndBrightness[1] = Math.random() * 1.0;
		pl.m_colorAndBrightness[2] = Math.random() * 1.0;
		pl.m_colorAndBrightness[3] = 1.0; 
		sceneLights.push( pl );
	}
}


var onKeyDownCB = function(e)
{
	if ( e.keyCode  == 71 ) // G
	{
		bUseGBuffer = !bUseGBuffer;
	}
	else if ( e.keyCode  == 80 ) // P
	{
		bUsePointerLock = !bUsePointerLock;
		var sharedRenderer = CBRenderer.getSharedRenderer();
		sharedRenderer.canvasDOMElement.requestPointerLock();
	}
	else if ( e.keyCode == 76 ) // L
	{
		AddLightsToScene( 1 );
		UpdateLightCount( sceneLights.length );
	}
	else if ( e.keyCode == 75 ) // K
	{
		AddLightsToScene( 5 );
		UpdateLightCount( sceneLights.length );
	}


	if ( e.keyCode == 49 )
	{
		LIGHT_MOVE_STATE = 0;
	}
	else if ( e.keyCode == 50 )
	{
		LIGHT_MOVE_STATE = 1;
	}
}

window.addEventListener( "keydown", onKeyDownCB );


