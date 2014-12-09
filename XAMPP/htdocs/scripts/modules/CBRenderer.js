
define( [ "MatrixStack", "MathUtil", "GLMatrix", "Collections", "PostRenderScene" ], function( MatrixStack, MathUtil, Collections )
{
	console.log( "CBRenderer has finished loading" );
});


var CBRenderer = ( function()
{
	// ====== Private Variables ====== //
	this.renderer 						= null;
	this.drawBuffers 					= null;
	this.canvasDOMElement 				= null;
	this.canvasID 						= '';

	this.m_projectionMatrix 			= null;

	this.bWebGLContextValid 			= false;
	this.bRendererInitialized 			= false;

	function CBRenderer()
	{
		// ====== Public Functions ====== //
		this.isWebGLContextValid = function()
		{
			return this.bWebGLContextValid;
		}


		this.initializeRenderer = function( canvID )
		{
			if ( this.bRendererInitialized )
			{
				console.log( "Warning-> Renderer has already been initialized!" );
				return;
			}

			console.log( "CBRenderer is being initialized..." );
		
			this.canvasID = canvID;
			this.canvasDOMElement = this.getCanvasElementWithID();
			this.setCanvasRenderingParameters();
			this.renderer = this.getWebGLContext();
			this.setDefaultRenderingSettings();

			this.validateInitialization();

			this.bRendererInitialized = true;
		}


		// ====== Private Functions ====== //
		CBRenderer.prototype.getCanvasElementWithID = function ()
		{
			var canvasElement = null;

			canvasElement = document.getElementById( this.canvasID );

			return canvasElement;
		}


		CBRenderer.prototype.getWebGLContext = function()
		{
			var webGLContext;

			if ( this.canvasDOMElement == null )
			{
				console.log( "Warning: Could not locate canvas element with ID: " + this.canvasID );
				console.log( "Either canvas element is missing or the DOM has not finished loading..." );
				return;
			}

			try
			{
				webGLContext = this.canvasDOMElement.getContext( "webgl" ) || this.canvasDOMElement.getContext( "experimental-webgl" );
				// PR: to support UInt32 indices for face buffer
				var EXT = webGLContext.getExtension( "OES_element_index_uint" ) ||
      				webGLContext.getExtension( "OES_element_index_uint" ) ||
        			webGLContext.getExtension( "WEBKIT_OES_element_index_uint" );

        		var DepthEXT = webGLContext.getExtension( "WEBKIT_WEBGL_depth_texture" ) ||
        			webGLContext.getExtension( "WEBGL_depth_texture" );

        			
        		var floatTextureExt = webGLContext.getExtension( "OES_texture_float_linear" ) ||
        			webGLContext.getExtension( "OES_texture_half_float_linear" ) ||
        			webGLContext.getExtension( "WEBGL_color_buffer_float" ) ||
        			webGLContext.getExtension( "EXT_color_buffer_half_float" );
        			
        		var floatExt = webGLContext.getExtension("OES_texture_float");
   					

        		//http://stackoverflow.com/questions/18795477/webgl-draw-buffers-not-supported-on-latest-firefox-chrome
        		var drawBuffersExtension = webGLContext.getExtension( 'WEBGL_draw_buffers' ) || 
        			webGLContext.getExtension( "GL_EXT_draw_buffers" ) ||
        			webGLContext.getExtension( "EXT_draw_buffers" );

        		this.drawBuffers = drawBuffersExtension;

        		console.log( floatExt );
        		console.log( floatTextureExt );
        		console.log( drawBuffersExtension );

        		if ( !DepthEXT )
        		{
        			console.log( "Warning: Depth Texture extension is not supported with the current browser!" );
        		}

			}
			catch ( webGLError )
			{
				return null;
			}

			return webGLContext;
		}


		CBRenderer.prototype.setCanvasRenderingParameters = function()
		{
			if ( this.canvasDOMElement == null )
			{
				return;
			}

			this.canvasDOMElement.width = 2048;
			this.canvasDOMElement.height = 1024;
		}


		CBRenderer.prototype.setDefaultRenderingSettings = function()
		{
			this.renderer.clearColor( 0.0, 0.0, 0.0, 0.0 );
			this.renderer.enable( this.renderer.DEPTH_TEST );
			this.renderer.depthFunc( this.renderer.LEQUAL );
			this.renderer.depthMask( true );
			this.renderer.clearDepth( 1.0 );
			this.renderer.enable( this.renderer.BLEND );
			this.renderer.blendFunc( this.renderer.SRC_ALPHA, this.renderer.ONE_MINUS_SRC_ALPHA );
			this.renderer.enable( this.renderer.CULL_FACE );
			
			// PR: TODO:: Refactor this out of the renderer
			// perspective = function (out, fovy, aspect, near, far)
			this.m_projectionMatrix = mat4.create();
			mat4.perspective( this.m_projectionMatrix, 50.6, ( this.canvasDOMElement.width / this.canvasDOMElement.height ), 1.0, 1000.0 );
		}


		CBRenderer.prototype.validateInitialization = function()
		{
			if ( this.renderer !== null )
			{
				console.log( "WebGLContext has been initialized! Browser supports WebGL" );
				this.bWebGLContextValid = true;
			}
			else
			{
				console.log( "Warning: WebGLContext could not be loaded from webgl or experimental-webgl. Browser likely does not support WebGL" );
				this.bWebGLContextValid = false;
			}
		}


		CBRenderer.prototype.getCenterOfCanvas = function()
		{
			var canvasCenter = vec2.create();
			canvasCenter[0] = 0;
			canvasCenter[1] = 0;
			if ( this.canvasDOMElement !== null )
			{
				canvasCenter[0] = this.canvasDOMElement.width * 0.50;
				canvasCenter[1] = this.canvasDOMElement.height * 0.50;
			}

			return canvasCenter;
		}


		CBRenderer.prototype.applyProjectionMatrix = function()
		{
			CBMatrixStack.applyProjectionMatrixAndCache( this.m_projectionMatrix );
		}


		CBRenderer.prototype.applyOrthoMatrix = function()
		{
			var orthoMatrix = mat4.create();

			// function (out, left, right, bottom, top, near, far)
			mat4.ortho( orthoMatrix, 0.0, this.canvasDOMElement.width, 0.0, this.canvasDOMElement.height, 0.0, 1.0 );

			CBMatrixStack.applyOrthoMatrixAndCache( orthoMatrix );
		}


		// ======== Rendering Interface ========== //
		CBRenderer.prototype.renderScene = function( sceneToRender, deltaSeconds )
		{
			CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();
			this.applyProjectionMatrix();

			this.renderer.blendFunc( this.renderer.SRC_ALPHA, this.renderer.ONE_MINUS_SRC_ALPHA );

			this.renderer.enable( this.renderer.DEPTH_TEST );
			this.renderer.depthMask( true );
			this.renderer.clearDepth( 1.0 );

			this.renderer.cullFace( this.renderer.BACK );
			
			sceneToRender.render( deltaSeconds );

			this.renderer.bindTexture( this.renderer.TEXTURE_2D, null );
		}


		CBRenderer.prototype.renderSceneToGBuffer = function( sceneToRender, GBufferTarget, deltaSeconds )
		{
			CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();
			this.applyProjectionMatrix();

			this.renderer.blendFunc( this.renderer.ONE, this.renderer.ZERO );

			GBufferTarget.bindGBufferFrameBuffer();

			this.renderer.enable( this.renderer.DEPTH_TEST );
			this.renderer.depthMask( true );
			this.renderer.clearDepth( 1.0 );
			this.renderer.clearColor( 0.0, 0.0, 0.0, 0.0 );

			this.renderer.clear( this.renderer.COLOR_BUFFER_BIT | this.renderer.DEPTH_BUFFER_BIT );

			this.renderer.cullFace( this.renderer.BACK );

			sceneToRender.render( deltaSeconds );

			GBufferTarget.m_dirty = false;
			GBufferTarget.unbindGBufferFrameBuffer();

			this.renderer.clear( this.renderer.COLOR_BUFFER_BIT | this.renderer.DEPTH_BUFFER_BIT );
    		
			this.renderer.bindTexture( this.renderer.TEXTURE_2D, null );
		}


		CBRenderer.prototype.renderSceneLightsToLBuffer = function( lightsToRender, GBufferTarget, LBufferTarget, deltaSeconds )
		{
			CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();

			this.applyProjectionMatrix();
			CBMatrixStack.applyViewMatrixAndCache( CBMatrixStack.m_currentViewMatrix );

			LBufferTarget.bindLBufferFrameBuffer();

			this.renderer.blendFunc( this.renderer.ONE, this.renderer.ONE );

			this.renderer.disable( this.renderer.DEPTH_TEST );
			this.renderer.depthMask( false );
			this.renderer.clearColor( 0.0, 0.0, 0.0, 0.0 );

			this.renderer.clear( this.renderer.COLOR_BUFFER_BIT );

			this.renderer.cullFace( this.renderer.FRONT );

			for ( var i = 0; i < lightsToRender.length; ++i )
			{
				var light = lightsToRender[i];
				light.applyLightAndRenderToLBuffer( GBufferTarget, deltaSeconds );
			}

			this.renderer.cullFace( this.renderer.BACK );

			this.renderer.enable( this.renderer.DEPTH_TEST );
			this.renderer.depthMask( true );

			LBufferTarget.unbindLBufferFrameBuffer();

			this.renderer.clear( this.renderer.COLOR_BUFFER_BIT | this.renderer.DEPTH_BUFFER_BIT );
		}


		CBRenderer.prototype.renderPostRenderScene = function( sceneToRender, GBufferTarget, deltaSeconds )
		{
			CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();
			CBMatrixStack.clearMatrixMVPCache();

			this.applyOrthoMatrix();

			this.renderer.disable( this.renderer.DEPTH_TEST );
			this.renderer.depthMask( false );

			this.renderer.blendFunc( this.renderer.ONE, this.ZERO );
			//this.renderer.blendFunc( this.renderer.SRC_ALPHA, this.renderer.ONE_MINUS_SRC_ALPHA );
			this.renderer.cullFace( null );

			sceneToRender.render( deltaSeconds, GBufferTarget );

			this.renderer.bindTexture( this.renderer.TEXTURE_2D, null );
		}


		CBRenderer.prototype.renderSceneFinalPass = function( sceneToRender, GBufferTarget, LBufferTarget, deltaSeconds )
		{
			CBMatrixStack.clearMatrixStackAndPushIdentityMatrix();
			CBMatrixStack.clearMatrixMVPCache();

			this.applyOrthoMatrix();

			this.renderer.disable( this.renderer.DEPTH_TEST );
			this.renderer.depthMask( false );

			//this.renderer.blendFunc( this.renderer.ONE, this.ZERO );
			this.renderer.blendFunc( this.renderer.SRC_ALPHA, this.renderer.ONE_MINUS_SRC_ALPHA );

			sceneToRender.render( GBufferTarget, LBufferTarget, deltaSeconds );
		}
	}

	// Singleton Reference
	var rendererInstance 		= null;

	function createCBRendererInstance()
	{
		var rendererInstance = new CBRenderer();
		return rendererInstance;
	}


	return {
		getSharedRenderer: function(){
			if ( rendererInstance == null )
			{
				rendererInstance = createCBRendererInstance();
				rendererInstance.constructor = null;
			}

			return rendererInstance;	
		}
	};
})();




