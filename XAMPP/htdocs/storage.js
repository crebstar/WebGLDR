// FileReader
// Can read text, files, images, and binary

e.stopProprigation();
e.preventDefault();


// Initialize
var ls = window.localStorage;
var ss = window.sessionStorage;

// Add
ls.setItem( key, JSON.stringify( value ) );

// Update
ls.setItem( key, JSON.stringify( value ) );

// Get
var val = null;
try
{
	JSON.parse( ls.getItem( key ) );
}
catch( e )
{

}


// Delete
ls.removeItem( key );

// Clear
ls.clear();