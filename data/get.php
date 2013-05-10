<?php
	function get( $query )
	{
        // create curl resource 
        $ch = curl_init(); 

        // set url 
        curl_setopt($ch, CURLOPT_URL, "https://www.googleapis.com/fusiontables/v1/query?sql=" . urlencode( $query ) . "&key=" . API_KEY ); 

        //return the transfer as a string 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

        // $output contains the output string 
        $output = curl_exec($ch); 

        // close curl resource to free up system resources 
        curl_close($ch);

		return fusion_decode( $output );
	}
	
	function fusion_decode( $output )
	{
		$decoded = array();
		$json = json_decode( $output );
		$columns = $json->columns;
		foreach( $json->rows as $row )
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