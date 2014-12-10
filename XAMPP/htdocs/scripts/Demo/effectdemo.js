
console.log( "effectdemo.js has loaded" );

/*
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
*/


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

var buffCreated = false;
var bufSize = null;
var bufIn = null;
var bufOut = null;


function SnapShot()
{
	window.requestAnimationFrame( SnapShot );
	
	effect.width = effect.width;

	ectx.drawImage( video, 0, 0 );

	// not grabbing actual size of the image
	dataArray = ectx.getImageData( 0, 0, effect.width, effect.height ); 

	// Four color attributes per pixel
	/*
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
		

		dataArray.data[i] 		= newValue;
		dataArray.data[i + 1] 	= newValue;
		dataArray.data[i + 2] 	= newValue;
		dataArray.data[i + 3] 	= 255; // Alpha
	}
	*/
	if ( !buffCreated )
	{
		bufSize = effect.width * effect.height * 4;
		bufIn = webCLContext.createBuffer(WebCL.MEM_READ_ONLY, bufSize);
    	bufOut = webCLContext.createBuffer(WebCL.MEM_WRITE_ONLY, bufSize);
	}

	 // Create kernel and set arguments
    var kernel = program.createKernel ("clDesaturate");
    kernel.setArg (0, bufIn);
    kernel.setArg (1, bufOut);
    kernel.setArg (2, new Uint32Array([ effect.width ]));
    kernel.setArg (3, new Uint32Array([ effect.height ]));

    // Create command queue using the first available device
    var cmdQueue = webCLContext.createCommandQueue (device);

    // Write the buffer to OpenCL device memory
    cmdQueue.enqueueWriteBuffer (bufIn, false, 0, bufSize, dataArray.data);

    // Init ND-range 
    var localWS = [16,4];  
    var globalWS = [Math.ceil ( effect.width / localWS[0]) * localWS[0], 
                    Math.ceil ( effect.height / localWS[1]) * localWS[1]];
    // Execute (enqueue) kernel
    cmdQueue.enqueueNDRangeKernel(kernel, 2, null, 
                                  globalWS, localWS);

    // Read the result buffer from OpenCL device
    cmdQueue.enqueueReadBuffer (bufOut, false, 0, bufSize, dataArray.data);
    cmdQueue.finish(); //Finish all the operations

	ectx.putImageData( dataArray, 0, 0 );
}

/*
	// Setup WebCL context using the default device
    var ctx = webcl.createContext();

    // Setup buffers
    var imgSize = width * height;
    output.innerHTML += "<br>Image size: " + imgSize + " pixels ("
                     + width + " x " + height + ")";
    var bufSize = imgSize * 4; // size in bytes
    output.innerHTML += "<br>Buffer size: " + bufSize + " bytes";
    
    var bufIn = ctx.createBuffer (WebCL.MEM_READ_ONLY, bufSize);
    var bufOut = ctx.createBuffer (WebCL.MEM_WRITE_ONLY, bufSize);

     // Create and build program
    var kernelSrc = loadKernel("clProgramDesaturate");
    var program = ctx.createProgram(kernelSrc);
    var device = ctx.getInfo(WebCL.CONTEXT_DEVICES)[0];
    try {
      program.build ([device], "");
    } catch(e) {
      alert ("Failed to build WebCL program. Error "
             + program.getBuildInfo (device, 
                                            WebCL.PROGRAM_BUILD_STATUS)
             + ":  " + program.getBuildInfo (device, 
                                                    WebCL.PROGRAM_BUILD_LOG));
      throw e;
    }

    // Create kernel and set arguments
    var kernel = program.createKernel ("clDesaturate");
    kernel.setArg (0, bufIn);
    kernel.setArg (1, bufOut);
    kernel.setArg (2, new Uint32Array([width]));
    kernel.setArg (3, new Uint32Array([height]));

    // Create command queue using the first available device
    var cmdQueue = ctx.createCommandQueue (device);

    // Write the buffer to OpenCL device memory
    cmdQueue.enqueueWriteBuffer (bufIn, false, 0, bufSize, pixels.data);

    // Init ND-range 
    var localWS = [16,4];  
    var globalWS = [Math.ceil (width / localWS[0]) * localWS[0], 
                    Math.ceil (height / localWS[1]) * localWS[1]];
    // Execute (enqueue) kernel
    cmdQueue.enqueueNDRangeKernel(kernel, 2, null, 
                                  globalWS, localWS);

    // Read the result buffer from OpenCL device
    cmdQueue.enqueueReadBuffer (bufOut, false, 0, bufSize, pixels.data);
    cmdQueue.finish (); //Finish all the operations
    
    canvasImgCtx.putImageData (pixels, 0, 0);

*/

var webCLContext = null;    
var kernelSrc = null;
var program = null;
var device = null;


function loadKernel(id){
  var kernelElement = document.getElementById(id);
  var kernelSource = kernelElement.text;
  if (kernelElement.src != "") {
      var mHttpReq = new XMLHttpRequest();
      mHttpReq.open("GET", kernelElement.src, false);
      mHttpReq.send(null);
      kernelSource = mHttpReq.responseText;
  } 
  return kernelSource;
}


function SetUpWebCL()
{
	webCLContext = webcl.createContext();
	kernelSrc = loadKernel("clProgramDesaturate");
	program = webCLContext.createProgram(kernelSrc);
	device = webCLContext.getInfo(WebCL.CONTEXT_DEVICES)[0];

	try {
      program.build([device], "");
    } catch(e) {
      alert ("Failed to build WebCL program. Error "
             + program.getBuildInfo (device, 
                                            WebCL.PROGRAM_BUILD_STATUS)
             + ":  " + program.getBuildInfo (device, 
                                                    WebCL.PROGRAM_BUILD_LOG));
      throw e;
    }
}

SetUpWebCL();

StartVideo();

