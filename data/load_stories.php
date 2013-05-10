<?php

	include( 'google.php' );
	include_once( 'constants.php' );
	
	date_default_timezone_set( 'UTC' );
	
	$json = array();
	
	$ft = google_auth();
	
	$news = fusion_decode( $ft->query->sql( "SELECT * FROM " . STORIES . " WHERE published = 1 ORDER BY date DESC LIMIT 500" ) );
	
	$dates = array();
	foreach( $news as $n )
	{
		$d = strtotime( $n[ 'date' ] );
		if( !isset( $dates[ $d ] ) )
		{
			$dates[ $d ] = array();
		}
		array_push( $dates[ $d ], $n );
	}
	krsort( $dates );
	foreach( $dates as $d )
	{
		usort( $d, "cmp" );
		foreach( $d as $story )
		{
			unset( $story[ 'published' ], $story[ 'priority' ], $story[ 'location' ] );
			array_push( $json, $story );
		}
	}
	
	echo json_encode( $json );
	
	function cmp( $a, $b )
	{ 
	    if( $a[ 'priority' ] == "" )
	    {
		    if( $b[ 'priority' ] == "" )
		    {
		    	return 0;
		    }
		    return 1;
	    }
	    elseif( $b[ 'priority' ] == "" )
	    {
		    return -1;
		}
		elseif( $a[ 'priority' ] == $b[ 'priority' ] )
		{
			return 0;
		}
	    return ( $a[ 'priority' ] < $b[ 'priority' ] ) ? 1 : -1;
	}
?>