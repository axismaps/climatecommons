<?php

	include( 'google.php' );
	include_once( 'constants.php' );
	
	$json = array();
	
	$ft = google_auth();
	
	$layers = fusion_decode( $ft->query->sql( "SELECT * FROM " . LAYERS . " ORDER BY arr" ) );

	$nameIndex = array();

	foreach( $layers as $l )
	{
		$parent = $l[ 'parent' ];
		if ( isset( $nameIndex[ $parent ] ) ){
			if ( !isset( $nameIndex[ $parent ][ 'children' ] ) )
				$nameIndex[ $parent ][ 'children' ] = array();
			unset( $l[ 'tab' ] );
			unset( $l[ 'parent' ] );
			array_push( $nameIndex[ $parent ][ 'children' ], $l );
		} else {
			$nameIndex[ $l['name'] ] = $l;
		}
	}
	
	foreach( $nameIndex as $l )
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