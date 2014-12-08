
define( [ "JQuery", "CBRenderer" ], function( JQuery )
{
	console.log( "ShaderManager.js has finished loading" );

	InitializeShaderCache();
});

// ============== SHADER INTERFACE ================= //

// ===== Global Variables ===== //
var ShaderFilePath 				= "shaders/"
var ShaderProgramRegistry 		= null;


// ===== Global Functions  ===== //
function InitializeShaderCache()
{
	if ( ShaderProgramRegistry == null )
	{
		ShaderProgramRegistry = new FastMap();
	}
}


function GetShaderKeyFromShaderFileNames( vertexShaderName, fragmentShaderName )
{
	var shaderKey = vertexShaderName + fragmentShaderName;
	return shaderKey;
}


function AddShaderProgramToCache( shaderProgramKey, shaderProgram )
{
	if ( shaderProgram !== null )
	{
		ShaderProgramRegistry.set( shaderProgramKey, shaderProgram );
	}
}


// PR: NON ASYNC 
function LoadShaderProgramFromCacheOrCreateProgram( vertexShaderName, fragmentShaderName, requestingObject )
{
	var sharedRenderer = CBRenderer.getSharedRenderer();
	var shaderKey = GetShaderKeyFromShaderFileNames( vertexShaderName, fragmentShaderName ); // TODO:: Hash this instead
	var shaderProgram = ShaderProgramRegistry.get( shaderKey, null );

	if ( shaderProgram == null )
	{
		var vertexShaderText 	= null;
		var fragmentShaderText  = null;
		var vertexShader        = null;
		var fragmentShader      = null;
		
		$.ajax(
		{
	        async: false, 
	        dataType : "text",
	        url: ShaderFilePath + vertexShaderName,
	        success: function( result ) 
	        {
	            vertexShaderText = result;
	            console.log( "Vertex Shader: " + vertexShaderName + " has been loaded" );
	        }
   		});

	    $.ajax(
	    {
	        async: false, 
	        dataType : "text",
	        url: ShaderFilePath + fragmentShaderName,
	        success: function( result ) 
	        {
	        	fragmentShaderText = result;
	            console.log( "Fragment Shader: " + fragmentShaderName + " has been loaded" );
	        }
	    });

	    vertexShader = CompileShader( vertexShaderText, sharedRenderer.renderer.VERTEX_SHADER, "Vertex" );
	    fragmentShader = CompileShader( fragmentShaderText, sharedRenderer.renderer.FRAGMENT_SHADER, "Fragment" );

	    shaderProgram = LinkAndCreateShaderProgram( vertexShader, fragmentShader );

	    AddShaderProgramToCache( shaderKey, shaderProgram );
	}
	
    if ( requestingObject !== null && shaderProgram !== null )
    {
    	requestingObject.OnShaderProgramLoaded( shaderProgram );
    }
}


function CompileShader( sourceText, shaderType, typeString )
{
	var sharedRenderer = CBRenderer.getSharedRenderer();

	var shader = sharedRenderer.renderer.createShader( shaderType );
	sharedRenderer.renderer.shaderSource( shader, sourceText );
	sharedRenderer.renderer.compileShader( shader );

	if ( !sharedRenderer.renderer.getShaderParameter(shader, sharedRenderer.renderer.COMPILE_STATUS ) ) 
	{
      console.log( "Error in "+ typeString + " Shader : " + sharedRenderer.renderer.getShaderInfoLog( shader ) );
      return null;
    }

    return shader;
}


function LinkAndCreateShaderProgram( vertexShader, fragmentShader )
{
	var sharedRenderer = CBRenderer.getSharedRenderer();
	var shaderProgram = null;

	if ( vertexShader !== null && fragmentShader !== null )
	{
	    shaderProgram = sharedRenderer.renderer.createProgram();
  		sharedRenderer.renderer.attachShader( shaderProgram, vertexShader );
  		sharedRenderer.renderer.attachShader( shaderProgram, fragmentShader );

  		sharedRenderer.renderer.linkProgram( shaderProgram );
	}
	else
	{
		console.log( "Warning: Could not create and link shader program as vertex or fragment shader were not compiled" );
	}

	return shaderProgram;
}

// ============== END SHADER INTERFACE ================= //


