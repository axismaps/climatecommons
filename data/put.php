<?php

	include_once( 'constants.php' );
	
	function put( $arr, $ft )
	{	
		$query = '';
		for( $i = 0; $i < count( $arr ); $i++ )
		{
			$query .= 'INSERT INTO ' . STORIES . ' (';
			foreach( $arr[ $i ] as $key => $value )
			{
				$query .= $key . ",";
			}
			$query = substr( $query, 0, -1 );
			$query .= ") VALUES (";
			foreach( $arr[ $i ] as $key => $value )
			{
				$query .= "'" . $value . "',";
			}
			$query = substr( $query, 0, -1 );
			$query .= "); ";
		}
		$query = substr( $query, 0, -2 );
		$output = $ft->query( $query );
	}
?>