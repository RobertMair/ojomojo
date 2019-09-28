// JavaScript Document

function initialize() {
        var myLatlng1 = new google.maps.LatLng(-25.363882, 150.044922);
        var myLatlng2 = new google.maps.LatLng(-25.363882, 152.044922);
        var mapOptions = {
            zoom : 6,
            center : myLatlng1
        };

        var map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);

        var contentString1 = 'Mott Park'
        var contentString2 = 'Kilpa Park'

        var infowindow = new google.maps.InfoWindow({});

        var marker1 = new google.maps.Marker({
            position : myLatlng1,
            map : map,
            title : 'Park'
        });
        var marker2 = new google.maps.Marker({
            position : myLatlng2,
            map : map,
            title : 'Water'
        });
        google.maps.event.addListener(marker1, 'click', function initialize() {
            infowindow.close();//hide the infowindow
            infowindow.setContent(contentString1);//update the content for this marker
            infowindow.open(map, marker1);

        });
        google.maps.event.addListener(marker2, 'click', function initialize() {
            infowindow.close();//hide the infowindow
            infowindow.setContent(contentString2);//update the content for this marker
            infowindow.open(map, marker2);
        });
    }

    google.maps.event.addDomListener(window, 'load', initialize);