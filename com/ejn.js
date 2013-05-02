var map, overlay, layer, selected, markers = [];

$( document ).ready( function(){
	initialize_map();
	get_layers();
	get_news();
	init_events();
	resize();
});

function initialize_map() {
	var mapOptions = {
		minZoom : 4,
		maxZoom : 9,
		panControl: false,
		zoomControl: true,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false
	};
	map = new google.maps.Map( document.getElementById( "map" ),mapOptions);
   	
   	layer = new HexGrid().setMap( map );
   	if ( !ipad ){
		layer.mouseover( hexOver );
		layer.mouseout( function(e){
			if ( this.val ){
				this.setOptions({strokeWeight: 1});
				hideDataPoints();
				hideHexProbe();
			}
		});
	} else {
		layer.mousedown( hexOver );
		layer.mouseup( function(e){
			if ( this.val ){
				this.setOptions({strokeWeight: 1});
				hideDataPoints();
				hideHexProbe();
			}
		});
	}
    
    map.mapTypes.set( 'low_zoom', low );
    map.mapTypes.set( 'mid_zoom', mid );
    map.mapTypes.set( 'high_zoom', high );
    
    map.addListener( "zoom_changed", function()
    {
    	var z = map.getZoom();
    	if( z <= 4 )
    	{
	    	map.setMapTypeId( 'low_zoom' );
    	}
    	else if( z <= 7 )
    	{
	    	map.setMapTypeId( 'mid_zoom' );
    	}
    	else
    	{
	    	map.setMapTypeId( 'high_zoom' );
    	}
    	set_story_viz( parseInt( $( ".dot.active" ).attr( "name" ), 10 ) );
    	hideHexProbe();
    	hideDataPoints();
    	layer.mouseover( function(){} );
    	setTimeout( function(){ 
    		if ( !ipad )
    			layer.mouseover(hexOver);
    		else
    			layer.mousedown(hexOver);
    	},1000 );
    });
    map.fitBounds( new google.maps.LatLngBounds( new google.maps.LatLng( 24.5210, -124.7625 ), new google.maps.LatLng( 49.3845, -66.9326 ) ) );
    
    map.addListener( "dragend", function()
    {
	    set_story_viz( parseInt( $( ".dot.active" ).attr( "name" ), 10 ) );
    });
    
	var allowedBounds = new google.maps.LatLngBounds(
	     new google.maps.LatLng( 20, -168 ), 
	     new google.maps.LatLng(72, -65)
	);
	var lastValidCenter = map.getCenter();
	
	google.maps.event.addListener( map, 'center_changed', function()
	{
	    if ( allowedBounds.contains( map.getCenter() ) )
	    {
	        lastValidCenter = map.getCenter();
	        return; 
	    }
	    map.panTo( lastValidCenter );
	});
}

function addMarker( m ){
	var marker = new google.maps.Marker({
		position : new google.maps.LatLng( m.lat, m.lng ),
		map : map,
		id : m.id,
		icon : "images/dot.png"
	});
	
	markers.push( marker );
	
    if ( ipad ){
    	google.maps.event.addListener( marker, 'mousedown', function(e)
		{
			show_probe( marker );
			touchTimer = new Date().getTime();
		});
		google.maps.event.addListener( marker, 'mouseup', function(e)
		{
			if ( new Date().getTime() - touchTimer < 250 ){
				if( selected )
				{
					selected.setZIndex( 10 );
					selected.setIcon( "images/dot.png" );
				}
				marker.setIcon( "images/dot_on.png" );
				marker.setZIndex( 999 );
				
				var b = map.getBounds();
				if( b && !b.contains( marker.getPosition() ) )
				{
					map.setCenter( marker.getPosition() );
					set_story_viz( parseInt( $( ".dot.active" ).attr( "name" ), 10 ) );
					expand_story( marker.id );
				}
				else
				{
					expand_story( marker.id );
				}
				selected = marker;
			}
		});
    } else {
    	google.maps.event.addListener( marker, 'mouseover', function(e)
		{
			if ( ipad ) return;
			marker.setIcon( "images/dot_on.png" );
			if( selected != marker ) show_probe( marker, e );
			
		});
		
		google.maps.event.addListener( marker, 'click', function()
		{
			if ( ipad ) return;
			if( selected )
			{
				selected.setZIndex( 10 );
				selected.setIcon( "images/dot.png" );
			}
			marker.setIcon( "images/dot_on.png" );
			marker.setZIndex( 999 );
			
			var b = map.getBounds();
			if( b && !b.contains( marker.getPosition() ) )
			{
				map.setCenter( marker.getPosition() );
				set_story_viz( parseInt( $( ".dot.active" ).attr( "name" ), 10 ) );
				expand_story( marker.id );
			}
			else
			{
				expand_story( marker.id );
			}
			selected = marker;
		});
    }
    
    return marker;
}

function hexOver(e){
	if ( this.val ){
		this.setOptions({strokeWeight: 4});
		if ( this.contains ) showDataPoints(this.contains);
		showHexProbe(this);
	}
}

var dataPoints;
function showDataPoints(pts){
	hideDataPoints();
	for ( var i in pts ){
		var m = new google.maps.Marker({
			position: new google.maps.LatLng( pts[i].lat, pts[i].lon ),
			map: map,
			icon: "images/data_point.png",
			clickable: false
		});
		dataPoints.push(m);
	}
}
function hideDataPoints(){
	for ( var i in dataPoints ){
		dataPoints[i].setMap(null);
	}
	dataPoints = [];
}
function showHexProbe(poly){
	var probe = $("<div id='hex-probe'/>");
	probe.html( "<p><strong>"+selectedLayer+":</strong> " + (Math.round(poly.val*100)/100) + "</p>"+
				( poly.contains && poly.contains.length ? ("<p><em>Data derived from "+poly.contains.length+" source"+(poly.contains.length>1?"s":"")+"</em></p>") : "" ) );
	$("body").append(probe);
}
function hideHexProbe(){
	$("#hex-probe").remove();
}

function build_legend( l )
{
	var breaks = layer.breaks();
	$( "#legend" ).show();
	$( "#legend #items" ).empty();
	if( l.color )
	{
		var c = colors[ l.color ];
	}
	else if( l.idw == "1" )
	{
		var c = colors.OrBl;
	}
	else
	{
		var c = colors.YlOrBr;
	}
	for( var i = 1; i < breaks.length; i++ )
	{
		$( "#legend #items" )
			.append(
				$( document.createElement( 'span' ) )
					.html( "&#11042;" )
					.css( "color", c[ i - 1 ] )
			)
			.append( ( breaks[i] == Infinity ? "&gt; " + (Math.round( breaks[ i - 1 ] )) : ( Math.round( breaks[ i - 1 ] ) + " - " + Math.round( breaks[ i ] ) ) ) + " " + l.unit + "<br />" );
	}
	$( "#legend #items" ).append(
		$( document.createElement( 'div' ) )
			.html( "&nbsp; | &nbsp;" )
			.addClass( "meta" )
			.prepend(
				$( document.createElement( 'a' ) )
					.attr({
						"href" : l.link,
						"target" : "_blank"
					})
					.html( l.source )
			)
			.append(
				$( document.createElement( 'a' ) )
					.attr({
						"href" : "https://www.google.com/fusiontables/DataSource?docid=" + l.id,
						"target" : "_blank"
					})
					.html( "Fusion Table" )
			)
	);
	position_legend();
}var stories = [];

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
}var ipad = navigator.userAgent.match( /iPad/i ) != null;
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
}var layers = {},
	colors = {
		YlOrBr: [ "#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04" ],
		OrBl: [ "#d95f0c","#fe9928","#fed98e","#f4f19d","#bae4bc","#7bccc4","#43a2ca" ],
		Temp: [ "#43a2ca", "#7bccc4", "#bae4bc", "#f4f19d", "#fed98e", "#fe9928", "#d95f0c" ],
		PuBu: [ "#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b" ],
		BuPu : [ "#edf8fb", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b" ],
		RdPu : [ "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177" ],
		Blues : [ "#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594" ],
		Reds : [ "#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d" ],
		YlOrRd : [ "#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026" ]
	},
	selectedLayer;

function get_layers()
{
	$.ajax({
		url : "data/load_layers.php",
		dataType : "json",
		success : function( json )
		{
			layers = json;
			build_layers();
		}
	})
}

function build_layers()
{
	for( var i in layers )
	{
		$( document.createElement( 'div' ) )
			.addClass( "tab" )
			.attr( "id", i )
			.html( i )
			.click( select_tab )
			.appendTo( $( "#tabs" ) );
	}
	
	$( document.createElement( 'div' ) )
		.addClass( "tab" )
		.attr( "id", "none" )
		.html( "Stories" )
		.click( select_none )
		.appendTo( $( "#tabs" ) );
		
	$( ".tab:first" ).click();
	$( "#layers input:first" ).click();
}

function select_tab()
{
	if( $( this ).hasClass( "active" ) ) return;
	
	$( ".tab.active" ).removeClass( "active" );
	$( this ).addClass( "active" );
	
	$( "#layers" ).empty();
	var id = $( this ).attr( "id" );
	for( var i in layers[ id ] )
	{
		$( document.createElement( 'label' ) )
			.html( "&nbsp;" + i )
			.prepend(
				$( document.createElement( 'input' ) )
					.attr({
						"type" : "radio",
						"value" : i,
						"id" : i,
						"name" : id
					})
					.change( select_radio )
			)
			.appendTo( "#layers" );
	}
	if( $( this ).hasClass( "selected" ) ) $( "input#" + $( "#layers" ).attr( "name" ) ).attr( "checked", "checked" );
}

function select_radio()
{
	$( "#legend select" ).remove();
	$( "#legend #items" ).empty();
	
	var tab = $( this ).attr( "name" );
	var rad = $( this ).val();
	var group = layers[ tab ][ rad ];
	group[ 0 ].data = load_layer( group[ 0 ] );
	selectedLayer = group[ 0 ].name;
	
	if( group.length == 1 )
	{
		$( "#legend #hide" ).after( "<b>" + group[ 0 ].name + "</b><br />" );
	}
	else
	{
		var select = $( document.createElement( 'select' ) )
			.change( function( e )
			{
				$( "#legend #items" ).empty();
				var selected = $( this ).children( ":selected" );
				selectedLayer = selected.html();
				var tab = selected.attr( "name" );
				var rad = selected.attr( "id" );
				var i = selected.val();
				layers[ tab ][ rad ][ i ].data = load_layer( layers[ tab ][ rad ][ i ] );
			});
		for( var i = 0; i < group.length; i++ )
		{
			$( document.createElement( 'option' ) )
				.attr({
					"value" : i,
					"name" : tab,
					"id" : rad
				})
				.html( group[ i ].name )
				.appendTo( select )
		}
		$( "#legend" ).prepend( select );
	}
	
	$( "#layers" ).attr( "name", $( this ).attr( "id" ) );
	$( ".tab.selected" ).removeClass( "selected" );
	$( ".tab.active" ).addClass( "selected" );
	
	
}

function select_none()
{
	layer.empty();
	$( "#layers" ).empty();
	$( "#legend" ).hide();
	position_legend();
	$( ".tab.active" ).removeClass( "active" );
	$( ".tab.selected" ).removeClass( "selected" );
	$( this ).addClass( "selected" );
	$( "#layers :checked" ).prop( "checked", false );
}

function load_layer( l )
{
	var c =  colors[ l.color ];
	if( l.data )
	{
		if( l.idw == "1" )
		{
			layer.colors( c || colors.OrBl )
				.breaks( getBreaks( l.data, 7 ) )
				.idw( l.data );
		}
		else
		{
			layer.colors( c || colors.YlOrBr )
				.breaks( getBreaks( l.data, 7, true ) )
				.bin( l.data );
		}
		build_legend( l );
		return l.data;
	}
	else
	{
		var get = { "id" : l.id };
		if( ipad || ie8 ) get.max = 2000;
		layer.empty();
		$("#legend").append( $("<div id='loader'></div>" ) );
		$.ajax({
			url : "data/get_layer.php",
			data : get,
			dataType : "json",
			success : function( json )
			{
				l.data = json;
				if( l.idw == "1" )
				{
					layer.colors( c || colors.OrBl )
						.breaks( getBreaks( l.data, 7))
						.idw( l.data );
				}
				else
				{
					layer.colors( c || colors.YlOrBr )
						.breaks( getBreaks( l.data, 7, true ) )
						.bin( l.data );
				}
				$("#loader").remove();
				build_legend( l );
				return l.data;
			}
		});
	}
}

function getBreaks( data, length, bin ){
	var arr = [],
		breaks = [];
	if ( !bin ){
		var i=data.length; while(i--){
			if ( $.inArray( data[i].val, arr ) == -1 )
				arr[arr.length] = data[i].val;
		}
		arr.sort(function(a,b){return a-b;});
		var n = Math.floor( arr.length/Math.min(arr.length,length) ),
			range = arr[arr.length-1]-arr[0],
			round;
		if ( range < 1 ) round = .1;
		else if ( range < 50 ) round = 1;
		else if ( range < 500 ) round = 5;
		else if ( range < 1000 ) round = 10;
		else if ( range < 100000 )round = 100;
		else round = 1000;
		breaks.push(arr[0]);
		for ( i=1; i<Math.min(arr.length,length); i++ ){
			breaks.push(Math.round(arr[i*n]/round)*round);
		}
		breaks.push(arr[arr.length-1]);
		return breaks;
	}
	var sum = 0;
	i=data.length; while(i--){
		arr.push(data[i].val);
		sum += data[i].val;
	}
	arr.sort(function(a,b){return a-b;});
	var median = arr[ Math.floor(arr.length/2) ],
		mean = sum/arr.length,
		range = arr[arr.length-1]-arr[0],
		round;
	if ( range < 1 ) round = .1;
	else if ( range < 50 ) round = 1;
	else if ( range < 500 ) round = 5;
	else if ( range < 1000 ) round = 10;
	else if ( range < 100000 )round = 100;
	else round = 1000;
	breaks.push(Math.round(arr[0]));
	var range = sum*.01/length;
	for ( i=1; i<length; i++){
		breaks.push( Math.round( (arr[i-1] + 2*i*Math.round(range*i/length))/round)*round );
	}
	breaks.push(Infinity);
	return breaks;
}var filters = [];

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
}function start_search()
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
}var low = new google.maps.StyledMapType([
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#cfd8e7" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#f1f6e7" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#c5b7b4" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.icon",
    "stylers": [
      { "lightness": 50 },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.province",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" },
      { "visibility": "on" }
    ]
  },{
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#fbf4e7" }
    ]
  },{
    "featureType": "administrative",
    "stylers": [
      { "saturation": -50 }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#6e8764" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "on" },
      { "gamma": 1.67 },
      { "saturation": -45 }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.attraction",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.government",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.place_of_worship",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.school",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.sports_complex",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "lightness": 35 }
    ]
  }
]);

var mid = new google.maps.StyledMapType([
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#cfd8e7" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "on" },
      { "color": "#f1f6e7" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#c5b7b4" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.icon",
    "stylers": [
      { "lightness": 50 }
    ]
  },{
    "featureType": "administrative.province",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#fbf4e7" }
    ]
  },{
    "featureType": "administrative",
    "stylers": [
      { "saturation": -50 }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#6e8764" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "on" },
      { "gamma": 1.67 },
      { "saturation": -45 }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.attraction",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.government",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.place_of_worship",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.school",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.sports_complex",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "lightness": 35 }
    ]
  }
]);

var high = new google.maps.StyledMapType([
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#cfd8e7" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "on" },
      { "color": "#f1f6e7" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#c5b7b4" },
      { "visibility": "on" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.icon",
    "stylers": [
      { "lightness": 50 }
    ]
  },{
    "featureType": "administrative.province",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#fdf9f1" }
    ]
  },{
    "featureType": "administrative",
    "stylers": [
      { "saturation": -50 }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#6e8764" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "on" },
      { "gamma": 1.67 },
      { "saturation": -45 }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.attraction",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.government",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.place_of_worship",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.school",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.sports_complex",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "lightness": 35 }
    ]
  }
]);