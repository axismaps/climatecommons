function start_search()
{
	if( $( this ).val() == "Search the news..." )
	{
		$( this ).val( "" );
	}
	else
	{
		text_search();
	}
	
	$( "#close" ).show();
	
	$( this ).keyup( text_search );
	$( this ).focusout( close_search );
	
}

function text_search( e )
{
	var q = $( "#search" ).val().toLowerCase();

	if( q.length < 3 ){
		$( "#results" ).slideUp();
		return false;	
	}
	
	if( e )
	{
		if( e.which == 40 )
		{
			if( $( ".result.hover" ).length == 0 )
			{
				$( ".result:first" ).addClass( "hover" );
			}
			else
			{
				$( ".result.hover" ).removeClass( "hover" ).next().addClass( "hover" );
			}
			return false;
		}
		if( e.which == 38 )
		{
			if( $( ".result.hover" ).length == 0 )
			{
				$( ".result:last" ).addClass( "hover" );
			}
			else
			{
				$( ".result.hover" ).removeClass( "hover" ).prev().addClass( "hover" );
			}
			return false;
		}
		if( e.which == 13 )
		{
			$( ".result.hover" ).click();
			return false;
		}
	}
	
	$( "#results" ).empty();
	var i = 0;
	var j = 0;
	while( i < 10 && j < stories.length )
	{
		if( ( stories[ j ].title.toLowerCase().search( q ) != -1 || stories[ j ].text.toLowerCase().search( q ) != -1 ) && check_filter( stories[ j ] ) )
		{
			$( "#results" ).append(
				$( document.createElement( "div" ) )
					.addClass( "result" )	
					.html( stories[ j ].title )
					.attr( "name", j )
					.prepend(
						$( document.createElement( 'div' ) )
							.addClass( "source" )
							.html( stories[ j ].source )
					)
					.click( function()
					{
						new google.maps.event.trigger( stories[ $( this ).attr( "name" ) ].marker, 'click' );
						$( "#results" ).slideUp();
					})
			);
			i++;
		}
		j++;
	}
	if( i == 0 ) $( "#results" ).html( "<b>No results found<b>" );
	if( q.length == 3 || !e ) $( "#results" ).slideDown();
}

function close_search()
{		
	$( "#results" ).slideUp();
	$( "#search" ).unbind( "keyup" );
	if( $( "#search" ).val() == "" || $( this ).attr( "id" ) == "close" )
	{
		$( "#search" ).val( "Search the news..." );
		$( "#close" ).hide();
	}
}