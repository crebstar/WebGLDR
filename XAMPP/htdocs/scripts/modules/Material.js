
define( [ "MathUtil", "Collections", "ShaderManager", "CBRenderer", "MatrixStack", "Texture" ], function( MathUtil, Collections, ShaderManager, CBRenderer )
{
	console.log( "Material.js has finished loading" );
});


// ===== Global Constants ===== //
var UNIFORM_NOT_LOCATED 			= -1;
var ATTRIBUTE_NOT_LOCATED 			= UNIFORM_NOT_LOCATED;

// ===== Attributes  ===== //
var POSITION_ATTRIBUTE_NAME 		= "a_position";
var COLOR_ATTRIBUTE_NAME 			= "a_color";
var TEXTURE_COORDS_ATTRIBUTE_NAME 	= "a_textureCoords";
var NORMAL_ATTRIBUTE_NAME 			= "a_normal";

// ===== Uniforms ===== //
var MODEL_MATRIX_UNIFORM_NAME 		= "u_modelMatrix";
var VIEW_MATRIX_UNIFORM_NAME 		= "u_viewMatrix";
var PROJECTION_MATRIX_UNIFORM_NAME 	= "u_projectionMatrix";
var DIFFUSE_TEXTURE_UNIFORM_NAME 	= "s_diffuseTexture";


// ===== Classes ===== //
var Material = function()
{
	this.m_shaderProgram 		= null;
	this.m_materialAttributes 	= new MaterialAttributes();
	this.m_shaderUniformParams 	= new Map();
	this.m_diffuseTexture 		= null;
}


Material.prototype = 
{
	constructor : Material,


	createCoreShaderUniformParams : function()
	{
		// ===== Model | View | Projection ===== //
		var identityMatrix 	  			= mat4.create(); 
		var modelUniformParam 			= new ShaderUniform( this );
		var viewUniformParam 			= new ShaderUniform( this );
		var projectionUniformParam 		= new ShaderUniform( this );
		
		modelUniformParam.setUniformParameter( MODEL_MATRIX_UNIFORM_NAME, identityMatrix );
		viewUniformParam.setUniformParameter( VIEW_MATRIX_UNIFORM_NAME, identityMatrix );
		projectionUniformParam.setUniformParameter( PROJECTION_MATRIX_UNIFORM_NAME, identityMatrix );
		
		this.m_shaderUniformParams.set( modelUniformParam.m_uniformName, modelUniformParam );
		this.m_shaderUniformParams.set( viewUniformParam.m_uniformName, viewUniformParam );
		this.m_shaderUniformParams.set( projectionUniformParam.m_uniformName, projectionUniformParam );
		

		// ====== TEXTURES ====== //
		var diffuseUniformParam 		= new ShaderUniform( this );

		diffuseUniformParam.setUniformParameter( DIFFUSE_TEXTURE_UNIFORM_NAME, UNIFORM_NOT_LOCATED );

		this.m_shaderUniformParams.set( diffuseUniformParam.m_uniformName, diffuseUniformParam );
	},


	findAttributeLocations : function()
	{
		this.m_materialAttributes.findAttributeLocationsForShaderProgram( this.m_shaderProgram );
	},


	loadAndSetShaderProgram : function( vertexShaderName, fragmentShaderName )
	{
		LoadShaderProgramFromCacheOrCreateProgram( vertexShaderName, fragmentShaderName, this );
	},


	setUpRenderingState : function( meshComponent, deltaSeconds )
	{
		if ( this.m_shaderProgram == null )
		{
			return;
		}

		var sharedRenderer = CBRenderer.getSharedRenderer();
		sharedRenderer.renderer.useProgram( this.m_shaderProgram );

		this.updateMVPUniforms();
		this.enableAndSetAttributes( meshComponent );
		this.bindTextures( meshComponent );
	},


	loadDiffuseTextureAndSet : function( diffuseTextureURL )
	{
		var diffuseTexture = new Texture();
		diffuseTexture.loadTextureFromURL( diffuseTextureURL, this );
	},


	setDiffuseTexture : function( diffuseTexture )
	{
		var diffuseUniform 		= this.m_shaderUniformParams.get( DIFFUSE_TEXTURE_UNIFORM_NAME, null );

		var sharedRenderer = CBRenderer.getSharedRenderer();

		if ( diffuseUniform !== null )
		{
			sharedRenderer.renderer.uniform1i( diffuseUniform.m_uniformLocation, diffuseTexture );
		}

		this.m_diffuseTexture = diffuseTexture;
	},


	updateMVPUniforms : function()
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
	},


	enableAndSetAttributes : function( meshComponent )
	{
		if ( this.m_materialAttributes !== null )
		{
			this.m_materialAttributes.enableAttributes( meshComponent );
			this.m_materialAttributes.setAttributePointers( meshComponent );
		}
	},


	disableAttribues : function( meshComponent )
	{
		// PR: May not be needed for WebGL : http://stackoverflow.com/questions/12427880/is-it-important-to-call-gldisablevertexattribarray
		if ( this.m_materialAttributes !== null )
		{
			this.m_materialAttributes.disableAttribues( meshComponent );
		}
	},


	bindTextures : function( meshComponent )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		 if ( this.m_diffuseTexture ) 
		 {
	    	sharedRenderer.renderer.activeTexture( sharedRenderer.renderer.TEXTURE0 );
	      	sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, this.m_diffuseTexture );
    	}
	},

	// ===== Event and Lifecycle Functions ===== //
	OnShaderProgramLoaded : function( ShaderProgram )
	{
		this.m_shaderProgram = ShaderProgram;
		this.createCoreShaderUniformParams();
		this.findAttributeLocations();
	},
}


var ShaderUniform = function( materialOwner )
{
	this.m_uniformName 			= '';
	this.m_uniformParameter  	= null;
	this.m_uniformLocation 		= UNIFORM_NOT_LOCATED;
	this.m_materialOwner 		= materialOwner;
}


ShaderUniform.prototype =
{
	constructor : ShaderUniform,


	updateUniformParameter : function( parameterValue )
	{
		this.m_uniformParameter = parameterValue;
	},


	setUniformParameter : function( uniformName, uniformParameter )
	{
		if ( this.m_materialOwner == null || this.m_materialOwner.m_shaderProgram == null )
		{
			console.log( this.m_materialOwner );
			console.log( this.m_materialOwner.m_shaderProgram );
			console.log( "Warning: MaterialOwner is none or ShaderProgram is none for ShaderUniform object. Cannot determine parameter location in shader!" );
			return;
		}

		this.m_uniformName 			= uniformName;
		this.m_uniformParameter 	= uniformParameter;

		var sharedRenderer = CBRenderer.getSharedRenderer();
		this.m_uniformLocation = sharedRenderer.renderer.getUniformLocation( this.m_materialOwner.m_shaderProgram, this.m_uniformName );

		//console.log( "Uniform Location for setUniformParameter: " );
		//console.log( this.m_uniformLocation );
	},
}


var ShaderAttribute = function( attributeName )
{
	this.m_attributeName 			= attributeName;
	this.m_attributeLocation 		= ATTRIBUTE_NOT_LOCATED;
}


var MaterialAttributes = function()
{
	this.m_positionAttribute 		= new ShaderAttribute( POSITION_ATTRIBUTE_NAME );
	this.m_colorAttribute 			= new ShaderAttribute( COLOR_ATTRIBUTE_NAME );
	this.m_textureCoordsAttribute 	= new ShaderAttribute( TEXTURE_COORDS_ATTRIBUTE_NAME );
	this.m_normalAttribute 			= new ShaderAttribute( NORMAL_ATTRIBUTE_NAME );
}


MaterialAttributes.prototype = 
{
	constructor : MaterialAttributes,


	findAttributeLocationsForShaderProgram : function( shaderProgram )
	{

		if ( shaderProgram == null )
		{
			console.log( "Warning: Cannot find locations of material attributes if shader program is null" );
			return;
		}

		var sharedRenderer = CBRenderer.getSharedRenderer();
		this.m_positionAttribute.m_attributeLocation 		= sharedRenderer.renderer.getAttribLocation( shaderProgram, this.m_positionAttribute.m_attributeName );
		this.m_normalAttribute.m_attributeLocation 			= sharedRenderer.renderer.getAttribLocation( shaderProgram, this.m_normalAttribute.m_attributeName );
		this.m_textureCoordsAttribute.m_attributeLocation  	= sharedRenderer.renderer.getAttribLocation( shaderProgram, this.m_textureCoordsAttribute.m_attributeName );

		//this.m_colorAttribute.m_attributeLocation 	 		= sharedRenderer.renderer.getAttribLocation( shaderProgram, this.m_colorAttribute.m_attributeName );
		

		//console.log( this.m_positionAttribute.m_attributeLocation );
		//console.log( this.m_normalAttribute.m_attributeLocation );
		//console.log( this.m_colorAttribute.m_attributeLocation );
		//console.log( this.m_textureCoordsAttribute.m_attributeLocation );
	},


	enableAttributes : function( meshComponent )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.enableVertexAttribArray( this.m_positionAttribute.m_attributeLocation );

		// Temp hack
		if ( !meshComponent.m_Is2D )
		{
			sharedRenderer.renderer.enableVertexAttribArray( this.m_normalAttribute.m_attributeLocation );
		}

		sharedRenderer.renderer.enableVertexAttribArray( this.m_textureCoordsAttribute.m_attributeLocation );
		//sharedRenderer.renderer.enableVertexAttribArray( this.m_colorAttribute.m_attributeName );
	},


	setAttributePointers : function( meshComponent )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		var stride = ( Float32Array.BYTES_PER_ELEMENT * 3 );

		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, meshComponent.m_vertexBuffer );
		sharedRenderer.renderer.vertexAttribPointer( this.m_positionAttribute.m_attributeLocation, 3, sharedRenderer.renderer.FLOAT, false, 0, 0  );

		if ( !meshComponent.m_Is2D )
		{
			sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, meshComponent.m_normalBuffer );
			sharedRenderer.renderer.vertexAttribPointer( this.m_normalAttribute.m_attributeLocation, 3, sharedRenderer.renderer.FLOAT, false, 0, 0 );
		}
		
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, meshComponent.m_texCoordBuffer );
		sharedRenderer.renderer.vertexAttribPointer( this.m_textureCoordsAttribute.m_attributeLocation, 2, sharedRenderer.renderer.FLOAT, false, 0, 0 );

		//sharedRenderer.renderer.vertexAttribPointer( this.m_colorAttribute.m_attributeName, 3, sharedRenderer.renderer.FLOAT, false, 4*(3+3), 3*4 );
		
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, meshComponent.m_faceBuffer );
	},


	disableAttribues : function( meshComponent )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.disableVertexAttribArray( this.m_positionAttribute.m_attributeLocation );

		if ( !meshComponent.m_Is2D )
		{
			sharedRenderer.renderer.disableVertexAttribArray( this.m_normalAttribute.m_attributeLocation );
		}

		sharedRenderer.renderer.disableVertexAttribArray( this.m_textureCoordsAttribute.m_attributeLocation );
	},
}