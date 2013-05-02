<?php

	include( 'google.php' );
	include( 'put.php' );
	include_once( 'constants.php' );
	
	date_default_timezone_set( 'UTC' );

	$ft = new googleFusion( 'changeofstates@gmail.com', 'EJN_2012' );
	
	$count = $ft->query( "SELECT COUNT() FROM " . STORIES );
	
	$data = $_GET;
	$data[ "id" ] = $count[ 0 ][ "count()" ];
	$data[ 'date' ] = date( "m/d/y g:i a" );
	$item[ 'published' ] = 0;
	
	$query = 'INSERT INTO ' . STORIES . ' (';
	foreach( $data as $key => $value )
	{
		$query .= $key . ",";
	}
	$query = substr( $query, 0, -1 );
	$query .= ") VALUES (";
	foreach( $data as $key => $value )
	{
		$query .= "'" . $value . "',";
	}
	$query = substr( $query, 0, -1 );
	$query .= ")";
	
	$output = $ft->query( $query );
	
	echo( $output );
?>