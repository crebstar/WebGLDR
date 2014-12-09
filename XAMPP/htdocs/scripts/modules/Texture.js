
define( [ "CBRenderer", "Material" ], function()
{

	console.log( "Texture.js has finished loading" );
});


var INVALID_TEXTURE_ID = -1;
var TEXTURE_FILE_PATH = 'art/textures/'

var Texture = function()
{
	this.m_textureID 		= INVALID_TEXTURE_ID;
}


Texture.prototype =
{
	constructor: Texture,


	loadTextureFromURL : function( imageURL, material )
	{
		var sharedRenderer = CBRenderer.getSharedRenderer();

		var image = new Image();

		image.src = TEXTURE_FILE_PATH + imageURL;
		image.webglTexture = false;

		image.onload = function ( event )
		{
			var texture = sharedRenderer.renderer.createTexture();

			sharedRenderer.renderer.pixelStorei( sharedRenderer.renderer.UNPACK_FLIP_Y_WEBGL, true );

			sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, texture );

			sharedRenderer.renderer.texImage2D( sharedRenderer.renderer.TEXTURE_2D,
			 	0,
			  	sharedRenderer.renderer.RGBA,
			   	sharedRenderer.renderer.RGBA,
			    sharedRenderer.renderer.UNSIGNED_BYTE, image );

			sharedRenderer.renderer.texParameteri( sharedRenderer.renderer.TEXTURE_2D, sharedRenderer.renderer.TEXTURE_MAG_FILTER, sharedRenderer.renderer.LINEAR );

	
			//sharedRenderer.renderer.texParameteri( sharedRenderer.renderer.TEXTURE_2D, sharedRenderer.renderer.TEXTURE_MIN_FILTER, sharedRenderer.renderer.LINEAR );
			sharedRenderer.renderer.texParameteri( sharedRenderer.renderer.TEXTURE_2D, sharedRenderer.renderer.TEXTURE_MIN_FILTER, sharedRenderer.renderer.LINEAR_MIPMAP_NEAREST );
			sharedRenderer.renderer.generateMipmap( sharedRenderer.renderer.TEXTURE_2D );

			sharedRenderer.renderer.bindTexture( sharedRenderer.renderer.TEXTURE_2D, null );

			image.webglTexture = texture;

			//console.log( "ONLOAD BEING CALLED FROM loadTextureFromURL" );
			//console.log( image.webglTexture );

			material.setDiffuseTexture( image.webglTexture );
		};
	}
}


/*
	  var get_texture=function(image_URL){


    var image=new Image();

    image.src=image_URL;
    image.webglTexture=false;


    image.onload=function(e) {



      var texture=GL.createTexture();

      GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);


      GL.bindTexture(GL.TEXTURE_2D, texture);

      GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);

      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);

      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);

      GL.bindTexture(GL.TEXTURE_2D, null);

      image.webglTexture=texture;
    };

    return image;
  };

*/

