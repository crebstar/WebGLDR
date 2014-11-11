
self.addEventListener( 'message', function( event )
{
	var textToJSONConversion = null;

	if ( event.data != null )
	{
		textToJSONConversion = JSON.parse( event.data );
		//textToJSONConversion = JSON.parse( event.textData );
	}

	if ( textToJSONConversion != null )
	{
		self.postMessage( textToJSONConversion );
	}
	else
	{
		self.postMessage( 'Could not parse TextData into JSON format' );
	}

}, false );