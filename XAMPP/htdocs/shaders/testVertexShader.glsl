
attribute vec3 position; 
attribute vec3 color;  

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec3 vColor;

void main(void) 
{ 
	gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4( position, 1. );
	vColor = color;
}