#!/usr/bin/php
<?php

	require_once 'Services/GeoNames.php';

	include( 'google.php' );
	include( 'put.php' );
	include_once( 'constants.php' );
	
	date_default_timezone_set( 'UTC' );
	
	$geo = new Services_GeoNames();

	$ft = google_auth();
	
	$cats = fusion_decode( $ft->query->sql( "SELECT * FROM " . CATEGORIES ) );

	foreach( $cats as $cat )
	{	
		$news = simplexml_load_file('http://api.geonames.org/rssToGeoRSS?feedUrl=' . urlencode( 'http://news.google.com/news?q=' . urlencode( $cat[ 'search' ] ) . '&output=rss' ) . '&username=axismaps' );
		
		$feeds = array();
		
		$i = 0;
		foreach ( $news->channel->item as $item )
		{
		
			$ns_geo = $item->children( 'http://www.w3.org/2003/01/geo/wgs84_pos#' );
			if( $ns_geo->lat != 0 && $ns_geo->long != 0 )
			{
				try
				{
					$country = $geo->countryCode( array(
						'lat' => $ns_geo->lat,
						'lng' => $ns_geo->long
					));
				}
				catch( Exception $e )
				{
					echo 'Caught exception: ',  $e->getMessage(), "\n";
				}
				
				if( $country->countryCode == "US" )
				{
					$feeds[ $i ][ 'latitude' ] = $ns_geo->lat;
					$feeds[ $i ][ 'longitude' ] = $ns_geo->long;
				
					preg_match('@src="([^"]+)"@', $item->description, $match);
					$parts = explode('<font size="-1">', $item->description);
				
					$feeds[ $i ][ 'title'] = preg_replace( "/ - (?!.* - ).*$/uim", "", strip_tags( $item->title ) );
					$feeds[ $i ][ 'url' ] = ( string ) $item->link;
					if( isset( $match[ 1 ] ) )
					{
						$feeds[ $i ][ 'image' ] = $match[ 1 ];
					}
					$feeds[ $i ][ 'source' ] = preg_replace("/ \\.\\.\\..*$/uim", "...", strip_tags( $parts[ 1 ] ) );
					$feeds[ $i ][ 'text' ] = preg_replace("/ \\.\\.\\..*$/uim", "...", strip_tags( $parts[ 2 ] ) );
					$feeds[ $i ][ 'category' ] = $cat[ 'category' ];
				}
			}
			$i++;
		}
		
		$priority = array();
		$sources = fusion_decode( $ft->query->sql( "SELECT * FROM " . SOURCES ) );
		foreach( $sources as $s )
		{
			$priority[ $s[ 'source' ] ] = $s[ 'rank' ];
		}
		
		$curr = fusion_decode( $ft->query->sql( "SELECT * FROM " . STORIES ) );
		$arr = array();
		$i = count( $curr );
		
		foreach( $feeds as $item )
		{
			$unique = true;
			foreach( $curr as $ex )
			{
				if( $ex[ 'title' ] == $item[ 'title' ] )
				{
					$unique = false;
					break;
				}
			}
			if( $unique )
			{
				foreach( $arr as $ex )
				{
					if( $ex[ 'title' ] == $item[ 'title' ] )
					{
						$unique = false;
						break;
					}
				}
				if( $unique )
				{
					$item[ 'date' ] = date( "M j, Y" );
					$item[ 'id' ] = $i;
					if( $item[ 'latitude' ] == 39.76 && $item[ 'longitude' ] == -98.5 )
					{
						$item[ 'published' ] = 0;
					}
					else
					{
						$item[ 'published' ] = 1;
					}
					if( isset( $priority[ $item[ 'source' ] ] ) )
					{
						$item[ 'priority' ] = $priority[ $item[ 'source' ] ];
					}
					array_push( $arr, $item );
					$i++;
				}
			}
		}
		if( count( $arr ) > 0 )
		{
			put( $arr, $ft );
		}
	}
?>