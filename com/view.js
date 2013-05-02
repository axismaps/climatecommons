var ipad = navigator.userAgent.match( /iPad/i ) != null;
var ie8 = $.browser.msie && parseInt( $.browser.version, 10 ) === 8;

if ( ipad ){
	$( document.head ).append( '<style>#stories .story.closed:hover{padding-right: 15px;left: 0;}#legend select{font-size: 13px}#legend{max-height:450px}</style>' );
	var mouseEvent, touchTimer;
	$(document).mousedown( function(e){ mouseEvent = e} );
}

function init_events()
{
	$( window ).resize( resize );
	
	$( ".arrow" ).click( function()
	{
		if( $( this ).hasClass( "inactive" ) ) return false;
		
		if( $( this ).attr( "id" ) == "next_page" )
		{
			set_story_viz( parseInt( $( ".dot.active" ).next().attr( "name" ), 10 ) );
		}
		else
		{
			set_story_viz( parseInt( $( ".dot.active" ).prev().attr( "name" ), 10 ) );
		}
		dot_viz();
	});
	
	$( ".dot" ).live( "click", function()
	{
		if( $( this ).hasClass( "active" ) ) return false;
		while( parseInt( $( this ).attr( "name" ) ) > parseInt( $( ".dot.active" ).attr( "name" ) ) )
		{
			$( "#next_page" ).click();
		}
		while( parseInt( $( this ).attr( "name" ) ) < parseInt( $( ".dot.active" ).attr( "name" ) ) )
		{
			$( "#prev_page" ).click();
		}	
	});
	
	$( "#filter_button" ).toggle( function()
	{
		$( "#filter_button" ).addClass( "open" );
		$( "#stories" ).animate( { "height" : "-=" + ( $( "#filter" ).height() + 20 ) + "px" } );
	}, function()
	{
		$( "#filter_button" ).removeClass( "open" );
		$( "#stories" ).animate( { "height" : "+=" + ( $( "#filter" ).height() + 20 ) + "px" } );
	});
	
	$( "#story_submit" ).click( function()
	{
		$.fancybox.open({
			"href" : "submit.html",
			"type" : "iframe",
			"autoSize" : false,
			"width" : 450,
			"height" : 480,
			"padding" : 0
		});
		return false;
	});
	
	$( "#about_map" ).click( function()
	{
		$.fancybox.open({
			"href" : "about.html",
			"type" : "iframe",
			"padding" : 0
		});
		return false;
	});
	
	$( "#search" ).focus( start_search );
	$( "#close" ).click( close_search );
	$( "#hide" ).live( "click", hide_legend );
}

function resize()
{
	$( "#map" ).width( $( window ).width() - 285 );
	$( "#map" ).height( $( window ).height() - 205 );
	$( "#stories" ).height( $( window ).height() - 205 );
}

function position_legend()
{
	var legend = document.getElementById( "legend" );
	legend.index = 0;
	map.controls[ google.maps.ControlPosition.TOP_LEFT ].clear();
	map.controls[ google.maps.ControlPosition.TOP_LEFT ].push( legend );
}

function hide_legend()
{
	if( parseInt( $( "#legend" ).css( "margin-left" ) ) < 0 )
	{
		$( "#legend" ).css( "margin-left", 0 );
		$( "#hide" ).css( "background-image", "url(images/left.png)" );
		position_legend();
	}
	else
	{
		$( "#legend" ).animate( { "margin-left" : ( $( "#legend" ).width() + 15 ) * -1 }, function()
		{
			$( "#hide" ).css( "background-image", "url(images/right.png)" );
			position_legend();
		});
	}
}

function dot_viz()
{
	if( $( ".dot.active" ).next().length == 0 )
	{
		$( "#next_page" ).addClass( "inactive" );
	}
	else
	{
		$( "#next_page" ).removeClass( "inactive" );
	}
	if( $( ".dot.active" ).prev().length == 0 )
	{
		$( "#prev_page" ).addClass( "inactive" );
	}
	else
	{
		$( "#prev_page" ).removeClass( "inactive" );
	}
}