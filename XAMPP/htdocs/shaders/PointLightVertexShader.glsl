
attribute vec3 a_position; 
 
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

uniform vec3 u_cameraPosition;

varying vec4 vWorldPosition;
varying vec3 vCameraPosition;

void main(void) 
{ 
	vec4 positionAsVec4 = vec4( a_position, 1.0 );
	
	gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * positionAsVec4;
	vWorldPosition = u_modelMatrix * positionAsVec4;

	vCameraPosition = u_cameraPosition;
}