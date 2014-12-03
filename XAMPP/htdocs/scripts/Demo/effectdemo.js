
console.log( "effectdemo.js has loaded" );

var socket = io();

var webrtc = new SimpleWebRTC({
  // the id/element dom element that will hold "our" video
  localVideoEl: 'localVideo',
  // the id/element dom element that will hold remote videos
  remoteVideosEl: 'remotesVideos',
  // immediately ask for camera access
  autoRequestMedia: true
});


webrtc.on('readyToCall', function () {
  // you can name it anything
  webrtc.joinRoom('your awesome room name');
});


/*
var effect = document.getElementById( 'effect' );

effect.width = 640;
effect.height = 480;

var ectx = effect.getContext('2d');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

function onError(e)
{
	console.log( "It is jacked" );
}



var video = document.createElement( 'video' );
video.autoplay = true;
document.body.appendChild( video );

var videoStream = null;

function StartVideo()
{
	if ( navigator.getUserMedia )
	{
		navigator.getUserMedia( { audio : false, video : true }, function( stream )
		{
			videoStream = stream;
			video.src = window.URL.createObjectURL( stream );

			SnapShot();
		}, 
		onError );
	}
}


function StopVideo()
{
	if ( navigator.getUserMedia )
	{
		videoStream.stop();
		video.pause();
	}
}


function ToggleVideo()
{
	if ( navigator.getUserMedia )
	{
		if ( video.paused )
		{
			video.play();
		}
		else
		{
			video.pause();
		}
	}
}


function SnapShot()
{
	window.requestAnimationFrame( SnapShot );
	
	effect.width = effect.width;

	ectx.drawImage( video, 0, 0 );

	// not grabbing actual size of the image
	dataArray = ectx.getImageData( 0, 0, effect.width, effect.height ); 

	// Four color attributes per pixel

	var theta  = 1.50;
	var gausianCoefficient = 1.0 / ( ( 2.0 * 3.14 ) * ( theta * theta ) );
	var guasianDenom = 2.0 * theta * theta; 

	var luminanceArray = new Array( dataArray.data.length / 4 );
	
	// First Pass
	for ( var i = 4; i < ( dataArray.data.length - 4 ); i += 4 )
	{
		var r 	= dataArray.data[i];
		var g  	= dataArray.data[i + 1];
		var b  	= dataArray.data[i + 2];

		var luminance = (r * 0.3) + (g * 0.59) + (b * 0.11);
		luminanceArray[i/4] = luminance;

		//console.log( Math.pow( gausianCoefficient, ( r*r + g*g + b*b ) / guasianDenom ) );
	}

	var runningAvg = 0.0;

	for ( var i = 8; i < ( dataArray.data.length - 4 ); i += 4 )
	{
		var r 	= dataArray.data[i];
		var g  	= dataArray.data[i + 1];
		var b  	= dataArray.data[i + 2];

		var currentIndexLum = i / 4;
		var luminance = luminanceArray[currentIndexLum];
		var prevLum = luminanceArray[currentIndexLum - 1];
		var nextLum = luminanceArray[ currentIndexLum + 1 ];

		var avgLum = ( prevLum + luminance + nextLum ) / 3.0; 

		runningAvg = ( runningAvg + avgLum ) / ( currentIndexLum + 1 )
		//console.log( runningAvg );

		//console.log( Math.pow( gausianCoefficient, ( r*r + g*g + b*b ) / guasianDenom ) );

		var lumThresh = 4.51;

		var newColorValue = 20;

		if ( Math.abs( luminance - prevLum ) > lumThresh || Math.abs( luminance - nextLum ) > lumThresh )
		{
			newColorValue = 0;
		}
		else
		{
			newColorValue = 255;
		}

		dataArray.data[i] 		= newColorValue;
		dataArray.data[i + 1] 	= newColorValue;
		dataArray.data[i + 2] 	= newColorValue;
		dataArray.data[i + 3] 	= 255; // Alpha
	}


	for ( var i = 8; i < ( dataArray.data.length - 4 ); i += 4 )
	{
		var r 	= dataArray.data[i];
		var g  	= dataArray.data[i + 1];
		var b  	= dataArray.data[i + 2];

		var prevR = dataArray.data[ i - 4 ];
		var nextR = dataArray.data[ i + 4 ];

		var spread = Math.abs( r - prevR ) + Math.abs( r - nextR );
		var newValue = 0;
		if ( spread > 20.0 )
		{
			newValue = 250.0;
		}
		//console.log( spread );

		dataArray.data[i] 		= newValue;
		dataArray.data[i + 1] 	= newValue;
		dataArray.data[i + 2] 	= newValue;
		dataArray.data[i + 3] 	= 255; // Alpha
	}
	

	ectx.putImageData( dataArray, 0, 0 );
}

//StartVideo();
*/