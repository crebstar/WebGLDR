
define( [ "require", "GLMatrix"], function ( require, GLMatrix ) {
    //Do setup work here

    var MathUtil = {};

    return MathUtil;
});


function RangeMapFloat( inRangeStart, inRangeEnd, outRangeStart, outRangeEnd, inValue )
{
	var outValue;

	// Handle the zero edge case
	if ( inRangeStart === inRangeEnd  ) {
		return 0.50 * ( outRangeStart + outRangeEnd );
	}

	outValue = inValue;

	outValue = outValue - inRangeStart;
	outValue = outValue / ( inRangeEnd - inRangeStart );
	outValue = outValue * ( outRangeEnd - outRangeStart );
	outValue = outValue + outRangeStart;

	return outValue;

}



