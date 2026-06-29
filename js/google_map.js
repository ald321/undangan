
var google;

function init() {
    var venueAddress = 'Omah Joglo Balai Pernikahan, Telajung, Cikarang Barat, Kabupaten Bekasi, Jawa Barat 17530';
    var fallbackLatlng = new google.maps.LatLng(-6.2866, 107.0817);
    
    var mapOptions = {
        zoom: 15,

        center: fallbackLatlng,

        scrollwheel: false,
        styles: [{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]}]
    };

    var mapElement = document.getElementById('map');

    if (!mapElement) {
        return;
    }

    var map = new google.maps.Map(mapElement, mapOptions);
    var geocoder = new google.maps.Geocoder();
    var marker = new google.maps.Marker({
        position: fallbackLatlng,
        map: map,
        title: 'Omah Joglo Balai Pernikahan',
        icon: 'images/loc.png'
    });

    geocoder.geocode({ address: venueAddress }, function(results, status) {
        if (status === 'OK' && results[0]) {
            map.setCenter(results[0].geometry.location);
            marker.setPosition(results[0].geometry.location);
        }
    });
}
google.maps.event.addDomListener(window, 'load', init);