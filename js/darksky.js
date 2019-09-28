// Darksky JavaScript Document

// ******************** GLOBALS ********************
//
// Declare and/or Initialise all globals.
//
// **************************************************
// "use strict"; // Defines that JavaScript code should be executed in "strict mode".
var globData;
var darkSkyLocation = '';
var googleLocation = '';


// END GLOBALS

// ******************** FUNCTION ********************
//
// Function that starts API sequence upon document ready.
//
// **************************************************
$(document).ready(function () {

  geocoder = new google.maps.Geocoder();
  mapInfoWindowContent = document.createElement('div');
  infowindow = new google.maps.InfoWindow({
    content: mapInfoWindowContent
  });
  
  window.localStorage.clear();

  getCurrentLocation();

}); // END FUNCTION


// ******************** FUNCTION ********************
//
// Function that obtains the current location.
// Referenced from: Design for Dynamic Data (9349) lecture material.
//
// **************************************************
function getCurrentLocation() {
  //now get browser geo location

  // geocoder = new google.maps.Geocoder;

  if (navigator.geolocation) {

    //log the data returned through the browser geolocation api
    console.log(navigator.geolocation);

    //if able to retrive current location
    function success(pos) {
      var crd = pos.coords;

      //geocoder = new google.maps.Geocoder;

      console.log('Your current position is:');
      console.log('Latitude : ' + crd.latitude);
      console.log('Longitude: ' + crd.longitude);
      console.log('More or less ' + crd.accuracy + ' meters.');

      // Call function to set correct format of latitute and longitude for Darkski and Google Maps APIs.
      createAPILocations(crd.latitude, crd.longitude);

      //call function to get darksky api data with darkSkyLocation variable
      getWeatherData(darkSkyLocation);

    };

    //if there is an error returning the geolocation then you should identify it and resolve it
    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
      createAPILocations(-27.4698, 153.0251); // Set default location to Brisbane CBD.
      alert("No geolocation available, setting default address to Brisbane CBD.");
      //call function to get darksky api data with darkSkyLocation variable
      getWeatherData(darkSkyLocation);

    };

    //this is the line that actually prompts the user for their location
    navigator.geolocation.getCurrentPosition(success, error);

  } else {
    //if the browser doesn't support gelocation then you need to do some testing
    // ShowError(); 
  };

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Function to set correct format of latitute and longitude for Darkski and Google Maps APIs.
//
// **************************************************
function createAPILocations(lat, lng) {
  //set the darkSkyLocation variable to be in the correct format for the darksky api
  darkSkyLocation = lat + ',' + lng;
  //set the googleLocation variable to be in the correct format for the google maps api  
  googleLocation = {
    lat: lat,
    lng: lng
  };

  console.log("Google Co-ordinates = " + googleLocation.lat + " " + googleLocation.lng);

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Function that retrieves data from Darksky api.
// Referenced from: Design for Dynamic Data (9349) lecture material.
//
// **************************************************
function getWeatherData(darkSkyLocation) {

  //  Darkski api key
  var key = '4e8683792eb9a58afe24a7384aeec495';
  //  api call. units=si ensures response is in degrees celsius.
  var url = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/' + key + '/' + darkSkyLocation + '?units=si';

  $.getJSON(url, function (data) {
    //async: false;
    globData = data;
    console.log('Google coordinates' + googleLocation.lat + ' ' + googleLocation.lng);
    console.log("Data object:");
    console.log(data);
    if (globData) {

      console.log("If globData:");
      console.log(globData);

      // call function to get google map api    
      initMap(googleLocation);

    }
    // create a Date object, with data from the API and update UI for time, weather and trivia information.
    var now = new Date(data.currently.time * 1000);
    var temp = data.currently.temperature;
    var val = parseInt(temp).toString();
    console.log('Val = ' + val);
    var currently = now.toDateString() + ", " + now.toLocaleTimeString() + " Currently: " + data.currently.summary + ". Temp: " + temp + "\xB0C";
    document.getElementById('place-weather').innerHTML = currently;
    $.get('https://cors-anywhere.herokuapp.com/http://numbersapi.com/' + val + '/trivia?notfound=floor&fragment', function (data) {
      $('#temp-trivia').text('Temperature rounded to ' + val + ' is ' + data + '.');
    });

    // forecast data
     
    var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    // loop through the data
    for (var i = 0; i < data.daily.data.length; i++) {
      var f = data.daily.data[i]; // the data for one day in the forecast
      // first create a tr 
      var row = $("<tr>");
      var date = new Date(f.time * 1000); // get the forecast data time and convert it to a JS date

      if (i == 0) { // today
        row.append("<td>Today</td>");
      } else if (i == 1) { // tomorrow
        row.append("<td>Tomorrow</td>");
      } else {
        row.append("<td>" + days[date.getDay()] + "</td>");
      }

      row.append("<td>" + f.summary + "</td>");

      var temprange = $("<td class='temprange'>");

      var tempbar = $("<div class='tempbar'>");
      tempbar.append("<span class='mintemp'>" + Math.round(f.temperatureMin) + "</span>");
      tempbar.append("<span class='maxtemp'>" + Math.round(f.temperatureMax) + "</span>");

      var tempstart = -5; // start value of the temperature scale
      var tempscale = 10; // 10 pixels per degree
      var mintemp = Math.round(f.temperatureMin);
      var maxtemp = Math.round(f.temperatureMax);

      tempbar.css("left", (mintemp - tempstart) * tempscale + "px");
      tempbar.css("width", (maxtemp - mintemp) * tempscale + "px");

      temprange.append(tempbar);
      row.append(temprange);

      // append the tr to the table
      $("#forecast").append(row);

    };

  });

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Initialise Google Map including search bar with 'autocomplete'.
// Referenced from: https://developers.google.com/maps/documentation/javascript/adding-a-google-map
//
// **************************************************
function initMap(googleLocation) {

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: googleLocation
  });

  // Create the DIV to hold the control and call the CenterControl()
  // constructor passing in this DIV.
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map, googleLocation);

  centerControlDiv.index = 1;
  centerControlDiv.style['padding-top'] = '10px';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  // Google Maps Autocomplete to search for addresses.  
  var input = document.getElementById('pac-input');
  var autocomplete = new google.maps.places.Autocomplete(input);
  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);
  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(
    ['formatted_address', 'address_components', 'geometry']);

  autocomplete.addListener('place_changed', function () {
    infowindow.close();
    // marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert(place.name + " is not a valid address. Click OK to try again.");
      return;
    }

    var newAddress = String(place.geometry.location);
    getInfo(newAddress); // Extract usable lat/lng from Google Maps created object.

    document.getElementById('search-form').reset();
    console.log("googleLoc = " + googleLocation.lat + ", " + googleLocation.lng);
    console.log("Place Address = " + place.formatted_address);

  });

  geocodeLatLng(geocoder, map);

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Extract usable lat/lng from Google API created object.
//
// **************************************************
function getInfo(newAddress) {

  var input = newAddress.substring(1, newAddress.length - 1);
  var latlngStr = input.split(',', 2);
  document.getElementById('search-form').reset();

  //Update global 'Darksky' and 'Google Location' with new location co-ordinates.
  darkSkyLocation = parseFloat(latlngStr[0]) + ',' + parseFloat(latlngStr[1]);

  getWeatherData(darkSkyLocation);

  googleLocation.lat = parseFloat(latlngStr[0]);
  googleLocation.lng = parseFloat(latlngStr[1]);
  console.log("googleLoc = " + googleLocation.lat + ", " + googleLocation.lng);

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Reverse geocode latitute and longitude to obtain address.
// Referenced from: https://developers.google.com/maps/documentation/javascript/geocoding
//
// **************************************************
function geocodeLatLng(geocoder, map) {

  geocoder.geocode({
    'location': googleLocation
  }, function (results, status) {
    if (status === 'OK') {
      if (results[0]) {
        map.setZoom(12);

        var image = {
          url: "images/" + globData.currently.icon + ".png",
          // This marker is 20 pixels wide by 32 pixels high.
          size: new google.maps.Size(90, 123),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(45, 110),
          labelOrigin: new google.maps.Point(45, 62)
        };
        // Shapes define the clickable region of the icon. The type defines an HTML
        // <area> element 'poly' which traces out a polygon as a series of X,Y points.
        // The final coordinate closes the poly by connecting to the first coordinate.
        var shape = {
          coords: [1, 1, 1, 20, 18, 20, 18, 1],
          type: 'poly'
        };

        var label = globData.currently.temperature.toString() + '\xB0C';
        var marker = new google.maps.Marker({
          position: googleLocation,
          map: map,
          icon: image,
          shape: shape,
          title: 'Click for more information',
          label: label,
          zIndex: 1
        });
        marker.addListener('click', function () {
          initGraph();
          infowindow.open(map, marker);
        });

        var lat = results[0].geometry.location.lat();
        var lng = results[0].geometry.location.lng();
        var address = results[0].formatted_address;
        console.log("Geocode co-ordinates = " + lat + " " + lng + " " + address);

        document.getElementById('place-address').innerHTML = address;
        recentAddress(address);

        console.log("Geolocation = " + address);

      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
} // END FUNCTION


// ******************** FUNCTION ********************
//
// Add new address to local storage history.
//
// **************************************************
function recentAddress(address) {
  console.log('Check address ' + (localStorage.length + 1) + ' ' + address);
  var flag = 0;

  for (var i = 1; i <= localStorage.length; i++) {
    console.log('Address list ' + i + ' : ' + localStorage.getItem(i));
    if (address == localStorage.getItem(i)) {
      flag = 1;
    }
  }

  if (flag == 0) {
    if (localStorage.length == 0) {
      localStorage.setItem(1, address);
      // console.log("Set address: " + (localStorage.length) + ' ' + localStorage.getItem(1));
    } else {
      localStorage.setItem((localStorage.length + 1), address);
      // console.log("Add address: " + (localStorage.length) + ' ' + localStorage.getItem(localStorage.length));
    }

    console.log("Set address: " + (localStorage.length) + ' ' + localStorage.getItem(localStorage.length));

    var ul = document.getElementById('recent-locations');
    var li = document.createElement('li');
    li.innerHTML = '<a href="#" onclick="goToRecent(this)">' + address + '</a>';
    li.setAttribute('id', localStorage.length);
    ul.appendChild(li);
  }
} // END FUNCTION


// ******************** FUNCTION ********************
//
// Clear recent address history from local storage.
//
// **************************************************
function clearList() {

  console.log('Clear List');
  var ul = document.getElementById('recent-locations');
  for (var i = 1; i <= localStorage.length; i++) {
    var li = document.getElementById(i);
    ul.removeChild(li);
    console.log('Remove listID' + i);
  }

  window.localStorage.clear();

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Go to an address in the recent history list when user clicks on list choice.
//
// **************************************************
function goToRecent(thisID) {

  console.log('Go To Recent ID: ' + thisID.parentNode.id);
  var recent = parseInt(thisID.parentNode.id);
  console.log('Recent: ' + recent + ' type is: ' + typeof recent);
  var selectedAddress = localStorage.getItem(recent);
  console.log("*** SELECTED ADDRESS: " + selectedAddress);

  getCoordinates(selectedAddress, getWeatherData);

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Geocode address to obtain latitute and longitude.
// Inspired by: https://www.youtube.com/watch?v=OMv8gZxrwag
// Referenced from: https://developers.google.com/maps/documentation/javascript/geocoding
//
// **************************************************
function getCoordinates(address, callback) {
  geocoder.geocode({
    address: address
  }, function (results) {
    var lat = results[0].geometry.location.lat();
    var lng = results[0].geometry.location.lng();
    var address = results[0].formatted_address;
    console.log("Get co-ordinates = " + lat + " " + lng + " " + address);
    createAPILocations(lat, lng);
    callback(darkSkyLocation);
  })
} // END FUNCTION


// ******************** FUNCTION ********************
//
// Create Google Chart Visualisation and place in Google Map InfoWindow.
// Referenced from: https://developers.google.com/chart/interactive/docs/quick_start
//
// **************************************************
function initGraph() {

  google.charts.load('current', {
    'packages': ['corechart']
  });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    // Create and populate the data table taking time (hours) and temperature from the globData object.
    var hourlyDataPoints = globData.hourly.data.length;
    console.log("Hourly array length = " + hourlyDataPoints);

    var graphDataHour = [hourlyDataPoints];
    var graphDataTemp = [hourlyDataPoints];

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Temperature');

    var i = 0;
    for (i = 0; i < hourlyDataPoints; i++) {
      var time = new Date(globData.hourly.data[i].time * 1000);
      graphDataHour[i] = formatAMPM(time);
      graphDataTemp[i] = globData.hourly.data[i].temperature;
      data.addRow([graphDataHour[i], graphDataTemp[i]]);
      console.log("Time: " + graphDataHour[i] + " Temp: " + graphDataTemp[i]);
    }

    var options = {
      title: 'Temperature for next 48 hours:',
      curveType: 'function',
      legend: {
        position: 'bottom'
      },
      height: 300,
      width: 600
    };

    // Create and draw the visualization.
    var chart = new google.visualization.LineChart(mapInfoWindowContent);
    chart.draw(data, options);
    infowindow.setContent(mapInfoWindowContent);

  };

} // END FUNCTION


// ******************** FUNCTION ********************
//
// Convert time to just hour with 'am' or 'pm'.
// Based on: https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
//
// **************************************************
function formatAMPM(time) {
  var hours = time.getHours();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  var strTime = hours + ' ' + ampm;
  return strTime;
} // END FUNCTION


// ******************** FUNCTION ********************
//
// Allows user to re-centre the map the currently selected location.
// Based on: https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/examples/control-custom-state
//
// **************************************************

/**
 * The CenterControl adds a control to the map that recenters the map on
 * Chicago.
 * @constructor
 * @param {!Element} controlDiv
 * @param {!google.maps.Map} map
 * @param {?google.maps.LatLng} center
 */
function CenterControl(controlDiv, map, center) {
  // We set up a variable for this since we're adding event listeners
  // later.
  var control = this;

  // Set the center property upon construction
  control.center_ = center;
  controlDiv.style.clear = 'both';

  // Set CSS for the control border
  var goCenterUI = document.createElement('div');
  goCenterUI.id = 'goCenterUI';
  goCenterUI.title = 'Click to recenter the map';
  controlDiv.appendChild(goCenterUI);

  // Set CSS for the control interior
  var goCenterText = document.createElement('div');
  goCenterText.id = 'goCenterText';
  goCenterText.innerHTML = 'Center Map';
  goCenterUI.appendChild(goCenterText);

  // Set CSS for the setCenter control border
  var whereAmIUI = document.createElement('div');
  whereAmIUI.id = 'whereAmIUI';
  whereAmIUI.title = 'Click to find your current location';
  controlDiv.appendChild(whereAmIUI);

  // Set CSS for the control interior
  var whereAmIText = document.createElement('div');
  whereAmIText.id = 'setCenterText';
  whereAmIText.innerHTML = 'Where am I?';
  whereAmIUI.appendChild(whereAmIText);

  // Set up the click event listener for 'Center Map': Set the center of
  // the map to the current center of the control.
  goCenterUI.addEventListener('click', function () {
    var currentCenter = control.getCenter();
    map.setCenter(currentCenter);
  });

  // Set up the click event listener for 'Where am I?': Set the center of
  // the control to the current center of the map.
  whereAmIUI.addEventListener('click', function () {
    getCurrentLocation();
  });

} // END FUNCTION

/**
 * Define a property to hold the center state.
 * @private
 */
CenterControl.prototype.center_ = null;

/**
 * Gets the map center.
 * @return {?google.maps.LatLng}
 */
CenterControl.prototype.getCenter = function () {
  return this.center_;
};

/**
 * Sets the map center.
 * @param {?google.maps.LatLng} center
 */
CenterControl.prototype.setCenter = function (center) {
  this.center_ = center;
};
