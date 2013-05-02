function HexGrid(){
	var gmap,
		angles = [0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3],
		r = 35,
		scale,
		x0,
		y0,
		x1,
		y1,
		width,
		height,
		polygons = [],
		binData,
		idwData,
		panOffset,
		pointMarkers = [],
		breaks = [.1,.2,.3,.4,.5,.6,.7,.8],
		colors = ["#993302","#d95f0c","#fe9928","#fed98e","#f4f19d","#bae4bc","#7bccc4","#43a2ca","#0668ac"],
		empty = false,
		_mouseover = function(){},
		_mouseout = function(){},
		_mousedown = function(){},
		_mouseup = function(){};
		
	var overlay = new google.maps.OverlayView(),
		projection;
    overlay.draw = function() {};
    overlay.onAdd = function(){
    	projection = overlay.getProjection();
    	getMapSize();
    	panOffset = getPanOffset();
    	//grid.draw();
    	if ( binData ) grid.bin(binData);
		else if ( idwData ) grid.idw(idwData);
    };
	
	var grid = {};
	
	grid.setMap = function(m){
		if ( arguments.length < 1 ) return gmap;
		if ( m == null ){
			gmap = null;
			for ( var i in polygons ){
				polygons.setMap(null);
			}
			binData = null;
			idwData = null;
			polygons = [];
		}
		gmap = m;
		overlay.setMap(gmap);
		
		if ( projection ){
			panOffset = getPanOffset();
			//grid.draw();
		} 
		gmap.addListener("dragstart",function(){ panOffset = getPanOffset()});
		gmap.addListener("dragend", function(){
			grid.draw();
			if ( binData ) grid.bin(binData);
			else if ( idwData ) grid.idw(idwData);
		});
		
		gmap.addListener("zoom_changed",function(){
			if (projection) getMapSize();
			setTimeout( function(){
			panOffset = getPanOffset();
			grid.draw(true);
			if ( binData ) grid.bin(binData);
			else if ( idwData ) grid.idw(idwData);
			},1000);
		});
		
		return grid;
	}
	
	grid.empty = function(){
		binData = null;
		idwData = null;
		var i = polygons.length; while(i--){
			polygons[i].setMap(null);
		}
		polygons = [];
		empty = true;
		return grid;
	}
	
	grid.draw = function(redraw){
		if ( !projection || empty ) return grid;
		var start = new Date().getTime();
		scale = Math.pow(2,gmap.getZoom());
		var ne = projection.fromLatLngToContainerPixel(gmap.getBounds().getNorthEast()),
			sw = projection.fromLatLngToContainerPixel(gmap.getBounds().getSouthWest());
		var w = 2*Math.sin(angles[1]) * r,
			h = (2*Math.cos(angles[0])-Math.cos(angles[1])) * r;
		var mug = projection.fromLatLngToContainerPixel(panOffset),
			cellOffset = {x:Math.round((mug.x-sw.x)/w),y:Math.round((mug.y-sw.y)/h)};
		x0 = sw.x - (ne.x - sw.x);
		y0 = ne.y - (sw.y - ne.y);
		var odd = 0;
		var n = 0;
	
		if ( polygons.length && !redraw ){
			var tempPolys = [];
			polygons.forEach(function(poly,i){
				var row = Math.floor(i/width),
					col = i % width,
					r1 = row,
					c1 = col,
					move = false,
					pos = projection.fromLatLngToContainerPixel( poly.getPaths().getAt(0).getArray()[0] );;
				if ( cellOffset.x < 0 && -col > cellOffset.x ){
					// swap to right side
					c1 = col + width + cellOffset.x;
					x0 = pos.x + width*w;
					move = true;
				} else if ( cellOffset.x > 0 && width - col - 1 < cellOffset.x ){
					// swap to left side
					c1 = col - width + cellOffset.x;
					x0 = pos.x - width*w;
					move = true;
				}  else {
					c1 = col + cellOffset.x;
					x0 = pos.x;
				}
				if ( cellOffset.y < 0 && -row > cellOffset.y ){
					// swap to bottom side
					r1 = row + height + cellOffset.y;
					y0 = pos.y + height*(h) + r;
					if ( height % 2 ) x0 += w*.5;
					move = true;
				} else if ( cellOffset.y > 0 && height - row - 1 < cellOffset.y ){
					// swap to top side
					r1 = row - height + cellOffset.y;
					y0 = pos.y - height*(h) + r;
					if ( height % 2 ) x0 += w*.5;
					move = true;
				}  else {
					r1 = row + cellOffset.y;
					y0 = pos.y + r;
				}
				if ( move ) poly.setPath( hexagon() );
				tempPolys[ r1*width + c1 ] = poly;
				n++;
			});
			polygons = tempPolys;
		} else {
			while( y0 <= sw.y + (sw.y - ne.y) ){
				x0 = sw.x - (ne.x - sw.x) + odd*Math.sin(angles[1]) * r;
				while( x0 <= ne.x + (ne.x - sw.x) + odd*Math.sin(angles[1]) * r ){
					if ( polygons[n] ) polygons[n].setPath( hexagon() );
					else { 
						polygons[n] = new google.maps.Polygon( {
							paths: hexagon(),
							map: gmap,
							strokeWeight: 1,
							strokeColor: "#fff",
							strokeOpacity: 1,
							fillOpacity: 0
						});
						polygons[n].addListener("mouseover",_mouseover);
						polygons[n].addListener("mouseout",_mouseout);
						polygons[n].addListener("mousedown",_mousedown);
						polygons[n].addListener("mouseup",_mouseup);
					}
					x0 += w;
					n++;
				}
				y0 += h;
				odd = odd ? 0 : 1;
			}
		}
		if ( polygons.length > n ){
			for ( var j = polygons.length-1; j >= n; j-- ){
				polygons[j].setMap(null);
				polygons.splice(j,1);
			}
		}
		var stop = new Date().getTime();
		var executionTime = stop - start;
		//console.log("Draw time:",executionTime);
		return grid;
	}
	
	//grid.mouseover = function(e){ console.log(e); console.log(this);};
	
	grid.radius = function(val){
		if ( arguments.length < 1 ) return r;
		r = val;
		return grid.draw();
	}
	
	grid.breaks = function(b){
		if ( arguments.length < 1 ) return breaks;
		breaks = b;
		//var i=polygons.length; while(i--){
		//	polygons[i].setOptions( getPolygonColor(polygons[i]) );
		//}
		return grid;
	}
	grid.colors = function(c){
		if ( arguments.length < 1 ) return colors;
		colors = c;
		//var i=polygons.length; while(i--){
		//	polygons[i].setOptions( getPolygonColor(polygons[i]) );
		//}
		return grid;
	}
	
	grid.mouseover = function(f){
		if ( arguments.length > 0 ){
			_mouseover = f;
			var i = polygons.length; while(i--){
				google.maps.event.clearListeners(polygons[i],"mouseover");
				polygons[i].addListener("mouseover",_mouseover);
			}
		}
		return grid;
	}
	grid.mouseout = function(f){
		if ( arguments.length > 0 ){
			_mouseout = f;
			var i = polygons.length; while(i--){
				google.maps.event.clearListeners(polygons[i],"mouseout");
				polygons[i].addListener("mouseout",_mouseout);
			}
		}
		return grid;
	}
	grid.mousedown = function(f){
		if ( arguments.length > 0 ){
			_mousedown = f;
			var i = polygons.length; while(i--){
				google.maps.event.clearListeners(polygons[i],"mousedown");
				polygons[i].addListener("mousedown",_mousedown);
			}
		}
		return grid;
	}
	grid.mouseup = function(f){
		if ( arguments.length > 0 ){
			_mouseup = f;
			var i = polygons.length; while(i--){
				google.maps.event.clearListeners(polygons[i],"mouseup");
				polygons[i].addListener("mouseup",_mouseup);
			}
		}
		return grid;
	}
	
	grid.bin = function(data){
		if ( arguments.length < 1 ) return grid;
		if ( empty ){
			empty = false;
			grid.draw();
		} 
		var start = new Date().getTime();
		idwData = null;
		binData = data;
		if ( !projection ) return;
		var pts = data.slice(),
			j, pt, path, minX, maxX, minY, maxY;
		polygons.forEach(function(poly,i){
			getBinValue(poly,pts,false);
			poly.setOptions( getPolygonColor(poly) );
			/*
			if ( poly.val > 0 ){
				if ( poly.val < 100000 ){
					poly.setOptions( {strokeOpacity: 1, fillOpacity: .7, fillColor: "#fee391"} );
				} else if ( poly.val < 1000000 ){
					poly.setOptions( {strokeOpacity: 1, fillOpacity: .7, fillColor: "#fe9929"} );
				} else {
					poly.setOptions( {strokeOpacity: 1, fillOpacity: .7, fillColor: "#8c2d04"} );
				}
			} else poly.setOptions( {strokeOpacity: 0, fillOpacity: 0} );
			*/
		});
		var stop = new Date().getTime();
		var executionTime = stop - start;
		//console.log("Bin time:",executionTime);
		return grid;
	}
	
	grid.idw = function(data,p){
		if ( arguments.length < 1 ) return grid;
		if ( empty ){
			empty = false;
			grid.draw();
		} 
		binData = null;
		idwData = data;
		if ( !projection ) return;
		var pts = data.slice(),
			dataBins = [],
			j, pt, path, centerX, centerY,
			weight, total, dist, w;
		/*
		polygons.forEach(function(poly,i){
			getBinValue(poly,pts,true);
			if ( poly.val > 0 ){
				dataBins[i] = poly.val;
			}
		});
		*/
		var start = new Date().getTime();
		var r1, c1, r2, c2,
			dx, dy, dist, weight, w, total;
		var i = polygons.length; while(i--){
			polygons[i].val = 0;
			polygons[i].contains = null;
			path = polygons[i].getPaths().getAt(0).getArray();
			centerX = path[0].lng() + (path[2].lng() - path[0].lng())*.5;
			centerY = path[4].lat() + (path[1].lat() - path[4].lat())*.5;
			weight = 0;
			total = 0;
			var j = pts.length; while(j--){
				dx = centerX-pts[j].lon;
				dy = centerY-pts[j].lat;
				if ( dx > 3 || dx < -3 || dy > 3 || dy < -3 ) continue;
				dist = (dx)*(dx)+(dy)*(dy);
				//w = 1/Math.pow(dist,p || 1);
				w = 1/dist;
				weight += w;
				total += pts[j].val*w;
				//weight = 100;
				//total = 345;
			}
			polygons[i].val = total/weight;
			polygons[i].setOptions( getPolygonColor(polygons[i]) );
			/*
			
			if ( poly.val == 0 ){
				r1 = Math.floor(i/width);
				c1 = i % width;
				
				dataBins.forEach(function(val,n){
					r2 = Math.floor(n/width);
					c2 = n % width;
					dist = Math.sqrt( Math.pow(r2-r1,2)+Math.pow(c2-c1,2) );
					w = 1/Math.pow(dist,p || 1);
					weight += w;
					total += val*w;
				});
				poly.val = total/weight;
			}
			
			if ( polygons[i].val > 0 ){
				if ( polygons[i].val < .1 ){
					polygons[i].setOptions( {strokeOpacity: 1, fillOpacity: .3, fillColor: "#8bbbd5"} );
				} else if ( polygons[i].val < .25 ){
					polygons[i].setOptions( {strokeOpacity: 1, fillOpacity: .3, fillColor: "#a3daaa"} );
				} else {
					polygons[i].setOptions( {strokeOpacity: 1, fillOpacity: .3, fillColor: "#ffbe87"} );
				}
			} else polygons[i].setOptions( {strokeOpacity: 0, fillOpacity: 0} );
			*/
		}
		var stop = new Date().getTime();
		var executionTime = stop - start;
	//	console.log("IDW time:",executionTime);
		return grid;
	}
	
	function getPolygonColor(poly){
		if ( !poly.val ) return {strokeOpacity: 0, fillOpacity: 0};
		for ( var i=1; i<breaks.length-1; i++ ){
			if ( poly.val < breaks[i] ) return {strokeOpacity: 1, fillOpacity: .5, fillColor: colors[i-1]};
		}
		return {strokeOpacity: 1, fillOpacity: .3, fillColor: colors[i-1]};
	}
	
	function getBinValue(poly,pts,mean){
		poly.val = 0;
		poly.contains = [];
		if ( mean ) var count = 0;
		path = poly.getPaths().getAt(0).getArray();
		minX = path[0].lng();
		maxX = path[2].lng();
		minY = path[4].lat();
		maxY = path[1].lat();
		j=pts.length; while(j--){
			pt = pts[j];
			if ( pt.lon >= minX && pt.lon <= maxX
				&& pt.lat >= minY && pt.lat <= maxY ){
				if ( google.maps.geometry.poly.containsLocation(new google.maps.LatLng(pt.lat,pt.lon),poly) ){
					poly.val += pt.val;
					poly.contains[poly.contains.length] = pt;
					if ( mean ) count++;
					pts.splice(j,1);
					continue;
				}	
			}
		}
		if ( mean && count ) poly.val /= count;
	}
	
	function hexagon(){
		var path = [];
		for ( var i in angles ){
			var x1 = x0 + Math.sin(angles[i]) * r,
			y1 = y0 - Math.cos(angles[i]) * r;
			path[path.length] = projection.fromContainerPixelToLatLng(new google.maps.Point(x1,y1));
			x0 = x1;
			y0 = y1;
		}
		return path;
	}
	
	function getPanOffset(){
		return gmap.getBounds().getSouthWest();
	}
	
	function getMapSize(){
		var ne = projection.fromLatLngToDivPixel(map.getBounds().getNorthEast()),
			sw = projection.fromLatLngToDivPixel(map.getBounds().getSouthWest()),
			w = 2*Math.sin(angles[1]) * r,
			h = (2*Math.cos(angles[0])-Math.cos(angles[1])) * r;
		width = Math.ceil( (ne.x - sw.x) * 3 / w );
		height = Math.ceil( (sw.y - ne.y) * 3 / h );
	}
	
	return grid;
}