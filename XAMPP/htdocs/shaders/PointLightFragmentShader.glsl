#extension GL_EXT_draw_buffers : require
precision highp float;

varying vec3 vNormal;
varying vec4 vWorldPosition;

uniform float u_inverseScreenWidth;
uniform float u_inverseScreenHeight;

uniform sampler2D s_renderTargetTwo; // Normals
uniform sampler2D s_renderTargetThree; // Positions

void main(void) 
{
	vec2 inverseScreenCoords 	= vec2( u_inverseScreenWidth, u_inverseScreenHeight );
	vec2 textureCoords  		= gl_FragCoord.xy * inverseScreenCoords;

	vec4 renderTargetTwo 		= texture2D( s_renderTargetTwo, textureCoords );
	vec4 renderTargetThree 		= texture2D( s_renderTargetThree, textureCoords );

	vec3 normalData = renderTargetTwo.xyz;
	vec3 worldPositionData = renderTargetThree.xyz;
	
	gl_FragData[0] = vec4( normalData, 1.0 );
	gl_FragData[1] = vec4( worldPositionData, 1.0 );
}