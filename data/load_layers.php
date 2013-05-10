<?php

	include( 'google.php' );
	include_once( 'constants.php' );
	
	$json = array();
	
	$ft = google_auth();
	
	$layers = fusion_decode( $ft->query->sql( "SELECT * FROM " . LAYERS . " ORDER BY arr" ) );
	
	foreach( $layers as $l )
	{
		$tab = $l[ 'tab' ];
		if( !isset( $json[ $tab ] ) )
		{
			$json[ $tab ] = array();
		}
		unset( $l[ 'tab' ] );
		
		$parent = $l[ 'parent' ];
		if( !isset( $json[ $tab ][ $parent ] ) )
		{
			$json[ $tab ][ $parent ] = array();
		}
		unset( $l[ 'parent' ] );
		array_push( $json[ $tab ][ $parent ], $l );
	}
	
	echo json_encode( $json );
?>