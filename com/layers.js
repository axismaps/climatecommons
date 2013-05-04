var layers = {},
	colors = {
		YlOrBr: [ "#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04" ],
		OrBl: [ "#d95f0c","#fe9928","#fed98e","#f4f19d","#bae4bc","#7bccc4","#43a2ca" ],
		Temp: [ "#43a2ca", "#7bccc4", "#bae4bc", "#f4f19d", "#fed98e", "#fe9928", "#d95f0c" ],
		PuBu: [ "#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b" ],
		BuPu : [ "#edf8fb", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b" ],
		RdPu : [ "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177" ],
		Blues : [ "#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594" ],
		Reds : [ "#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d" ],
		YlOrRd : [ "#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026" ],
		RdYlBu : [ "#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4" ]
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
			if( l.color == "RdYlBu" )
			{
				var pos = $( l.data ).filter( function()
				{
					return this.val >= 0;
				}); 
				var neg = $( l.data ).filter( function()
				{
					return this.val < 0;
				}); 
				var b1 = getBreaks( neg, 3 );
				var b2 = getBreaks( pos, 3 );
				b1.pop();
				var breaks = b1.concat( b2 );
				layer.colors( colors.RdYlBu )
					.breaks( breaks )
					.idw( l.data );
			}
			else
			{
				layer.colors( c || colors.OrBl )
					.breaks( getBreaks( l.data, 7 ) )
					.idw( l.data );
			}
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
					if( l.color == "RdYlBu" )
					{
						var pos = $( l.data ).filter( function()
						{
							return this.val >= 0;
						}); 
						var neg = $( l.data ).filter( function()
						{
							return this.val < 0;
						}); 
						var b1 = getBreaks( neg, 3 );
						var b2 = getBreaks( pos, 3 );
						b1.pop();
						var breaks = b1.concat( b2 );
						
						layer.colors( colors.RdYlBu )
							.breaks( breaks )
							.idw( l.data );
					}
					else
					{
						layer.colors( c || colors.OrBl )
							.breaks( getBreaks( l.data, 7))
							.idw( l.data );
					}
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
}