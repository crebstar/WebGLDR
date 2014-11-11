
define( [ "require", "JQuery", "MathUtil", "Collections" ], function ( require, MathUtil, Collections ) {
  
	console.log( "Define called for GameWorld" );

    testWebWorkers();

	loadWebGLContext();
	loadShaders();
	setUpTriangle();
	renderLoop();

    return {}
});


function testWebWorkers()
{
    var dragonAsJSON = null;

    $.ajax(
    {
        async: false, 
        dataType : "text",
        url: "DataFiles/dragon.json",
        success: function( result ) 
        {
            console.log( "--- dragon.json has been loaded! --- " );
            dragonAsJSON = JSON.parse( result );

            var worker = new Worker( 'scripts/Demo/ParseJSON.js' );
            worker.postMessage( result );
            worker.addEventListener( 'message', function( event )
            {
                console.log( event.data );
            });

        }
    });
}


var canvas = null;
var webGLContext = null;
var shader_vertex;
var shader_fragment;
var SHADER_PROGRAM;
var TRIANGLE_FACES;
var TRIANGLE_VERTEX;
var PROJMATRIX;
var MOVEMATRIX;
var VIEWMATRIX;


  /*========================= SHADERS ========================= */
  /*jshint multistr: true */
var shader_vertex_source="\n\
attribute vec3 position; //the position of the point\n\
attribute vec3 color;  //the color of the point\n\
uniform mat4 Pmatrix;\n\
uniform mat4 Mmatrix;\n\
uniform mat4 Vmatrix;\n\
varying vec3 vColor;\n\
void main(void) { //pre-built function\n\
gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);\n\
vColor=color;\n\
}";


var shader_fragment_source="\n\
precision mediump float;\n\
\n\
\n\
\n\
varying vec3 vColor;\n\
void main(void) {\n\
gl_FragColor = vec4(vColor, 1.);\n\
}";


function loadWebGLContext()
{
	canvas = document.getElementById("DRCanvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	try
	{
		webGLContext = canvas.getContext( "webgl", { antialias: false } );
	} 
	catch ( error )
	{
        console.log( "Warning: Browser is not WebGL Compatible!" );
		alert( "Warning: Browser is not WebGL Compatible!" );
	}
}


function loadShaders()
{
	shader_vertex = compileShader(shader_vertex_source, webGLContext.VERTEX_SHADER, "VERTEX" );
 	shader_fragment = compileShader(shader_fragment_source, webGLContext.FRAGMENT_SHADER, "FRAGMENT" );

 	createShaderProgram( shader_vertex, shader_fragment );
 	linkShaderProgram();
}


function compileShader( source, type, typeString )
{
	var shader = webGLContext.createShader( type );
	webGLContext.shaderSource( shader, source );
	webGLContext.compileShader( shader );

	if ( !webGLContext.getShaderParameter(shader, webGLContext.COMPILE_STATUS ) ) 
	{
      alert("ERROR IN "+typeString+ " SHADER : " + webGLContext.getShaderInfoLog(shader));
      return false;
    }

    return shader;
}


function createShaderProgram( vertexShader, fragmentShader )
{
  	SHADER_PROGRAM = webGLContext.createProgram();
  	webGLContext.attachShader( SHADER_PROGRAM, shader_vertex );
  	webGLContext.attachShader( SHADER_PROGRAM, shader_fragment );
}


function linkShaderProgram()
{

  	webGLContext.linkProgram(SHADER_PROGRAM);

    var _color       = webGLContext.getAttribLocation(SHADER_PROGRAM, "color");
  	var _position    = webGLContext.getAttribLocation(SHADER_PROGRAM, "position");
    var _Pmatrix     = webGLContext.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Mmatrix     = webGLContext.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    var _Vmatrix     = webGLContext.getUniformLocation(SHADER_PROGRAM, "Vmatrix");

  	webGLContext.enableVertexAttribArray(_position);
    webGLContext.enableVertexAttribArray(_color);
  	webGLContext.useProgram(SHADER_PROGRAM);
}


function setUpTriangle()
{
    var triangle_vertex =
    [
        -1,-1,0,
        0,0,1,
        1,-1,0,
        1,1,0,
        1,1,0,
        1,0,0
    ];

    // Verts
    TRIANGLE_VERTEX = webGLContext.createBuffer();
    webGLContext.bindBuffer( webGLContext.ARRAY_BUFFER, TRIANGLE_VERTEX );
    webGLContext.bufferData( webGLContext.ARRAY_BUFFER,
    new Float32Array( triangle_vertex ),
    webGLContext.STATIC_DRAW );

    // Faces
    var triangle_faces = [0,1,2];
  	TRIANGLE_FACES= webGLContext.createBuffer();
  	webGLContext.bindBuffer( webGLContext.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES );
  	webGLContext.bufferData( webGLContext.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(triangle_faces),
    webGLContext.STATIC_DRAW);
}

var time_old = 0;

var animate = function( time ) 
{
    var dt = time - time_old;
    rotateZ(MOVEMATRIX, dt*0.005);
    rotateY(MOVEMATRIX, dt*0.004);
    rotateX(MOVEMATRIX, dt*0.003);
    time_old = time;

	var _position       = webGLContext.getAttribLocation(SHADER_PROGRAM, "position");
    var _color          = webGLContext.getAttribLocation(SHADER_PROGRAM, "color");
    var _Pmatrix        = webGLContext.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Mmatrix        = webGLContext.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    var _Vmatrix        = webGLContext.getUniformLocation(SHADER_PROGRAM, "Vmatrix");

    webGLContext.viewport(0.0, 0.0, canvas.width, canvas.height);
    webGLContext.clear( webGLContext.COLOR_BUFFER_BIT | webGLContext.DEPTH_BUFFER_BIT );

    webGLContext.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    webGLContext.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
    webGLContext.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    webGLContext.vertexAttribPointer(_position, 3, webGLContext.FLOAT, false,4*(3+3),0);
    webGLContext.vertexAttribPointer(_color, 3, webGLContext.FLOAT, false,4*(3+3),3*4);

    webGLContext.bindBuffer( webGLContext.ARRAY_BUFFER, TRIANGLE_VERTEX );
    webGLContext.bindBuffer( webGLContext.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);

    webGLContext.drawElements( webGLContext.TRIANGLES, 3, webGLContext.UNSIGNED_SHORT, 0);

    webGLContext.flush();

    window.requestAnimationFrame( animate );
};


function renderLoop()
{
    /*========================= DRAWING ========================= */
    webGLContext.clearColor( 0.0, 0.0, 0.0, 0.0 );
    webGLContext.enable( webGLContext.DEPTH_TEST );
    webGLContext.depthFunc(webGLContext.LEQUAL );

    webGLContext.clearDepth( 1.0 );

    PROJMATRIX = get_projection( 40, canvas.width / canvas.height, 1, 100 );
    MOVEMATRIX = get_I4();
    VIEWMATRIX = get_I4();
    translateZ( VIEWMATRIX, -10 );

    animate( 0 );
}
























