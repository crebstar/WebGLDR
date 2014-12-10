define( [ "require", "CBEngine", "CBRenderer", "MathUtil", "Collections" ], function( require, MathUtil, Collections )
{
	console.log( "InputManager.js has finished loading" );
});

var bUsePointerLock 	= false;
var mouseTimer 			= null;
var mouseTimerDelay 	= 75.0;
var mouseDampenFactor   = 0.079;
var keysDown 			= {};

var Input = 
{
	Mouse:
	{
		lastX: 0.0,
		lastY: 0.0,
		moveX : 0.0,
		moveY : 0.0,
		pressed: false
	}
}


function UpdateInput( deltaSeconds )
{

}


var onKeyDown = function(e) 
{
	keysDown[ e.keyCode ] = true;
}


var onKeyUp = function(e)
{
	keysDown[ e.keyCode ] = false;
}


var onMouseDown = function(e) 
{
	Input.Mouse.pressed = true;
}


var MouseStopped = function()
{
	Input.Mouse.moveX = 0.0;
	Input.Mouse.moveY = 0.0;
}


var onMouseMove = function(e) 
{
	/*
	var movementX = //e.movementX ||
     // e.mozMovementX          ||
      e.webkitMovementX       ||
      0;

  	var movementY = //e.movementY ||
     // e.mozMovementY      ||
      e.webkitMovementY   ||
      0;
      */

     // Optimizing since demo is meant for chrome
    var movementX = e.webkitMovementX;
  	var movementY = e.webkitMovementY;

	Input.Mouse.moveX = movementX;
	Input.Mouse.moveY = movementY;
}


var onMouseUp = function(e)
{
	Input.Mouse.pressed = false;
}


var changeCallback = function(e)
{
	var sharedRenderer = CBRenderer.getSharedRenderer();
	var requestedElement = CBRenderer.canvasDOMElement;
	if ( document.pointerLockElement === requestedElement ||
 		document.mozPointerLockElement === requestedElement ||
  		document.webkitPointerLockElement === requestedElement )
	{
		console.log( " ===== POINTER LOCK ENABLED =====" );
		bUsePointerLock = true;
	}
	else
	{
		console.log( " ===== POINTER LOCK DISABLED =====" );
		bUsePointerLock = false;
	}
}


document.addEventListener('pointerlockchange', changeCallback, false);
document.addEventListener('mozpointerlockchange', changeCallback, false);
document.addEventListener('webkitpointerlockchange', changeCallback, false);


window.addEventListener( "keydown", onKeyDown );
window.addEventListener( "keyup", onKeyUp );
window.addEventListener( "mousedown", onMouseDown );
window.addEventListener( "mouseup", onMouseUp );
window.addEventListener( "mousemove", onMouseMove );