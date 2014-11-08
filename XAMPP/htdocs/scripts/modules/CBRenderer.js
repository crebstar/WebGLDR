
define( [], function()
{
	console.log( "CBRenderer has finished loading" );
});


var CBRenderer = ( function()
{
	// ====== Private Variables ====== //
	this.renderer 				= null;
	this.canvasDOMElement 		= null;
	this.canvasID 				= '';
	this.bWebGLContextValid 	= false;
	this.bRendererInitialized 	= false;

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

			this.canvasDOMElement.width = window.innerWidth;
			this.canvasDOMElement.height = window.innerHeight;
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




