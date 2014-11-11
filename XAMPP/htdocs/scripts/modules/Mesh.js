
define( [ "Collections", "MathUtil", "Material", "CBRenderer" ], function( Collections, MathUtil, Material, CBRenderer )
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


var CreateMeshComponentWithVertDataForActor = function( actorToCreateFor, vertexData, faceData, vertexShaderName, fragmentShaderName )
{
	if ( actorToCreateFor == null )
	{
		return null;
	}

	actorToCreateFor.meshComponent = new MeshComponent();
	actorToCreateFor.meshComponent.createMaterial( vertexShaderName, fragmentShaderName );
	actorToCreateFor.meshComponent.createIBOForVertexDataAndFaceData( vertexData, faceData );
}



var MeshComponent = function()
{
	this.material 			= null;
	this.m_vertexBuffer 	= null;
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
		this.bindBuffers();
		this.renderMesh();
	},


	setUpRenderingState : function( deltaSeconds )
	{
		if ( this.material !== null )
		{
			this.material.setUpRenderingState( deltaSeconds );
		}
	},


	bindBuffers : function()
	{
		if ( this.m_vertexBuffer !== null && this.m_faceBuffer !== null )
		{
			var sharedRenderer = CBRenderer.getSharedRenderer();
			sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ARRAY_BUFFER, this.m_vertexBuffer );
			sharedRenderer.renderer.bindBuffer( sharedRenderer.renderer.ELEMENT_ARRAY_BUFFER, this.m_faceBuffer );
		}
	},


	renderMesh : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();
		sharedRenderer.renderer.drawElements( sharedRenderer.renderer.TRIANGLES, this.m_NPoints, sharedRenderer.renderer.UNSIGNED_SHORT, 0 );
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
			new Uint16Array( faceData ),
			sharedRenderer.renderer.STATIC_DRAW );

		this.m_NPoints = faceData.length;
	},
}