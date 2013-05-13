<?php
	require_once '/var/www/map/lib/google-api-php-client/Google_Client.php';
	require_once '/var/www/map/lib/google-api-php-client/contrib/Google_FusiontablesService.php';

	/* Define all constants */
	const CLIENT_ID = '51995355460-d4bkpsf6350ggm47n17mqeiam2blmia8.apps.googleusercontent.com';
	const FT_SCOPE = 'https://www.googleapis.com/auth/fusiontables';
	const SERVICE_ACCOUNT_NAME = '51995355460-d4bkpsf6350ggm47n17mqeiam2blmia8@developer.gserviceaccount.com';
	const KEY_FILE = '/var/www/map/lib/google-api-php-client/305961c9f49723cf626fe798fae641c2c6d3e783-privatekey.p12';
	
	function google_auth()
	{
		$client = new Google_Client();
		$client->setApplicationName( "ClimateCommons" );
		$client->setClientId( CLIENT_ID );
	
		$key = file_get_contents( KEY_FILE );
		$client->setAssertionCredentials(
			new Google_AssertionCredentials(
		  		SERVICE_ACCOUNT_NAME,
		  		array( FT_SCOPE ),
		  		$key
		  	)
		);
	
		$service = new Google_FusiontablesService( $client );
		
		return $service;
	}
	
	function fusion_decode( $output )
	{
		$decoded = array();
		$columns = $output[ 'columns' ];
		foreach( $output[ 'rows' ] as $row )
		{
			$r = array();
			foreach( $row as $key => $value )
			{
				$r[ $columns[ $key ] ] = $value;
			}
			array_push( $decoded, $r );
		}
		return $decoded;
	}
?>