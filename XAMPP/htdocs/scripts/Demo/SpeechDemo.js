
var commandMoveRight = 'move right';
var commandMoveLeft = 'move left';
var commandMoveUp = 'move up';
var commandMoveDown = 'move down';
var commandReturn = 'go home';
var moveDistance = 1.0;

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


var initialCubePosition = cube.position;


function render() {

	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

var final_transcript = '';


var recognition = new webkitSpeechRecognition();

var speechResultDiv = document.getElementById( 'SpeechResults' )

recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = function( event )
{
	console.log( "OnResult called from Speech Recognition" );

	var interim_transcript = '';
	final_transcript = '';

    for ( var i = event.resultIndex; i < event.results.length; ++i ) {
      if ( event.results[i].isFinal ) 
      {
       	final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    speechResultDiv.innerHTML = final_transcript;
    console.log( final_transcript );
    //final_transcript = capitalize(final_transcript);
    //final_span.innerHTML = linebreak(final_transcript);
    //interim_span.innerHTML = linebreak(interim_transcript);

    final_transcript = final_transcript.trim();

    if ( final_transcript === commandMoveRight )
    {
    	//console.log( "Command move right received" );
    	cube.position.x += moveDistance;
    }
    else if ( final_transcript === commandMoveLeft )
    {
    	//console.log( "Command move left received" );
    	cube.position.x -= moveDistance;
    }
    else if ( final_transcript === commandMoveUp )
    {
    	cube.position.y += moveDistance;
    }
    else if ( final_transcript === commandMoveDown )
    {
    	cube.position.y -= moveDistance;
    }
    else if ( final_transcript === commandReturn )
    {
    	cube.position = initialCubePosition;
    }

     var u = new SpeechSynthesisUtterance( final_transcript );
    speechSynthesis.speak(u);

    final_transcript = '';
}


var GetQuery = function() 
{
	recognition.lang = 'en-US';
	recognition.start();

	console.log( "Starting capturing of audio" );
	speechResultDiv.innerHTML = "Capturing Audio...";
}


var onKeyDown = function(e) 
{
	if ( String.fromCharCode( e.keyCode ) === 'F' )
	{
		GetQuery();
	}
	else if ( String.fromCharCode( e.keyCode ) === 'G' )
	{
		recognition.stop();
	}
}


window.addEventListener( "keydown", onKeyDown );


render();