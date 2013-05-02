var low = new google.maps.StyledMapType([
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#cfd8e7" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#f1f6e7" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#c5b7b4" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.icon",
    "stylers": [
      { "lightness": 50 },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.province",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" },
      { "visibility": "on" }
    ]
  },{
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#fbf4e7" }
    ]
  },{
    "featureType": "administrative",
    "stylers": [
      { "saturation": -50 }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#6e8764" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "on" },
      { "gamma": 1.67 },
      { "saturation": -45 }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.attraction",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.government",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.place_of_worship",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.school",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.sports_complex",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "lightness": 35 }
    ]
  }
]);

var mid = new google.maps.StyledMapType([
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#cfd8e7" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "on" },
      { "color": "#f1f6e7" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#c5b7b4" },
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.icon",
    "stylers": [
      { "lightness": 50 }
    ]
  },{
    "featureType": "administrative.province",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#fbf4e7" }
    ]
  },{
    "featureType": "administrative",
    "stylers": [
      { "saturation": -50 }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#6e8764" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "on" },
      { "gamma": 1.67 },
      { "saturation": -45 }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.attraction",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.government",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.place_of_worship",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.school",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.sports_complex",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "lightness": 35 }
    ]
  }
]);

var high = new google.maps.StyledMapType([
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#cfd8e7" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "on" },
      { "color": "#f1f6e7" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#c5b7b4" },
      { "visibility": "on" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.icon",
    "stylers": [
      { "lightness": 50 }
    ]
  },{
    "featureType": "administrative.province",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#808080" }
    ]
  },{
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#fdf9f1" }
    ]
  },{
    "featureType": "administrative",
    "stylers": [
      { "saturation": -50 }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#6e8764" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "on" },
      { "gamma": 1.67 },
      { "saturation": -45 }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.attraction",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.government",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.place_of_worship",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.school",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.sports_complex",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.medical",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "lightness": 35 }
    ]
  }
]);