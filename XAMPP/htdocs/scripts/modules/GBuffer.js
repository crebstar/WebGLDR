
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
	this.m_depthComponentTexture 		= INVALID_GBUFFER_TEXTURE_ID;

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

		sharedRenderer.renderer.texParameteri( sharedRenderer.renderer.TEXTURE_2D, sharedRenderer.renderer.TEXTURE_WRAP_S, sharedRenderer.renderer.CLAMP_TO_EDGE);
		sharedRenderer.renderer.texParameteri( sharedRenderer.renderer.TEXTURE_2D, sharedRenderer.renderer.TEXTURE_WRAP_T, sharedRenderer.renderer.CLAMP_TO_EDGE);
		
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

		// Depth
		this.m_depthComponentTexture = sharedRenderer.renderer.createTexture();
		sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, this.m_depthComponentTexture );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	sharedRenderer.renderer.TEXTURE_MAG_FILTER,
		  	sharedRenderer.renderer.NEAREST );

		sharedRenderer.renderer.texParameteri( 
			sharedRenderer.renderer.TEXTURE_2D, 
			sharedRenderer.renderer.TEXTURE_MIN_FILTER, 
			sharedRenderer.renderer.NEAREST );

		sharedRenderer.renderer.texParameteri( sharedRenderer.renderer.TEXTURE_2D, sharedRenderer.renderer.TEXTURE_WRAP_S, sharedRenderer.renderer.CLAMP_TO_EDGE);
		sharedRenderer.renderer.texParameteri( sharedRenderer.renderer.TEXTURE_2D, sharedRenderer.renderer.TEXTURE_WRAP_T, sharedRenderer.renderer.CLAMP_TO_EDGE);

		sharedRenderer.renderer.texImage2D( 
			sharedRenderer.renderer.TEXTURE_2D,
		 	0,
		 	sharedRenderer.renderer.DEPTH_COMPONENT,
		 	sharedRenderer.canvasDOMElement.width,
		 	sharedRenderer.canvasDOMElement.height,
		 	0,
		 	sharedRenderer.renderer.DEPTH_COMPONENT,
		 	sharedRenderer.renderer.UNSIGNED_SHORT, 
		 	null );

		// gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

		// FrameBuffer
		// Diffuse
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.renderer.COLOR_ATTACHMENT0, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_diffuseComponentTexture, 
		 	0 );

		// Depth
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.renderer.DEPTH_ATTACHMENT, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_depthComponentTexture, 
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