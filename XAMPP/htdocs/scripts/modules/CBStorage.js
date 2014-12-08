define( [], function() 
{
	console.log( "CBStorage has finished loading" );
	InitializeStorage();
});


function InitializeStorage()
{
	var sharedStorage = CBStorage.getSharedStorage();
	sharedStorage.initializeLocalAndSessionStorage();
}


var CBStorage = (function()
{
	var storageManager 		= null;

	function StorageManager()
	{
		this.initializeLocalAndSessionStorage = function()
		{
			localStorage 	= window.localStorage;
			sessionStorage 	= window.sessionStorage;
		}


		this.setSessionValueForKey = function( key, value )
		{
			var bStorageSucessful = false;
			
			if ( sessionStorage !== null )
			{
				var valueAsJSONString = JSON.stringify( value );
				sessionStorage.setItem( key , valueAsJSONString );
			}

			return bStorageSucessful;
		}


		this.setLocalStorageValueForKey = function( key, value )
		{
			var bStorageSucessful = false;

			if ( localStorage !== null )
			{
				var valueAsJSONString = JSON.stringify( value );
				localStorage.setItem( key, valueAsJSONString );
			}

			return bStorageSucessful;
		}


		this.getSessionValueForKey = function( key )
		{
			var valueToReturn = null;

			if ( sessionStorage !== null )
			{
				var valueFromSession = sessionStorage.getItem( key );
				if ( valueFromSession !== null )
				{
					valueToReturn = JSON.parse( valueFromSession );
				}
			}

			return valueToReturn;
		}


		this.getLocalStorageValueForKey = function( key )
		{
			var valueToReturn = null;

			if ( localStorage !== null )
			{
				var valueFromLocalStorage = localStorage.getItem( key );
				if ( valueFromLocalStorage !== null )
				{
					valueToReturn = JSON.parse( valueFromLocalStorage );
				}
			}

			return valueToReturn;
		}

		var sessionStorage  	= null;
		var localStorage   		= null;
	}

	return {
		getSharedStorage : function()
		{
			if ( storageManager == null )
			{
				storageManager = new StorageManager();
				storageManager.constructor = null;
			}

			return storageManager;
		}
	};
})();
