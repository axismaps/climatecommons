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
		if ( breaks[ i - 1 ] >= breaks[ i  ] ) continue;
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
}