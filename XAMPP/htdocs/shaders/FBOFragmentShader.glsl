precision mediump float;

varying vec3 vColor;
varying vec2 vTexCoords;

uniform sampler2D s_diffuseTexture;

void main(void) 
{	
	vec4 texel = texture2D( s_diffuseTexture, vTexCoords );
	vec4 normalizedTexel = normalize( texel );
	gl_FragColor = texel;
	//gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );
}