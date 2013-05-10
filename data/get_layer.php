<?php

	include_once( 'constants.php' );
	include( 'get.php' );
	
	$json = array();
	
	$data = get( "SELECT lat, lon, val FROM " . $_GET[ 'id' ] . " ORDER BY ST_DISTANCE( lat, LATLNG( 90, 0 ) )" );
	
	if( $_GET[ 'max' ] )
	{
		$k = ceil( count( $data ) / $_GET[ 'max' ] );
	}
	else
	{
		$k = 1;
	}
	
	for( $i = 0; $i < count( $data ); $i += $k )
	{
		if( $data[ $i ][ 'val' ] != "" && $data[ $i ][ 'lat' ] != "" && $data[ $i ][ 'lon' ] != "" )
		{
			foreach( $data[ $i ] as $key => $value )
			{
				$data[ $i ][ $key ] = floatval( $value );
			}
			array_push( $json, $data[ $i ] );
		}
	}
	
	echo json_encode( $json );
?>