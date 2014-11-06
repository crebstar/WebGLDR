var url = 'https://dl.dropboxusercontent.com/u/8942221/Infected.mp3';
var url2 = 'https://dl.dropboxusercontent.com/u/18036764/BattleTheme.ogg'


var ctx;

try 
{
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	ctx = new AudioContext;
}
catch(e) 
{
	alert( "Your stuff is jacked, try a different browser" );
}

var onError = function( e )
{
	console.log( "Your stuff is jacked: " + e );
}

var infected = null;
var xhr = new XMLHttpRequest();
xhr.open( 'GET', url, true ); // True means async
xhr.responseType = 'arraybuffer';


var source;
source = ctx.createBufferSource();
source.connect( ctx.destination );
source.loop = true;
source.onend = function() 
{
	console.log( "Infected has ended" ) 
};


xhr.onload = function() 
{
	ctx.decodeAudioData( xhr.response, function( buffer ) 
	{
		infected = buffer;
		console.log( "Infected is Loaded" );
		alert( "Infected is loaded" );
	
	}, onError );
}

xhr.send();



var xhr2 = new XMLHttpRequest();
xhr2.open( 'GET', url2, true );
xhr2.responseType = 'arraybuffer';

var BattleTheme = null;
var source2;
source2 = ctx.createBufferSource();
source2.connect( ctx.destination );
source2.loop = true;
source2.onend = function() 
{
	console.log( "Battle theme has ended" ) 
};



xhr2.onload = function() 
{
	ctx.decodeAudioData( xhr2.response, function( buffer ) 
	{
		BattleTheme = buffer;
		console.log( "Battle Theme is Loaded" );
		alert( "Battle Theme is loaded" );
		//source2 = ctx.createBufferSource();
		//source2.connect( ctx.destination );
		

	}, onError );
}

xhr2.send();


var gainNode1 = ctx.createGain();
var gainNode2 = ctx.createGain();

source.connect( gainNode1 );
gainNode1.connect( ctx.destination );

source2.connect( gainNode2 );
gainNode2.connect( ctx.destination );

var fade = document.createElement( 'input' );
fade.type = 'range';
fade.max = 1.0;
fade.min = -1.0;
fade.value = 0.0;
fade.step = 0.01;
document.body.appendChild( fade );

fade.oninput = function(e)
{
	gainNode1 = -1 * +fade.value;
	gainNode2 = +fade.value;
}

var analyser = ctx.createAnalyser();
analyser.fftSize = 256;
var freqData = new Uint8Array( 128 );

var InitAnalyser = function()
{
	var freqSource = ctx.createBufferSource();
	freqSource.connect( analyser );
	analyser.connect( ctx.destination );
	freqSource.buffer = infected;
	freqSource.loop = true;
	freqSource.start(0);
}


window.addEventListener( "keydown", function(e) 
{
	if ( e.keyCode == 32 ) // space bar
	{
		source.buffer = infected;
		source.start(0);
	}
	else if ( e.keyCode == 13 ) 
	{
		source2.buffer = BattleTheme;
		source2.start(0);
	}
	else if ( String.fromCharCode( e.keyCode ) === "I" )
	{
		InitAnalyser();
	}
	else if ( String.fromCharCode( e.keyCode ) === "F" )
	{
		analyser.getByteFrequencyData( freqData );
		UpdateFreq( freqData );
	}
});


var divs = [];

for( var i = 0; i < 128; i++ )
{
	var div = document.createElement( 'div' );
	div.id = i;
	div.style.width = "100%";
	div.style.height = "5px";
	div.style.backgroundColor = "#3333FF";
	divs.push( div );
	document.body.appendChild( div ); 
}

/*
var UpdateFreq = function( array )
{
	for ( var i = 0; i < 128; i++ )
	{
		divs[i].style.width = ( 100 * array[i]/255 ) + "%";
	}
}
*/

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geomSize = 1.0;
var geometry = new THREE.BoxGeometry( geomSize, geomSize, geomSize );

//var cube = new THREE.Mesh( geometry, material );

//scene.add( cube );

camera.position.y = 6;
camera.position.z = 13;

function render() {

	requestAnimationFrame( render );
	renderer.render( scene, camera );
}

var musicCubes = [];

var buildMusicBars = function()
{
	var startPos = -20.0;
	var endPos = 20.0;

	for ( var i = startPos; i <= endPos; i += geomSize )
	{
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cubeForMusic = new THREE.Mesh( geometry, material );
		cubeForMusic.position.x = i;
		scene.add( cubeForMusic );
		musicCubes.push( cubeForMusic );
	}
}

buildMusicBars();


var RangeMapFloat = function RangeMapFloat( inRangeStart, inRangeEnd, outRangeStart, outRangeEnd, inValue )
{
	var outValue;

	// Handle the zero edge case
	if ( inRangeStart === inRangeEnd  ) {
		return 0.50 * ( outRangeStart + outRangeEnd );
	}

	outValue = inValue;

	outValue = outValue - inRangeStart;
	outValue = outValue / ( inRangeEnd - inRangeStart );
	outValue = outValue * ( outRangeEnd - outRangeStart );
	outValue = outValue + outRangeStart;

	return outValue;

} // end rangeMapFloat

var UpdateFreq = function( array )
{
	for ( var i = 0; i < musicCubes.length; i++ )
	{
		var musCub = musicCubes[i];
		musCub.scale.y = ( 20 * array[i]/255 );
		if ( musCub.scale.y <= 0.0 )
		{
			musCub.scale.y = 1.0;
		}

		var inMax = 10;
		var red = RangeMapFloat( 0.0, inMax, 0.0, 1.0, musCub.scale.y );
		var green = RangeMapFloat( 0.0, inMax, 0.0, 1.0, musCub.scale.y );
		var blue = RangeMapFloat( 0.0, inMax, 0.0, 1.0, musCub.scale.y );
		//red = 1.0 - red;
		green = 1.0 - green;
		blue = blue * green;
		var color = new THREE.Color( red, green, 0.08 );
		musCub.material.color = color;

		//console.log( musCub.material.color );
		//divs[i].style.width = ( 100 * array[i]/255 ) + "%";
	}
}


render();