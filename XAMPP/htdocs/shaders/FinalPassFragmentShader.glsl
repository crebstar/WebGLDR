
precision mediump float;

uniform float u_inverseScreenWidth;
uniform float u_inverseScreenHeight;

uniform sampler2D s_renderTargetOne; 	// Diffuse
uniform sampler2D s_renderTargetTwo; 	// Normals
uniform sampler2D s_renderTargetFour; 	// Accumulated Diffuse Lighting
uniform sampler2D s_renderTargetFive; 	// Accumulated Specular Lighting


void main(void) 
{
	vec2 inverseScreenCoords = vec2( u_inverseScreenWidth, u_inverseScreenHeight );
	vec2 texCoords = gl_FragCoord.xy * inverseScreenCoords;

	vec4 renderTargetOne  			= texture2D( s_renderTargetOne, texCoords );
	vec4 renderTargetTwo 			= texture2D( s_renderTargetTwo, texCoords );
	vec4 renderTargetFour 			= texture2D( s_renderTargetFour, texCoords );
	vec4 renderTargetFive 			= texture2D( s_renderTargetFive, texCoords );

	vec3 diffuseColor 				= renderTargetOne.xyz;
	vec3 normalsWorldSpace 			= renderTargetTwo.xyz;
	vec3 accumulatedDiffuseLight 	= renderTargetFour.xyz;
	vec3 accumulatedSpecularLight 	= renderTargetFive.xyz;

	vec3 ambientGlobalLight 		= vec3( 0.065, 0.065, 0.065 );

	vec3 finalColor = ( diffuseColor * accumulatedDiffuseLight + ( diffuseColor * ambientGlobalLight ) );

	
	gl_FragColor = vec4( finalColor, 1.0 );

	//gl_FragColor = vec4( accumulatedSpecularLight, 1.0 );
}