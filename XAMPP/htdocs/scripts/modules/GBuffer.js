
define( [ "CBRenderer", "MathUtil", "Collections", "GLMatrix", "Texture" ], function( CBRenderer )
{
	console.log( "GBuffer.js has finished loading!" );
});


var INVALID_GBUFFER_TEXTURE_ID = -1;


var GBuffer = function()
{

	this.m_frameBuffer					= null;
	this.m_renderBuffer 				= null;

	this.m_diffuseComponentTexture 		= INVALID_GBUFFER_TEXTURE_ID;

	this.m_dirty 						= true;
	this.m_initialized 					= false;
}


GBuffer.prototype = 
{
	constructor : GBuffer,


	initializeGBuffer : function()
	{
		this.initializeFrameBuffer();

		if ( this.m_frameBuffer == null )
		{
			this.m_initialized = false;
			console.log( "Warning: FrameBuffer for GBuffer could not be initialized" );
		}

		this.m_dirty = true;
	},


	initializeFrameBuffer : function()
	{
		/*
		var fb=GL.createFramebuffer();
		GL.bindFramebuffer(GL.FRAMEBUFFER, fb);

		  var rb=GL.createRenderbuffer();
		  GL.bindRenderbuffer(GL.RENDERBUFFER, rb);
		  GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16 , 512, 512);

		  var texture_rtt=GL.createTexture();
		  GL.bindTexture(GL.TEXTURE_2D, texture_rtt);
		  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
		  GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
		  GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 512, 512, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
		 */

		var sharedRenderer = CBRenderer.getSharedRenderer();

		// Frame Buffer
		this.m_frameBuffer = sharedRenderer.renderer.createFramebuffer();
		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, this.m_frameBuffer );

		// Render Buffer
		this.m_renderBuffer = sharedRenderer.renderer.createRenderbuffer();
		sharedRenderer.renderer.bindRenderbuffer( sharedRenderer.renderer.RENDERBUFFER, this.m_renderBuffer );
		sharedRenderer.renderer.renderbufferStorage( 
			sharedRenderer.renderer.RENDERBUFFER,
		 	sharedRenderer.renderer.DEPTH_COMPONENT16,
		 	sharedRenderer.canvasDOMElement.width,
		 	sharedRenderer.canvasDOMElement.height );

		// Diffuse Component
		this.m_diffuseComponentTexture = sharedRenderer.renderer.createTexture();
		sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, this.m_diffuseComponentTexture );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	sharedRenderer.renderer.TEXTURE_MAG_FILTER,
		  	sharedRenderer.renderer.LINEAR );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_MIN_FILTER, 
			sharedRenderer.renderer.LINEAR );

		
		sharedRenderer.renderer.texImage2D( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	0,
		 	sharedRenderer.renderer.RGBA,
		 	sharedRenderer.canvasDOMElement.width,
		 	sharedRenderer.canvasDOMElement.height,
		 	0,
		 	sharedRenderer.renderer.RGBA,
		 	sharedRenderer.renderer.UNSIGNED_BYTE, 
		 	null );

		
		/*
		  GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture_rtt, 0);

		  GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, rb);

		  GL.bindTexture(GL.TEXTURE_2D, null);
		  GL.bindRenderbuffer(GL.RENDERBUFFER, null);
		  GL.bindFramebuffer(GL.FRAMEBUFFER, null);
		*/
		// FrameBuffer
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.renderer.COLOR_ATTACHMENT0, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_diffuseComponentTexture, 
		 	0 );

		// RenderBuffer
		sharedRenderer.renderer.framebufferRenderbuffer( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.renderer.DEPTH_ATTACHMENT, 
		 	sharedRenderer.renderer.RENDERBUFFER, 
		 	this.m_renderBuffer );

		// Unbind buffers and textures
		sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );
		sharedRenderer.renderer.bindRenderbuffer( sharedRenderer.renderer.RENDERBUFFER, null );
		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, null );
	},


	bindGBufferFrameBuffer : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, this.m_frameBuffer );
	},


	unbindGBufferFrameBuffer : function()
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		sharedRenderer.renderer.bindFramebuffer( sharedRenderer.renderer.FRAMEBUFFER, null );
	}
}