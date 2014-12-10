#extension GL_EXT_draw_buffers : require
precision highp float;

varying vec3 vColor;
varying vec3 vNormal;
varying vec2 vTexCoords;
varying vec4 vWorldPosition;

uniform sampler2D s_diffuseTexture;

void main(void) 
{
	vec3 normalizedInterpolatedNormal = normalize( vNormal );

	vec4 renderTargetOne 	= texture2D( s_diffuseTexture, vTexCoords );
	vec4 renderTargetTwo 	= vec4( normalizedInterpolatedNormal , 1.00 );
	vec4 renderTargetThree 	= vec4( vWorldPosition.x, vWorldPosition.y, vWorldPosition.z, 1.00 );

	gl_FragData[0] = renderTargetOne;
	gl_FragData[1] = renderTargetTwo;
	gl_FragData[2] = renderTargetThree;
}