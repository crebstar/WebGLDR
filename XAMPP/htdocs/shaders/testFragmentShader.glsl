
precision mediump float;

varying vec3 vColor;
varying vec3 vNormal;
varying vec2 vTexCoords;

uniform sampler2D s_diffuseTexture;

void main(void) 
{
	//gl_FragColor = vec4( vNormal, 1. );
	//texture2D(sampler, vUV)
	gl_FragColor = texture2D( s_diffuseTexture, vTexCoords );
}