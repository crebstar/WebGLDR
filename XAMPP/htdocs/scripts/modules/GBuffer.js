
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
	this.m_renderTargetTwoTexture 		= INVALID_GBUFFER_TEXTURE_ID;
	this.m_renderTargetThreeTexture 	= INVALID_GBUFFER_TEXTURE_ID;
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

		// Diffuse Component
		this.m_diffuseComponentTexture = sharedRenderer.renderer.createTexture();

		sharedRenderer.renderer.bindTexture( 
			sharedRenderer.renderer.TEXTURE_2D, 
			this.m_diffuseComponentTexture );

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
		this.m_renderTargetTwoTexture = sharedRenderer.renderer.createTexture();

		sharedRenderer.renderer.bindTexture( 
			sharedRenderer.renderer.TEXTURE_2D, 
			this.m_renderTargetTwoTexture );

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


		// Render Target Three
		this.m_renderTargetThreeTexture = sharedRenderer.renderer.createTexture();

		sharedRenderer.renderer.bindTexture( 
			sharedRenderer.renderer.TEXTURE_2D, 
			this.m_renderTargetThreeTexture );

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


		// Depth
		this.m_depthComponentTexture = sharedRenderer.renderer.createTexture();
		sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, 
			this.m_depthComponentTexture );

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
		 	sharedRenderer.renderer.DEPTH_COMPONENT,
		 	sharedRenderer.canvasDOMElement.width,
		 	sharedRenderer.canvasDOMElement.height,
		 	0,
		 	sharedRenderer.renderer.DEPTH_COMPONENT,
		 	sharedRenderer.renderer.UNSIGNED_SHORT, 
		 	null );

		// FrameBuffer
		// RT_ONE
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.drawBuffers.COLOR_ATTACHMENT0_WEBGL, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_diffuseComponentTexture, 
		 	0 );

		// RT_TWO
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.drawBuffers.COLOR_ATTACHMENT1_WEBGL, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_renderTargetTwoTexture, 
		 	0 );

		// RT_THREE
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.drawBuffers.COLOR_ATTACHMENT2_WEBGL, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_renderTargetThreeTexture, 
		 	0 );
		
		// Depth
		sharedRenderer.renderer.framebufferTexture2D( 
			sharedRenderer.renderer.FRAMEBUFFER,
		 	sharedRenderer.renderer.DEPTH_ATTACHMENT, 
		 	sharedRenderer.renderer.TEXTURE_2D, 
		 	this.m_depthComponentTexture, 
		 	0 );

	
		console.log( "GBuffer FrameBuffer status after initialization: " );
		console.log( sharedRenderer.renderer.checkFramebufferStatus( sharedRenderer.renderer.FRAMEBUFFER) == sharedRenderer.renderer.FRAMEBUFFER_COMPLETE );

		sharedRenderer.drawBuffers.drawBuffersWEBGL([
		  sharedRenderer.drawBuffers.COLOR_ATTACHMENT0_WEBGL, 
		  sharedRenderer.drawBuffers.COLOR_ATTACHMENT1_WEBGL, 
		  sharedRenderer.drawBuffers.COLOR_ATTACHMENT2_WEBGL, 
		]);
		
		// Unbind buffers and textures
		sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );
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