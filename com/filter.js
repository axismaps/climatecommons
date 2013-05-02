var filters = [];

function build_filters()
{
	var cats = [];
	for( var i = 0; i < stories.length; i++ )
	{
		if( $.inArray( stories[ i ].category, cats ) == -1 )
		{
			cats.push( stories[ i ].category );
		}
	}
	for( var j = 0; j < cats.length; j++ )
	{
		$( document.createElement( 'label' ) )
			.html( "&nbsp;" + cats[ j ].charAt( 0 ).toUpperCase() + cats[ j ].slice( 1 ) + "<br />" )
			.prepend(
				$( document.createElement( 'input' ) )
					.attr({
						"id" : cats[ j ],
						"type" : "checkbox",
						"checked" : "checked",
						"value" : cats[ j ]
					})
					.change( filter )
			)
			.appendTo( $( "#filter" ) );
	}
	$( "#filter" ).show();
	filters = cats;
}

function filter()
{
	filters = [];
	if( $( "#filter :checked" ).length == 0 ) $( "#filter input" ).attr( "checked", "checked" );
	$( "#filter :checked" ).each( function()
	{
		filters.push( $( this ).val() );
	});
	for( var i = 0; i < stories.length; i++ )
	{
		stories[ i ].marker.setVisible( check_filter( stories[ i ] ) );
	}
	set_story_viz( parseInt( $( ".dot.active" ).attr( "name" ), 10 ) );
}

function check_filter( story )
{
	if( filters.length == 0 ) return true;
	for( var i = 0; i < filters.length; i++ )
	{
		if( story.category == filters[ i ] ) return true;
	}
	return false;
}