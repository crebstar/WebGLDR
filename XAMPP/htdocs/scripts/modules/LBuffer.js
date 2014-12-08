define( ["CBRenderer", "MathUtil", "Collections", "GLMatrix", "Texture" ], function()
{
	console.log( "LBuffer.js has finished loading" );
});

var INVALID_LBUFFER_TEXTURE_ID = -1;

var LBuffer = function()
{
	this.m_frameBuffer					= null;

	this.m_diffuseAccumulationTarget 	= INVALID_LBUFFER_TEXTURE_ID;
	this.m_specularAccumulationTarget 	= INVALID_LBUFFER_TEXTURE_ID;

	this.m_initialized 					= false;
}


LBuffer.prototype = 
{
	constructor : LBuffer,


	initializeLBuffer : function()
	{
		this.initializeFrameBuffer();
	},


	initializeFrameBuffer : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		// Frame Buffer
		this.m_frameBuffer = sharedRenderer.renderer.createFramebuffer();
		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, this.m_frameBuffer );

		// Diffuse Accumulation Component
		this.m_diffuseAccumulationTarget = sharedRenderer.renderer.createTexture();

		sharedRenderer.renderer.bindTexture( 
			sharedRenderer.renderer.TEXTURE_2D, 
			this.m_diffuseAccumulationTarget );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	sharedRenderer.renderer.TEXTURE_MAG_FILTER,
		  	sharedRenderer.renderer.LINEAR );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_MIN_FILTER, 
			sharedRenderer.renderer.LINEAR );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_WRAP_S, 
			sharedRenderer.renderer.CLAMP_TO_EDGE );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_WRAP_T, 
			sharedRenderer.renderer.CLAMP_TO_EDGE );
		
		sharedRenderer.renderer.texImage2D( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	0,
		 	sharedRenderer.renderer.RGBA,
		 	sharedRenderer.canvasDOMElement.width,
		 	sharedRenderer.canvasDOMElement.height,
		 	0,
		 	sharedRenderer.renderer.RGBA,
		 	sharedRenderer.renderer.FLOAT, 
		 	null );


		// Render Target Two
		this.m_specularAccumulationTarget = sharedRenderer.renderer.createTexture();

		sharedRenderer.renderer.bindTexture( 
			sharedRenderer.renderer.TEXTURE_2D, 
			this.m_specularAccumulationTarget );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	sharedRenderer.renderer.TEXTURE_MAG_FILTER,
		  	sharedRenderer.renderer.NEAREST );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_MIN_FILTER, 
			sharedRenderer.renderer.NEAREST );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_WRAP_S, 
			sharedRenderer.renderer.CLAMP_TO_EDGE );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_WRAP_T, 
			sharedRenderer.renderer.CLAMP_TO_EDGE );
		
		sharedRenderer.renderer.texImage2D( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	0,
		 	sharedRenderer.renderer.RGBA,
		 	sharedRenderer.canvasDOMElement.width,
		 	sharedRenderer.canvasDOMElement.height,
		 	0,
		 	sharedRenderer.renderer.RGBA,
		 	sharedRenderer.renderer.FLOAT, 
		 	null );

		// FrameBuffer
		// Diffuse Accumulation
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.drawBuffers.COLOR_ATTACHMENT0_WEBGL, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_diffuseAccumulationTarget, 
		 	0 );

		// Specular Accumulation
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.drawBuffers.COLOR_ATTACHMENT1_WEBGL, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_specularAccumulationTarget, 
		 	0 );

		console.log( "LBuffer FrameBuffer status after initialization: " );
		console.log( sharedRenderer.renderer.checkFramebufferStatus( sharedRenderer.renderer.FRAMEBUFFER) == sharedRenderer.renderer.FRAMEBUFFER_COMPLETE );

		sharedRenderer.drawBuffers.drawBuffersWEBGL([
		  sharedRenderer.drawBuffers.COLOR_ATTACHMENT0_WEBGL, 
		  sharedRenderer.drawBuffers.COLOR_ATTACHMENT1_WEBGL, 
		]);
		
		// Unbind buffers and textures
		sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );
		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, null );
	},


	bindLBufferFrameBuffer : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, this.m_frameBuffer );
	},


	unbindLBufferFrameBuffer : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, null );
	}
}