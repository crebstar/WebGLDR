
define( ["require", "MathUtil"], function ( require, MathUtil ) {
  
	console.log( "Define called for GameWorld" );

	loadWebGLContext();
	loadShaders();
	setUpTriangle();
	renderLoop();

    return {}
});


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
  	webGLContext.attachShader(SHADER_PROGRAM, shader_vertex);
  	webGLContext.attachShader(SHADER_PROGRAM, shader_fragment);
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
	/*========================= THE TRIANGLE ========================= */
 	//POINTS :
    var triangle_vertex =
    [
        -1,-1,0,
        0,0,1,
        1,-1,0,
        1,1,0,
        1,1,0,
        1,0,0
    ];

    TRIANGLE_VERTEX = webGLContext.createBuffer();
    webGLContext.bindBuffer( webGLContext.ARRAY_BUFFER, TRIANGLE_VERTEX );
    webGLContext.bufferData( webGLContext.ARRAY_BUFFER,
    new Float32Array( triangle_vertex ),
    webGLContext.STATIC_DRAW );

    //FACES :
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


function get_projection(angle, a, zMin, zMax) 
 {
    var tan=Math.tan( degToRad(0.5*angle) ),
        A=-(zMax+zMin)/(zMax-zMin),
          B=(-2*zMax*zMin)/(zMax-zMin);

    return [
      .5/tan, 0 ,   0, 0,
      0, .5*a/tan,  0, 0,
      0, 0,         A, -1,
      0, 0,         B, 0
    ];
}


function get_I4() 
{
    return [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1];
}


function rotateX(m, angle)
{
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv1=m[1], mv5=m[5], mv9=m[9];
    m[1]=m[1]*c-m[2]*s;
    m[5]=m[5]*c-m[6]*s;
    m[9]=m[9]*c-m[10]*s;

    m[2]=m[2]*c+mv1*s;
    m[6]=m[6]*c+mv5*s;
    m[10]=m[10]*c+mv9*s;
}

    
function rotateY(m, angle)
{
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv0=m[0], mv4=m[4], mv8=m[8];
    m[0]=c*m[0]+s*m[2];
    m[4]=c*m[4]+s*m[6];
    m[8]=c*m[8]+s*m[10];

    m[2]=c*m[2]-s*mv0;
    m[6]=c*m[6]-s*mv4;
    m[10]=c*m[10]-s*mv8;
}


function rotateZ(m, angle)  
{
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv0=m[0], mv4=m[4], mv8=m[8];
    m[0]=c*m[0]-s*m[1];
    m[4]=c*m[4]-s*m[5];
    m[8]=c*m[8]-s*m[9];

    m[1]=c*m[1]+s*mv0;
    m[5]=c*m[5]+s*mv4;
    m[9]=c*m[9]+s*mv8;
}


function translateZ(m, t)
{
    m[14]+=t;
}


function degToRad(angle)
{
    return( angle*Math.PI/180 );
}





















