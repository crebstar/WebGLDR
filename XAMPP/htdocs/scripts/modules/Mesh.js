
define( [ "Collections", "MathUtil", "JQuery", "Material", "CBRenderer" ], function( Collections, MathUtil, Material, CBRenderer )
{
	console.log( "Mesh.js has finished loading" );
});


var CreateMeshComponentForActor = function( actorToCreateFor, vertexShaderName, fragmentShaderName )
{
	if ( actorToCreateFor == null )
	{
		return null;
	}

	actorToCreateFor.meshComponent = new MeshComponent();
	actorToCreateFor.meshComponent.createMaterial( vertexShaderName, fragmentShaderName );
}


var CreateMeshComponentWithVertDataForActor = function( actorToCreateFor, importMeshJSONData, vertexShaderName, fragmentShaderName )
{
	if ( actorToCreateFor == null )
	{
		return null;
	}

	actorToCreateFor.meshComponent = new MeshComponent();
	actorToCreateFor.meshComponent.createMaterial( vertexShaderName, fragmentShaderName );
	actorToCreateFor.meshComponent.createIBOFromJSONData( importMeshJSONData );
	actorToCreateFor.meshComponent.material.loadDiffuseTextureAndSet( importMeshJSONData.diffuseTexture );
}


function LoadMeshDataFromJSONFile( fileName )
{
	var meshAsJSON = null;

	$.ajax(
	{
	    async: false, 
	    dataType : "text",
	    url: fileName,
	    success: function( result ) 
	    {
	        console.log( "--- loadMeshDataFromJSONFile text file has been loaded! --- " );
	        meshAsJSON = JSON.parse( result );
	    }
   	});

   	return meshAsJSON;
}



var MeshComponent = function()
{
	this.material 			= null;
	this.m_vertexBuffer 	= null;
	this.m_normalBuffer 	= null;
	this.m_texCoordBuffer 	= null;
	this.m_faceBuffer 		= null;
	this.m_NPoints 			= 0;
}


MeshComponent.prototype = 
{
	constructor : MeshComponent,


	update : function( deltaSeconds )
	{

	},


	render : function( deltaSeconds )
	{
		this.setUpRenderingState( deltaSeconds );
		// PR: This call will NOT work with multiple buffers per mesh
		//this.bindBuffers(); 
		this.renderMesh();
	},


	setUpRenderingState : function( deltaSeconds )
	{
		if ( this.material !== null )
		{
			this.material.setUpRenderingState( this, deltaSeconds );
		}
	},


	bindBuffers : function()
	{
		if ( this.m_vertexBuffer !== null && this.m_faceBuffer !== null && this.m_normalBuffer !== null )
		{
			var sharedRenderer = CBRenderer.getSharedRenderer();
			sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_vertexBuffer );
			sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_normalBuffer );
			sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, this.m_faceBuffer );
		}
	},


	renderMesh : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();
		sharedRenderer.renderer.drawElements( sharedRenderer.renderer.TRIANGLES, this.m_NPoints, sharedRenderer.renderer.UNSIGNED_INT, 0 );
	},


	createMaterial : function( vertexShaderName, fragmentShaderName )
	{
		this.material = null;
		this.material = new Material();
		this.material.loadAndSetShaderProgram( vertexShaderName, fragmentShaderName );
	},


	createIBOForVertexDataAndFaceData : function( vertexData, faceData )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		// Vertex Buffer
		this.m_vertexBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_vertexBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ARRAY_BUFFER, 
			new Float32Array( vertexData ),
			sharedRenderer.renderer.STATIC_DRAW );

		// Face Buffer
		this.m_faceBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, this.m_faceBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, 
			new Uint32Array( faceData ),
			sharedRenderer.renderer.STATIC_DRAW );

		this.m_NPoints = faceData.length;
	},


	createIBOFromJSONData : function( jsonData )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		var vertexData 		= jsonData.vertexPositions;
		var faceData 		= jsonData.indices;
		var normalData 		= jsonData.vertexNormals;
		var texCoordData 	= jsonData.vertexTextureCoords;

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

		// Tex Coord Buffer
		this.m_texCoordBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_texCoordBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ARRAY_BUFFER, 
			new Float32Array( texCoordData ),
			sharedRenderer.renderer.STATIC_DRAW );

		// Face Buffer
		this.m_faceBuffer = sharedRenderer.renderer.createBuffer();
		sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, this.m_faceBuffer );
		sharedRenderer.renderer.bufferData( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, 
			new Uint32Array( faceData ),
			sharedRenderer.renderer.STATIC_DRAW );

		this.m_NPoints = faceData.length;
	},

}