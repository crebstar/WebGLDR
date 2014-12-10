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

varying vec4 vWorldPosition;
varying vec3 vCameraPosition;


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

	vec3 normalInWorldSpace 	= renderTargetTwo.xyz;
	vec3 worldPositionData 		= renderTargetThree.xyz;

	vec3 differenceVectorLightToPoint = u_lightWorldPosition - worldPositionData;
	
	//vec3 differenceVectorLightToPointNormalized = normalize( differenceVectorLightToPoint );
	float lengthOfDifVectorLToP = length( differenceVectorLightToPoint );
	vec3 differenceVectorLightToPointNormalized = lengthOfDifVectorLToP == 0.0 ? vec3( 0.0, 1.0, 0.0 ) : differenceVectorLightToPoint / lengthOfDifVectorLToP;
	vec3 differenceVectorPointToLightNormalized = differenceVectorLightToPointNormalized * -1.0;

	float distanceFromLightToPoint = length( differenceVectorLightToPoint );

	// Fraction Brightness Due To Distance
	float fractionBrightnessDueToDistance = ( u_lightOuterRadius - distanceFromLightToPoint ) / ( u_lightOuterRadius - u_lightInnerRadius );
	fractionBrightnessDueToDistance = clamp( fractionBrightnessDueToDistance * u_lightColorAndBrightness.a , 0.0, 1.0 );
	fractionBrightnessDueToDistance = smoothNumber( fractionBrightnessDueToDistance );

	// ==== Diffuse Lighting ==== //
	vec3 diffuseColor = vec3( 0.0, 0.0, 0.0 );
	float diffuseDotResult = dot( normalInWorldSpace, differenceVectorLightToPointNormalized );
	diffuseColor.x = clamp( ( diffuseDotResult * u_lightColorAndBrightness.x * fractionBrightnessDueToDistance ), 0.0, 1.0 );
	diffuseColor.y = clamp( ( diffuseDotResult * u_lightColorAndBrightness.y * fractionBrightnessDueToDistance ), 0.0, 1.0 );
	diffuseColor.z = clamp( ( diffuseDotResult * u_lightColorAndBrightness.z * fractionBrightnessDueToDistance ), 0.0, 1.0 );

	// ==== Specular ( Hardcoded until WebGL importer is finished ) ==== //
	vec3 specularResult = vec3( 0.0, 0.0, 0.0 );

	// Handle the case where the normal is 0,0,0 ( Black screen pixels )
	// The diffuseDotResult will always be zero when the normal render target is a black pixel
	if ( diffuseDotResult > 0.0 )
	{
		float specularLevel = 0.35;
		float specularPower = 32.0;
		vec3 specularColor = vec3( 1.0, 1.0, 1.0 );
		vec3 specular = vec3( 0.0, 0.0, 0.0 );
		
		vec3 differenceVectorWorldToCamera = worldPositionData - vCameraPosition;
		vec3 normalizedDifferenceVectorWorldToCamera = normalize( differenceVectorWorldToCamera );
		vec3 idealReflection = reflect( normalizedDifferenceVectorWorldToCamera, normalInWorldSpace );
		vec3 normalizedIdealReflection = normalize( idealReflection );
		
		float specDotResult = dot( normalizedIdealReflection, differenceVectorLightToPointNormalized );
		float clampedSpecDotResult = clamp( specDotResult, 0.0, 1.0 );
		float specPower = pow( clampedSpecDotResult, 1.0 + specularPower ); 
		specularResult.x = ( specPower * specularLevel * fractionBrightnessDueToDistance );
		specularResult.y = ( specPower * specularLevel * fractionBrightnessDueToDistance );
		specularResult.z = ( specPower * specularLevel * fractionBrightnessDueToDistance );
	}
	
	// ==== Final Output ==== //
	gl_FragData[0] = vec4( diffuseColor, 1.0 );
	gl_FragData[1] = vec4( specularResult , 1.0 );
}