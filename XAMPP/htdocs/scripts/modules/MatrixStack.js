
define( [ "MathUtil", "Collections" ], function( MathUtil, Collections ) 
{
	console.log( "MatrixStack.js has finished loading" );

	InitializeMatrixStack();
});

// ===== Global Matrix Stack ===== //
var CBMatrixStack = null;


function InitializeMatrixStack()
{
	CBMatrixStack = new MatrixStack();
}


var MatrixStack = function()
{
	this.m_matrixStack 	= new Array(); 

	this.m_currentProjectionMatrix 		= mat4.create();
	this.m_currentViewMatrix 			= mat4.create();
	this.m_currentModelMatrix 			= mat4.create();

	this.m_currentCameraPosition 		= vec3.create();
	// PR TODO :: 
	//this.m_worldToCameraSpaceTransform 	= mat4.create();
	//this.m_cameraToWorldSpaceTransform 	= mat4.create();
}


MatrixStack.prototype = 
{
	constructor : MatrixStack,


	pushMatrix : function( matrixToPush )
	{
		this.m_matrixStack.push( matrixToPush );
	},


	popMatrix : function()
	{
		this.m_matrixStack.pop();
	},


	getMatrixAtTopOfStack : function()
	{
		if ( this.m_matrixStack.length > 0 )
		{
			return this.m_matrixStack[ this.m_matrixStack.length - 1 ];
		}
		else
		{
			// Return Identity if stack is empty
			var identityMatrix = mat4.create();
			return identityMatrix;
		}
	},


	cacheCurrentCameraPosition : function( cameraPos )
	{
		this.m_currentCameraPosition[0] = cameraPos[0];
		this.m_currentCameraPosition[1] = cameraPos[1];
		this.m_currentCameraPosition[2] = cameraPos[2];
	},


	applyTransformAndPushToStack : function( matrixToApply )
	{
		var topMatrix = this.getMatrixAtTopOfStack();

		var resultMatrix = mat4.create();
		mat4.multiply( resultMatrix, matrixToApply, topMatrix );
		this.pushMatrix( resultMatrix );
	},


	applyViewMatrixAndCache : function ( viewMatrix )
	{
		this.m_currentViewMatrix = viewMatrix;
		this.applyTransformAndPushToStack( viewMatrix );
	},


	applyProjectionMatrixAndCache : function( projectionMatrix )
	{
		this.m_currentProjectionMatrix = projectionMatrix;
		this.applyTransformAndPushToStack( projectionMatrix );
	},


	applyOrthoMatrixAndCache : function( orthoMatrix )
	{
		this.m_currentProjectionMatrix = orthoMatrix;
		this.applyTransformAndPushToStack( orthoMatrix );
	},


	applyModelMatrixAndCache : function( modelMatrix )
	{
		this.m_currentModelMatrix = modelMatrix;
		this.applyTransformAndPushToStack( modelMatrix );
	},


	clearMatrixStack : function()
	{
		this.m_matrixStack.clear();
	},


	clearMatrixStackAndPushIdentityMatrix : function()
	{
		var identityMatrix = mat4.create();
		this.clearMatrixStack();
		this.m_matrixStack.push( identityMatrix );
	},


	clearMatrixMVPCache : function()
	{
		var identityMatrix = mat4.create();

		this.m_currentProjectionMatrix  = identityMatrix;
		this.m_currentViewMatrix 		= identityMatrix;
		this.m_currentModelMatrix 		= identityMatrix;
		this.m_currentCameraPosition[0] = 0.0;
		this.m_currentCameraPosition[1] = 0.0;
		this.m_currentCameraPosition[2] = 0.0;
	},
}
