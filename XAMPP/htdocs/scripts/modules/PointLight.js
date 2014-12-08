define( [ "LBuffer", "GLMatrix", "MathUtil", "MatrixStack", "Collections", "CBRenderer", "Texture", "ShaderManager", "Material" ], function()
{
	console.log( "PointLight.js has finished loading" );
});


var POINT_LIGHT_VERTEX_SHADER_NAME 		= "PointLightVertexShader.glsl";
var POINT_LIGHT_FRAGMENT_SHADER_NAME 	= "PointLightFragmentShader.glsl";

var PointLight = function( outerRadius )
{
	this.m_position 				= vec3.create();
	this.m_innerRadius 				= outerRadius;
	this.m_outerRadius 				= outerRadius;
	this.m_colorAndBrightness 		= vec4.create();

	// Shader Related Variables
	this.m_shaderProgram 			= null;
	this.m_positionAttribute 		= new ShaderAttribute( POSITION_ATTRIBUTE_NAME );
	this.m_normalAttribute 			= new ShaderAttribute( NORMAL_ATTRIBUTE_NAME );

	this.m_vertexBuffer 			= null;
	this.m_normalBuffer 			= null;
	this.m_faceBuffer 				= null;

	this.m_NPoints 				 	= 0;

	this.m_shaderUniformParams 		= new Map();
}


PointLight.prototype = 
{
	constructor : PointLight,


	applyLightAndRenderToLBuffer : function( GBufferTarget, deltaSeconds )
	{
		this.applyMatrixTransforms();

		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.useProgram( this.m_shaderProgram );

		this.enableAttributes();
		this.setAttributePointers();
		this.bindTextures( GBufferTarget );
		this.updateUniforms( GBufferTarget );

		sharedRenderer.renderer.drawElements( sharedRenderer.renderer.TRIANGLES, this.m_NPoints, sharedRenderer.renderer.UNSIGNED_INT, 0 );

		this.unbindTextures();
		this.disableAttribues();
	},


	applyMatrixTransforms : function()
	{
		var translationMatrix 	= mat4.create();

		mat4.translate( translationMatrix, translationMatrix, this.m_position );
		CBMatrixStack.applyModelMatrixAndCache( translationMatrix );
	},


	updateUniforms : function( GBufferTarget )
	{
		this.updateGBufferTargetUniforms( GBufferTarget );
		this.updateMVPAndScreenUniforms();
	},


	updateGBufferTargetUniforms : function( GBufferTarget )
	{
		var rtTwoUniform 		= this.m_shaderUniformParams.get( RENDER_TARGET_TWO_UNIFORM_NAME, null );
		var rtThreeUniform 		= this.m_shaderUniformParams.get( RENDER_TARGET_THREE_UNIFORM_NAME, null );

		var sharedRenderer = CBRenderer.getSharedRenderer();

		if ( rtTwoUniform !== null )
		{	
			sharedRenderer.renderer.uniform1i( rtTwoUniform.m_uniformLocation, 0 );
		}

		if ( rtThreeUniform !== null )
		{
			sharedRenderer.renderer.uniform1i( rtThreeUniform.m_uniformLocation, 1 );
		}
	},


	bindTextures : function( GBufferTarget )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE0 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, GBufferTarget.m_renderTargetTwoTexture );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE1 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, GBufferTarget.m_renderTargetThreeTexture );
	},


	unbindTextures : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE0 );
	    sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );

	    sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE1 );
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


	initializePointLight : function()
	{
		this.initializePointLightSphere();
		LoadShaderProgramFromCacheOrCreateProgram( POINT_LIGHT_VERTEX_SHADER_NAME, POINT_LIGHT_FRAGMENT_SHADER_NAME, this );
	},


	initializePointLightSphere : function()
	{
		var latitudeBands = 30;
    	var longitudeBands = 30;

		// Verts and Normals
		var vertexPositionData = [];
	    var normalData = [];
	    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) 
	    {
	      var theta = latNumber * Math.PI / latitudeBands;
	      var sinTheta = Math.sin( theta );
	      var cosTheta = Math.cos( theta );

	      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) 
	      {
	        var phi = longNumber * 2 * Math.PI / longitudeBands;
	        var sinPhi = Math.sin(phi);
	        var cosPhi = Math.cos(phi);

	        var x = cosPhi * sinTheta;
	        var y = cosTheta;
	        var z = sinPhi * sinTheta;

	        normalData.push( x );
	        normalData.push( y );
	        normalData.push( z );

	        vertexPositionData.push( this.m_outerRadius * x );
	        vertexPositionData.push( this.m_outerRadius * y );
	        vertexPositionData.push( this.m_outerRadius * z );
	      }
	    }

	    // Face Data
	    var indexData = [];
	    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) 
	    {
	      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) 
	      {
	        var first = (latNumber * (longitudeBands + 1)) + longNumber;
	        var second = first + longitudeBands + 1;
	        indexData.push( first );
	        indexData.push( second );
	        indexData.push( first + 1 );

	        indexData.push( second );
	        indexData.push( second + 1 );
	        indexData.push( first + 1 );
	      }
	    }

	    this.createIBOForVertexDataAndFaceData( vertexPositionData, normalData, indexData );
	},


	createIBOForVertexDataAndFaceData : function( vertexData, normalData, faceData )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		// Vertex Buffer
		this.m_vertexBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_vertexBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ARRAY_BUFFER, 
			new Float32Array( vertexData ),
			sharedRenderer.renderer.STATIC_DRAW );

		// Normal Buffer
		this.m_normalBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_normalBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ARRAY_BUFFER, 
			new Float32Array( normalData ),
			sharedRenderer.renderer.STATIC_DRAW );

		// Face Buffer
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
		var renderTargetTwoParam 		= new ShaderUniform( this );
		var renderTargetThreeParam 		= new ShaderUniform( this );

		renderTargetTwoParam.setUniformParameter( RENDER_TARGET_TWO_UNIFORM_NAME, UNIFORM_NOT_LOCATED );
		this.m_shaderUniformParams.set( renderTargetTwoParam.m_uniformName, renderTargetTwoParam );

		renderTargetThreeParam.setUniformParameter( RENDER_TARGET_THREE_UNIFORM_NAME, UNIFORM_NOT_LOCATED );
		this.m_shaderUniformParams.set( renderTargetThreeParam.m_uniformName, renderTargetThreeParam );
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
		this.m_normalAttribute.m_attributeLocation 			= sharedRenderer.renderer.getAttribLocation( this.m_shaderProgram, this.m_normalAttribute.m_attributeName );
	},


	enableAttributes : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.enableVertexAttribArray( this.m_positionAttribute.m_attributeLocation );

		sharedRenderer.renderer.enableVertexAttribArray( this.m_normalAttribute.m_attributeLocation );
	},


	setAttributePointers : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_vertexBuffer );
		sharedRenderer.renderer.vertexAttribPointer( this.m_positionAttribute.m_attributeLocation, 3, sharedRenderer.renderer.FLOAT, false, 0, 0  );

		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_normalBuffer );
		sharedRenderer.renderer.vertexAttribPointer( this.m_normalAttribute.m_attributeLocation, 3, sharedRenderer.renderer.FLOAT, false, 0, 0 );
		
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, this.m_faceBuffer );
	},


	disableAttribues : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.disableVertexAttribArray( this.m_positionAttribute.m_attributeLocation );

		sharedRenderer.renderer.disableVertexAttribArray( this.m_normalAttribute.m_attributeLocation );
	},


	// ===== Event and Lifecycle Functions ===== //
	OnShaderProgramLoaded : function( ShaderProgram )
	{
		this.m_shaderProgram = ShaderProgram;
		this.createCoreShaderUniformParams();
		this.findAttributeLocations();
	},
}