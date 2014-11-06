
var chirp = document.getElementById( 'chirp' );
chirp.play();

var sound = document.createElement( 'audio' );
var source = document.createElement( 'source' );

sound.controls = true;

source.type = 'audio/ogg';

source.src = 'http://gametheorylabs.com/JaHOVAOS/scripts/Applications/Audio/Laser1.ogg';

sound.appendChild( source );
//sound.play();

// ---- INPUT ------ //

var Input = {
	Mouse: {
		lastX: 0,
		lastY: 0,
		pressed: false
	}
}

var onKeyDown = function(e) 
{
	if ( String.fromCharCode( e.keyCode ) === 'F' )
	{
		sound.play();
	}
}


var onKeyUp = function(e) 
{

}


var onMouseDown = function(e) 
{
	Input.Mouse.pressed = true;
	chirp.play();
}


var onMouseMove = function(e) 
{
	if ( Input.Mouse.pressed )
	{
		Input.Mouse.lastX = e.clientX;
		Input.Mouse.lastY = e.clientY;
	}
}


var onMouseUp = function(e)
{

}

// Can use document.
window.addEventListener( "keydown", onKeyDown );
window.addEventListener( "keyup", onKeyUp );
window.addEventListener( "mousedown", onMouseDown );
window.addEventListener( "mouseup", onMouseUp );
window.addEventListener( "mousemove", onMouseMove );