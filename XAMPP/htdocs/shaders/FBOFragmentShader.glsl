precision mediump float;

varying vec3 vColor;
varying vec2 vTexCoords;

uniform sampler2D s_diffuseTexture;

void main(void) 
{	
	//gl_FragColor = texture2D( s_diffuseTexture, vTexCoords );
	gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );
}