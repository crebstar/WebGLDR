define( [ "CBRenderer", "MathUtil", "GBuffer", "LBuffer", "Material", "Mesh", "Collections", "ShaderManager" ], function()
{
	console.log( "PostRenderScene.js has finished loading" );
});


var FINAL_PASS_VERTEX_SHADER 		= "FinalPassVertexShader.glsl";
var FINAL_PASS_FRAGMENT_SHADER 		= "FinalPassFragmentShader.glsl";


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


var FinalPostRenderScene = function()
{
	this.m_position 				= vec3.create();
	//this.m_position[0] 				= 1000.0;

	// Shader Related Variables
	this.m_shaderProgram 			= null;
	this.m_positionAttribute 		= new ShaderAttribute( POSITION_ATTRIBUTE_NAME );
	//this.m_texCoordAttribute 		= new ShaderAttribute( TEXTURE_COORDS_ATTRIBUTE_NAME );

	this.m_vertexBuffer 			= null;
	this.m_faceBuffer 				= null;

	this.m_NPoints 				 	= 0;

	this.m_shaderUniformParams 		= new FastMap();
}


FinalPostRenderScene.prototype = 
{
	constructor : FinalPostRenderScene,


	update : function( deltaSeconds )
	{

	},


	render : function( GBufferTarget, LBufferTarget, deltaSeconds )
	{
		if ( this.m_shaderProgram !== null )
		{
			this.applyMatrixTransformsAndPushToStack();

			var sharedRenderer = CBRenderer.getSharedRenderer();

			sharedRenderer.renderer.useProgram( this.m_shaderProgram );

			this.enableAttributes();
			this.setAttributePointers();
			this.bindTextures( GBufferTarget, LBufferTarget );
			this.updateUniforms();

			sharedRenderer.renderer.drawElements( sharedRenderer.renderer.TRIANGLES, this.m_NPoints, sharedRenderer.renderer.UNSIGNED_INT, 0 );

			this.unbindTextures();
			this.disableAttribues();
		}
	},


	updateUniforms : function()
	{
		this.updateGBufferTargetAndLBufferTargetUniforms();
		this.updateMVPAndScreenUniforms();
	},
	

	updateGBufferTargetAndLBufferTargetUniforms : function()
	{
		var rtOneUniform 				= this.m_shaderUniformParams.get( RENDER_TARGET_ONE_UNIFORM_NAME, null );
		var rtTwoUniform 				= this.m_shaderUniformParams.get( RENDER_TARGET_TWO_UNIFORM_NAME, null );
		var rtFourUniform 			  	= this.m_shaderUniformParams.get( RENDER_TARGET_FOUR_UNIFORM_NAME, null );
		var rtFiveUniform 				= this.m_shaderUniformParams.get( RENDER_TARGET_FIVE_UNIFORM_NAME, null );

		var sharedRenderer = CBRenderer.getSharedRenderer();

		if ( rtOneUniform !== null )
		{
			sharedRenderer.renderer.uniform1i( rtOneUniform.m_uniformLocation, 0 );
		}

		if ( rtTwoUniform !== null )
		{	
			sharedRenderer.renderer.uniform1i( rtTwoUniform.m_uniformLocation, 1 );
		}

		if ( rtFourUniform !== null )
		{
			sharedRenderer.renderer.uniform1i( rtFourUniform.m_uniformLocation, 2 );
		}
		
		if ( rtFiveUniform !== null )
		{
			sharedRenderer.renderer.uniform1i( rtFiveUniform.m_uniformLocation, 3 );
		}
	},


	bindTextures : function( GBufferTarget, LBufferTarget )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE0 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, GBufferTarget.m_diffuseComponentTexture );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE1 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, GBufferTarget.m_renderTargetTwoTexture );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE2 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, LBufferTarget.m_diffuseAccumulationTarget );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE3 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, LBufferTarget.m_specularAccumulationTarget );
	},


	unbindTextures : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE0 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE1 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE2 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE3 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );
	},


	updateMVPAndScreenUniforms : function()
	{
		var modelUniform 		= this.m_shaderUniformParams.get( MODEL_MATRIX_UNIFORM_NAME, null );
		var viewUniform 		= this.m_shaderUniformParams.get( VIEW_MATRIX_UNIFORM_NAME, null );
		var projectionUniform 	= this.m_shaderUniformParams.get( PROJECTION_MATRIX_UNIFORM_NAME, null );

		var sharedRenderer = CBRenderer.getSharedRenderer();

		if ( modelUniform !== null )
		{
			sharedRenderer.renderer.uniformMatrix4fv( modelUniform.m_uniformLocation, false, CBMatrixStack.m_currentModelMatrix );
		}

		if ( viewUniform !== null )
		{
			sharedRenderer.renderer.uniformMatrix4fv( viewUniform.m_uniformLocation, false, CBMatrixStack.m_currentViewMatrix );
		}

		if ( projectionUniform !== null )
		{
			sharedRenderer.renderer.uniformMatrix4fv( projectionUniform.m_uniformLocation, false, CBMatrixStack.m_currentProjectionMatrix );
		}

		var inverseScreenWidthUniform = this.m_shaderUniformParams.get( INVERSE_SCREEN_WIDTH_UNIFORM_NAME, null );
		var inverseScreenHeightUniform = this.m_shaderUniformParams.get( INVERSE_SCREEN_HEIGHT_UNIFORM_NAME, null );

		if ( inverseScreenWidthUniform !== null )
		{
			sharedRenderer.renderer.uniform1f( inverseScreenWidthUniform.m_uniformLocation, ( 1.0 / sharedRenderer.canvasDOMElement.width ) );
		}

		if ( inverseScreenHeightUniform !== null )
		{
			sharedRenderer.renderer.uniform1f( inverseScreenHeightUniform.m_uniformLocation, ( 1.0 / sharedRenderer.canvasDOMElement.height ) );
		}
	},


	initializeFinalPostRenderScene : function()
	{
		this.initializeFullScreenQuad();
		LoadShaderProgramFromCacheOrCreateProgram( FINAL_PASS_VERTEX_SHADER, FINAL_PASS_FRAGMENT_SHADER, this );
	},


	initializeFullScreenQuad : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		var quadWidth = sharedRenderer.canvasDOMElement.width;
		var quadHeight = sharedRenderer.canvasDOMElement.height;

		var quadVertices = 
		[
	         quadWidth,  quadHeight,  0.0,
	        -quadWidth,  quadHeight,  0.0,
	         quadWidth, -quadHeight,  0.0,
	        -quadWidth, -quadHeight,  0.0
	    ];
	   
	    var quadFaces =
	    [
	    	0, 1, 2,     
	    	1, 2, 3,
	    ];

		this.createIBOFor2DMesh( quadVertices, quadFaces );
	},


	createIBOFor2DMesh : function( vertData, faceData )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		this.m_vertexBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_vertexBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ARRAY_BUFFER, 
			new Float32Array( vertData ),
			sharedRenderer.renderer.STATIC_DRAW );

		this.m_faceBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, this.m_faceBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, 
			new Uint32Array( faceData ),
			sharedRenderer.renderer.STATIC_DRAW );

		this.m_NPoints = faceData.length;
	},


	createCoreShaderUniformParams : function()
	{
		// ===== Model | View | Projection ===== //
		var identityMatrix 	  			= mat4.create(); 
		var modelUniformParam 			= new ShaderUniform( this );
		var viewUniformParam 			= new ShaderUniform( this );
		var projectionUniformParam 		= new ShaderUniform( this );
		var inverseScreenWidthParam 	= new ShaderUniform( this );
		var inverseScreenHeightParam 	= new ShaderUniform( this );

		var sharedRenderer = CBRenderer.getSharedRenderer();

		modelUniformParam.setUniformParameter( MODEL_MATRIX_UNIFORM_NAME, identityMatrix );
		viewUniformParam.setUniformParameter( VIEW_MATRIX_UNIFORM_NAME, identityMatrix );
		projectionUniformParam.setUniformParameter( PROJECTION_MATRIX_UNIFORM_NAME, identityMatrix );
		inverseScreenWidthParam.setUniformParameter( INVERSE_SCREEN_WIDTH_UNIFORM_NAME, ( 1.0 / sharedRenderer.canvasDOMElement.width ) );
		inverseScreenHeightParam.setUniformParameter( INVERSE_SCREEN_HEIGHT_UNIFORM_NAME, ( 1.0 / sharedRenderer.canvasDOMElement.height ) );
		
		this.m_shaderUniformParams.set( modelUniformParam.m_uniformName, modelUniformParam );
		this.m_shaderUniformParams.set( viewUniformParam.m_uniformName, viewUniformParam );
		this.m_shaderUniformParams.set( projectionUniformParam.m_uniformName, projectionUniformParam );
		this.m_shaderUniformParams.set( inverseScreenWidthParam.m_uniformName, inverseScreenWidthParam );
		this.m_shaderUniformParams.set( inverseScreenHeightParam.m_uniformName, inverseScreenHeightParam );

		// ====== TEXTURES ====== //
		var renderTargetOneParam 						= new ShaderUniform( this );
		var renderTargetTwoParam 						= new ShaderUniform( this );
		var diffuseAccumulationTarget 					= new ShaderUniform( this );
		var specularAccumulationTarget 					= new ShaderUniform( this );
		
		renderTargetOneParam.setUniformParameter( RENDER_TARGET_ONE_UNIFORM_NAME, UNIFORM_NOT_LOCATED );
		this.m_shaderUniformParams.set( renderTargetOneParam.m_uniformName, renderTargetOneParam );

		renderTargetTwoParam.setUniformParameter( RENDER_TARGET_TWO_UNIFORM_NAME, UNIFORM_NOT_LOCATED );
		this.m_shaderUniformParams.set( renderTargetTwoParam.m_uniformName, renderTargetTwoParam );

		diffuseAccumulationTarget.setUniformParameter( RENDER_TARGET_FOUR_UNIFORM_NAME, UNIFORM_NOT_LOCATED );
		this.m_shaderUniformParams.set( diffuseAccumulationTarget.m_uniformName, diffuseAccumulationTarget );

		specularAccumulationTarget.setUniformParameter( RENDER_TARGET_FIVE_UNIFORM_NAME, UNIFORM_NOT_LOCATED );
		this.m_shaderUniformParams.set( specularAccumulationTarget.m_uniformName, specularAccumulationTarget );
	},


	findAttributeLocations : function()
	{
		if ( this.m_shaderProgram == null )
		{
			console.log( "Warning: Cannot find locations of material attributes if shader program is null" );
			return;
		}

		var sharedRenderer = CBRenderer.getSharedRenderer();
		this.m_positionAttribute.m_attributeLocation 		= sharedRenderer.renderer.getAttribLocation( this.m_shaderProgram, this.m_positionAttribute.m_attributeName );
	},


	enableAttributes : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.enableVertexAttribArray( this.m_positionAttribute.m_attributeLocation );
	},


	setAttributePointers : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_vertexBuffer );
		sharedRenderer.renderer.vertexAttribPointer( this.m_positionAttribute.m_attributeLocation, 3, sharedRenderer.renderer.FLOAT, false, 0, 0  );

		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, this.m_faceBuffer );
	},


	disableAttribues : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.disableVertexAttribArray( this.m_positionAttribute.m_attributeLocation );
	},


	applyMatrixTransformsAndPushToStack : function( deltaSeconds )
	{
		var translationMatrix 	= mat4.create();

		mat4.translate( translationMatrix, translationMatrix, this.m_position );
		CBMatrixStack.applyModelMatrixAndCache( translationMatrix );
	},


	// ===== Event and Lifecycle Functions ===== //
	OnShaderProgramLoaded : function( ShaderProgram )
	{
		this.m_shaderProgram = ShaderProgram;
		this.createCoreShaderUniformParams();
		this.findAttributeLocations();
	},
}
