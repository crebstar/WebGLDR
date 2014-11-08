
define( [ "MathUtil", "Collections", "ShaderManager" ], function( MathUtil, Collections, ShaderManager )
{
	console.log( "Material.js has finished loading" );
});


var Material = function()
{
	this.m_shaderProgram 		= null;

}


Material.prototype = 
{
	constructor : Material,


	OnShaderProgramLoaded : function( ShaderProgram )
	{
		console.log( "OnShaderProgramLoaded is being called!" );
		m_shaderProgram = ShaderProgram;
	},


	loadAndSetShaderProgram : function( vertexShaderName, fragmentShaderName )
	{
		LoadShaderProgramFromCacheOrCreateProgram( vertexShaderName, fragmentShaderName, this.OnShaderProgramLoaded );
	},
}