
var camera, scene, renderer;
var mesh;
var gamepadInfo;

init();
animate();

function init() {

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// =========== POINTER LOCK ================= //
	renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || 
		renderer.domElement.mozRequestPointerLock ||
		renderer.domElement.webkitRequestPointerLock;

	document.exitPointerLock = document.exitPointerLock ||
		document.mozExitPointerLock ||
		document.webkitExitPointerLock;

	document.addEventListener( "webkitpointerlockchange", function() { console.log( "Pointer Lock has changed" ); } );

	// =========== FULL SCREEN ================== //
	renderer.domElement.requestFullscreen = renderer.domElement.requestFullscreen ||
		renderer.domElement.mozRequestFullscreen ||
		renderer.domElement.webkitRequestFullscreen ||
		renderer.domElement.msRequestFullScreen;

	document.exitFullscreen = document.exitFullscreen ||
		document.mozCancelFullScreen ||
		document.webkitExitFullscreen ||
		document.domElement.msExitFullscreen;

	document.fullscreenEnabled = document.fullscreenEnabled || 
		document.mozFullScreenEnabled ||
		document.webkitFullscreenEnabled;

	document.addEventListener( "webkitfullscreenchange", function() { console.log( "Fullscreen has changed"); } );

	// =========== FULL SCREEN ================== //

	// ========== gamepad ============== //
	gamepadInfo = document.getElementById( 'gamepad-info' );
	// ========== gamepad ============== //
			
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 400;

	scene = new THREE.Scene();

	var geometry = new THREE.BoxGeometry( 200, 200, 200 );

	var texture = THREE.ImageUtils.loadTexture( 'art/textures/crate.gif' );
	texture.anisotropy = renderer.getMaxAnisotropy();

	var material = new THREE.MeshBasicMaterial( { map: texture } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	//

	window.addEventListener( 'resize', onWindowResize, false );
}


var onKeyDown = function( e )
{
	if ( ( e.keyCode === 32 ) || ( String.fromCharCode( e.keyCode ) === 'F' ) )
	{
		renderer.domElement.requestFullscreen();
		renderer.domElement.requestPointerLock();
	}
	else if ( ( String.fromCharCode( e.keyCode ) === 'X' ) )
	{
		document.exitFullscreen();
		document.exitPointerLock();
	}
}

var onMouseMove = function(e) 
{
	if ( document.webkitIsFullScreen )
	{
		var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

		mesh.rotation.x += movementY * 0.001;
	}
}


window.addEventListener( 'keydown', onKeyDown );
window.addEventListener( 'mousemove', onMouseMove, false );


function onWindowResize() 
{

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


window.addEventListener( 'gamepadconnected', function()
{
	var gamepads = navigator.getGamepads();
	var gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

	gamepadInfo.innerHTML = "Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length;
} );


window.addEventListener( 'gamepaddisconnected', function() 
{
	gamepadInfo.innerHTML = "Waiting for Gamepad";
});


function pollGamepads()
{
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];

	for ( var i = 0; i < gamepads.length; ++i )
	{
		var gp = gamepads[i];
		if ( gp )
		{
			gamepadInfo.innerHTML = "Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length;
		}
	}
}

function gameLoop() 
{
	var gamepads = navigator.getGamepads();
	var gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

	var deadzone = 0.20;
	var movementMagnitude = 8;
	var rotationSpeed = 0.05;

	if ( gp )
	{
		if ( buttonPressed( gp.buttons[7] ) )
		{
			camera.translateX( 15 );
		}
		else if ( buttonPressed( gp.buttons[5] ) )
		{
			camera.translateX( -15 );
		}

		var xLeftThumb = gp.axes[0];
		var yLeftThumb = gp.axes[1];

		if ( Math.abs( xLeftThumb ) > deadzone || Math.abs( yLeftThumb ) > deadzone )
		{
			camera.translateX( movementMagnitude * xLeftThumb );
			camera.translateZ( movementMagnitude * yLeftThumb );
		}
		

		var xRightThumb = gp.axes[2];
		var yRightThumb = gp.axes[3];

		if ( Math.abs( xRightThumb ) > deadzone || Math.abs( yRightThumb ) > deadzone )
		{
			camera.rotateX( -yRightThumb * rotationSpeed );
			camera.rotateY( -xRightThumb * rotationSpeed );
		}
	}
}


function buttonPressed( b )
{
	if ( typeof(b) === "object" )
	{
		return b.pressed;
	}

	return b == 1.0;
}


function animate() 
{
	gameLoop();

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

		