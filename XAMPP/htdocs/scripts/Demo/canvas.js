


/*
var canvas 	= document.getElementById( 'canvas' );
var ctx 	= canvas.getContext( '2d' );


//fillRect( x, y, width, height );
ctx.fillRect( 0, 0, 800, 600 );

ctx.fillStyle = '#0000FF';
ctx.fillRect( 50, 50, 700, 500 );

ctx.lineWidth = 15;

ctx.strokeStyle = 'red';

ctx.strokeRect( 100, 100, 200, 100 );

// Clear a rect ( has high overhead )
ctx.clearRect( 100, 100, 200, 100 );


// ---- Grid Lines ------- //
for ( var x = 0.5; x < 500; x += 10 )
{
	ctx.moveTo( x, 0 );
	ctx.lineTo( x, 375 );
}


for ( var y = 0.5; y < 375; y += 10 )
{
	ctx.moveTo( 0, y );
	ctx.lineTo( 500, y );
}

ctx.lineWidth = 1;
ctx.strokeStyle = "WHITE";
ctx.stroke();
// ---- Grid Lines ------- //


// ------ Draw a green circle ------- //
ctx.beginPath();
ctx.arc( 400, 300, 70, 0 , 2 * Math.PI, false );
ctx.fillStyle = 'green';
ctx.fill();
ctx.lineWidth = 5;
ctx.strokeStyle = '#003300'
ctx.stroke();
// ------ Draw a green circle ------- //


// ------- Draw an image ------------- //
var img = new Image();
img.src = 'http://gametheorylabs.com/img/Dog_Flip_SS.png';
*/


/*
setTimeout( function() 
{
	ctx.drawImage( img, 0, 0, 276, 276, 200, 200, 276, 276 );

}, 300 );

*/

/*
setTimeout( function()
{
	ctx.save();
	ctx.scale( 2, 2 );
	ctx.drawImage( img, 0, 0, 276, 276, 0, 0, 276, 276 );
	ctx.restore();
}, 2000 );
*/