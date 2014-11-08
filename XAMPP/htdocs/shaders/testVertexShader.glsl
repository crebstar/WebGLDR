
attribute vec3 position; 
attribute vec3 color;  
uniform mat4 Pmatrix;
uniform mat4 Mmatrix;
uniform mat4 Vmatrix;
varying vec3 vColor;

void main(void) 
{ 
	gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
	vColor=color;
}