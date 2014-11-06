		// require.js for consolidation

		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		camera.position.z = 5;


		function render() {

			requestAnimationFrame( render );
			renderer.render( scene, camera );
		}

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

		
		var moveSpeed = 10.0;
		var deltaSec  = 0.016;

		var onKeyDown = function(e) 
		{
			if ( String.fromCharCode( e.keyCode ) === 'F' )
			{
				sound.play();
			}

			if ( String.fromCharCode( e.keyCode ) === 'W' )
			{
				cube.position.y += moveSpeed * deltaSec;
			}

			if ( String.fromCharCode( e.keyCode ) === 'A' )
			{
				cube.position.x -= moveSpeed * deltaSec;
			}

			if ( String.fromCharCode( e.keyCode ) === 'S' )
			{
				cube.position.y -= moveSpeed * deltaSec;
			}

			if ( String.fromCharCode( e.keyCode ) === 'D' )
			{
				cube.position.x += moveSpeed * deltaSec;
			}
		}


		var onKeyUp = function(e) 
		{

		}


		var onMouseDown = function(e) 
		{
			Input.Mouse.pressed = true;
			sound.play();
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
		
		render();