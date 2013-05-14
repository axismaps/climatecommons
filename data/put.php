<?php

	include_once( 'constants.php' );
	
	function put( $arr, $ft )
	{	
		for( $i = 0; $i < count( $arr ); $i++ )
		{
			$query = '';
			$query .= 'INSERT INTO ' . STORIES . ' (';
			foreach( $arr[ $i ] as $key => $value )
			{
				$query .= $key . ",";
			}
			$query = substr( $query, 0, -1 );
			$query .= ") VALUES (";
			foreach( $arr[ $i ] as $key => $value )
			{
				if( is_numeric( $value ) || $key == "latitude" || $key == "longitude" )
				{
					$query .= $value . ",";
				}
				elseif( $key != "url" )
				{
					$query .= "'" . htmlentities( $value, ENT_QUOTES, "UTF-8" ) . "',";
				}
				else
				{
					$query .= "'" . $value . "',";
				}
			}
			$query = substr( $query, 0, -1 );
			$query .= ")";
			$output = $ft->query->sql( $query );
		}
	}
?>
