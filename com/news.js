var stories = [];

function get_news()
{
	$.ajax({
		url : "data/load_stories.php",
		dataType: "json",
		success: function( json )
		{
			stories = json;
			for( var i = 0; i < stories.length; i++ )
			{
				stories[ i ].text = $( '<div/>' ).html( stories[ i ].text ).text();
				stories[ i ].marker = addMarker({
					"lat" : stories[ i ].latitude,
					"lng" : stories[ i ].longitude,
					"id" : stories[ i ].id
				});
			}
			build_news();
		}
	})
}

function build_news()
{
	var even = false;
	var container = $( document.createElement( 'div' ) )
		.attr( "id", "container" )
		.append(
			$( document.createElement( 'div' ) )
				.attr( "id", "no_stories" )
				.html( "<b>No Stories in View</b><br />Explore the map or select more filter categories to bring stories back into view." )
				.hide()
		)
		.appendTo( $( "#stories" ) );
	for( var i = 0; i < stories.length; i++ )
	{
		var date = new Date( stories[ i ].date );
		var story = $( document.createElement( 'div' ) )
			.addClass( "story closed" )
			.attr({
				"id" : "s" + stories[ i ].id,
				"name" : i
			})
			.append(
				$( document.createElement( 'div' ) )
					.addClass( "source" )
					.html( stories[ i ].source )
			)
			.append(
				$( document.createElement( 'div' ) )
					.addClass( "date" )
					.html( date.toString().replace( /[A-Z]{3} (?=[A-Z]{3})/gi, "" ).replace( /[0-9]{2}:.*$/, "" ).replace(/ (?=[0-9]{4})/g, ", ") )
			)
			.append(
				$( document.createElement( 'h2' ) ).html( stories[ i ].title )
			);
		if( stories[ i ].image ) story.append( $( document.createElement( 'img' ) ).attr( "src", "http:" + stories[ i ].image ) );
		
		story
			.append( 
				$( document.createElement( 'p' ) ).html( stories[ i ].text )
			)
			.append(
				$( document.createElement( 'a' ) )
					.attr({
						"href" : stories[ i ].url,
						"target" : "_blank"
					})
					.html( "Full Story &gt;" )
			)
			.click( function()
			{
				if ( ipad ) touchTimer = new Date().getTime();
				new google.maps.event.trigger( stories[ $( this ).attr( "name" ) ].marker, ipad ? 'mouseup' : 'click' );
			});
		container.append( story );
	}
	set_story_viz( 0 );
	build_filters();
	$( ".story:visible:first" ).click();
}

function expand_story( id )
{
	$( ".story.open" ).removeClass( "open" ).addClass( "closed" );
	while( $( "#s" + id ).is( ":hidden" ) )
	{
		if( $( "#stories .story:visible" ).prevAll( "#s" + id ).length > 0 )
		{
			$( "#prev_page" ).click();
		}
		else
		{
			$( "#next_page" ).click();
		}
	}
	$( "#s" + id ).addClass( "open" ).removeClass( "closed" );
	$( "#stories" ).animate( { scrollTop : $( "#s" + id ).offset().top - $( "#stories" ).offset().top + $( "#stories" ).scrollTop() }, 1000 );
}

var probeTimeout;

function show_probe( marker )
{
	function probe( e )
	{
		clearTimeout( probeTimeout );
		$( "#probe" ).remove();
		var n = 0;
		var probe = $("<div/>");
		var latLng = marker.getPosition();
		for ( var i in stories ){
			if ( Math.abs(Number(stories[i].latitude)-latLng.lat()) < .01 && Math.abs(Number(stories[i].longitude)-latLng.lng()) < .01 ){
				probe.append( $( "#s" + stories[ i ].id ).clone().attr( { "id" : "p" + i, "class" : "story closed" } ).show()
					.click(function(){
						var id = $(this).attr("id").substring(1);
						if( selected )
						{
							selected.setZIndex( 10 );
							selected.setIcon( "images/dot.png" );
						}
						stories[id].marker.setIcon( "images/dot_on.png" );
						stories[id].marker.setZIndex( 999 );
						
						var b = map.getBounds();
						if( !b.contains( stories[id].marker.getPosition() ) )
						{
							map.setCenter( stories[id].marker.getPosition() );
							set_story_viz( parseInt( $( ".dot.active" ).attr( "name" ), 10 ) );
							expand_story( marker.id );
						}
						else
						{
							expand_story( stories[id].id );
						}
						selected = marker;
						$( "#probe" ).remove();
					}) );
				n++;
			}
		}
		$( "body" ).append( probe );
		probe
			.attr( "id", "probe" )
			.css({
				"top" : e.pageY - probe.innerHeight() - 5,
				"left" : e.pageX + 5
			});
		if( e.pageX > ( $( window ).width() - 195 ) / 2 ) probe.css( "margin-left", "-" + ( probe.innerWidth() + 20 ) + "px" );
		if( e.pageY > ( $( window ).height() - 160 ) /  2 ) probe.css( "margin-top", ( probe.innerHeight() + (n>1 ? 5 : 20) ) + "px" );
		$( "#map" ).unbind( "mousemove" );

	    function up(){
	    	if( selected != marker ) marker.setIcon( "images/dot.png" );
	    	if ( n > 1 ){
	    		clearTimeout(probeTimeout);
	    		probeTimeout = setTimeout( function(){$( "#probe" ).remove()},1000 );
	    		probe.mouseover(function(){
	    			clearTimeout(probeTimeout);
	    		});
	    		probe.mouseout(function(e){ 
	    			if ( !$.contains(probe[0],e.relatedTarget) && e.relatedTarget != probe[0] )
	    				probe.remove();
	    		});
	    	} 
	    	else  $( "#probe" ).remove();
	    }
	    if (!ipad) google.maps.event.addListener( marker, 'mouseout', up);
	    else $(document).mouseup( function(e){
	    	e.stopImmediatePropagation();
	    	if ( n < 2 ){
	    		$("#probe").remove();
	    	} else {
	    		$(document).on("mousedown", down);
	    		function down(e){
	    			if ( !$.contains(probe[0],e.target) && e.target != probe[0] )
	    				probe.remove();
	    			$(document).off("mousedown",down);
	    		}
	    	}
	    	$(document).unbind("mouseup");
	    });
	}
	if ( !ipad ) $("#map").mousemove(probe);
	else probe(mouseEvent);
}

function set_story_viz( n )
{
	n = n || 0;
	var b = map.getBounds();
	var active = [];
	for( var i = 0; i < stories.length; i++ )
	{
		if( check_story_bounds( stories[ i ], b ) && check_filter( stories[ i ] ) ) active.push( stories[ i ] );
	}
	
	if ( !active.length ) $("#no_stories").show();
	else $("#no_stories").hide();
	
	var j = Math.min( n, active.length );
	$( ".story" ).hide().removeClass( "even" );
	var even = false;
	while( j < active.length && j < n + 100 )
	{
		$( "#s" + active[ j ].id ).show();
		if( even ) $( "#s" + active[ j ].id ).addClass( "even" );
		even = !even;
		j++;
	}
	
	$( "#dots" ).html( "&nbsp;" );
	for( var k = 0; k < active.length; k += 100 )
	{
		$( "#dots" ).append(
			$( document.createElement( 'span' ) )
				.addClass( k == n ? "active dot" : "dot" )
				.attr( "name", k )
				.html( "&#9679;" )
		);
	}
	dot_viz();
}

function check_story_bounds( story, b )
{
	if( !b ) return true;
	if( b.contains( new google.maps.LatLng( story.latitude, story.longitude ) ) )
	{
		return true;
	}
	else
	{
		return false;
	}
}