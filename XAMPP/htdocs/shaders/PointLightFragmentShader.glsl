#extension GL_EXT_draw_buffers : require
precision highp float;

// Point Light Data
uniform vec3  u_lightWorldPosition;
uniform vec4  u_lightColorAndBrightness;
uniform float u_lightOuterRadius;
uniform float u_lightInnerRadius;

uniform float u_inverseScreenWidth;
uniform float u_inverseScreenHeight;

uniform sampler2D s_renderTargetTwo; // Normals
uniform sampler2D s_renderTargetThree; // Positions

varying vec3 vNormal;
varying vec4 vWorldPosition;


float smoothNumber( float numToSmooth ) 
{
	float smoothedNum = ( ( 3.0 * numToSmooth * numToSmooth ) - ( 2.0 * ( numToSmooth * numToSmooth * numToSmooth ) ) );
	return smoothedNum;
}


void main( void ) 
{
	vec2 inverseScreenCoords 	= vec2( u_inverseScreenWidth, u_inverseScreenHeight );
	vec2 textureCoords  		= gl_FragCoord.xy * inverseScreenCoords;

	vec4 renderTargetTwo 		= texture2D( s_renderTargetTwo, textureCoords );
	vec4 renderTargetThree 		= texture2D( s_renderTargetThree, textureCoords );

	vec3 normalInWorldSpace = renderTargetTwo.xyz;
	vec3 worldPositionData = renderTargetThree.xyz;

	vec3 differenceVectorLightToPoint = u_lightWorldPosition - worldPositionData;
	vec3 differenceVectorLightToPointNormalized = normalize( differenceVectorLightToPoint );
	vec3 differenceVectorPointToLightNormalized = differenceVectorLightToPointNormalized * -1.0;

	float distanceFromLightToPoint = length( differenceVectorLightToPoint );

	// Fraction Brightness Due To Distance
	float fractionBrightnessDueToDistance = ( u_lightOuterRadius - distanceFromLightToPoint ) / ( u_lightOuterRadius - u_lightInnerRadius );
	fractionBrightnessDueToDistance = clamp( fractionBrightnessDueToDistance * u_lightColorAndBrightness.a , 0.0, 1.0 );
	fractionBrightnessDueToDistance = smoothNumber( fractionBrightnessDueToDistance );

	// Diffuse Lighting
	vec3 diffuseColor = vec3( 0.0, 0.0, 0.0 );
	float diffuseDotResult = dot( normalInWorldSpace, differenceVectorLightToPointNormalized );
	diffuseColor.x = clamp( ( diffuseDotResult * u_lightColorAndBrightness.x * fractionBrightnessDueToDistance ), 0.0, 1.0 );
	diffuseColor.y = clamp( ( diffuseDotResult * u_lightColorAndBrightness.y * fractionBrightnessDueToDistance ), 0.0, 1.0 );
	diffuseColor.z = clamp( ( diffuseDotResult * u_lightColorAndBrightness.z * fractionBrightnessDueToDistance ), 0.0, 1.0 );

	gl_FragData[0] = vec4( diffuseColor, 1.0 );
	gl_FragData[1] = vec4( worldPositionData, 1.0 );
}