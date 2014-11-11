
attribute vec3 a_position; 
attribute vec3 a_color;  

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 vColor;

void main(void) 
{ 
	gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4( a_position, 1.0 );
	//vec3 testColor = vec3( 1.0, 0.0, 1.0 );
	vColor = a_color;
}