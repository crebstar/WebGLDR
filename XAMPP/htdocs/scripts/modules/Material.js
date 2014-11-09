
define( [ "MathUtil", "Collections", "ShaderManager", "CBRenderer" ], function( MathUtil, Collections, ShaderManager, CBRenderer )
{
	console.log( "Material.js has finished loading" );
});


// ===== Global Constants ===== //
var UNIFORM_NOT_LOCATED 			= -1;
var MODEL_MATRIX_UNIFORM_NAME 		= "u_modelMatrix";
var VIEW_MATRIX_UNIFORM_NAME 		= "u_viewMatrix";
var PROJECTION_MATRIX_UNIFORM_NAME 	= "u_projectionMatrix";

var Material = function()
{
	this.m_shaderProgram 		= null;
	this.m_shaderUniformParams 	= new Map();
}


Material.prototype = 
{
	constructor : Material,


	createCoreShaderUniformParams : function()
	{
		console.log( "createCoreShaderUniformParams is being called!" );

		// ===== Model | View | Projection ===== //
		var identityMatrix 	  			= mat4.create(); 
		var modelUniformParam 			= new ShaderUniform( this );
		var viewUniformParam 			= new ShaderUniform( this );
		var projectionUniformParam 		= new ShaderUniform( this );

		modelUniformParam.setUniformParameter( MODEL_MATRIX_UNIFORM_NAME, identityMatrix );
		viewUniformParam.setUniformParameter( VIEW_MATRIX_UNIFORM_NAME, identityMatrix );
		projectionUniformParam.setUniformParameter( PROJECTION_MATRIX_UNIFORM_NAME, identityMatrix );
	},


	OnShaderProgramLoaded : function( ShaderProgram )
	{
		this.m_shaderProgram = ShaderProgram;
		this.createCoreShaderUniformParams();
	},


	loadAndSetShaderProgram : function( vertexShaderName, fragmentShaderName )
	{
		LoadShaderProgramFromCacheOrCreateProgram( vertexShaderName, fragmentShaderName, this );
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

		console.log( "Uniform Location for setUniformParameter: " );
		console.log( this.m_uniformLocation );
	},
}