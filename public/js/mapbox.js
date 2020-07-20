/* eslint-disable */


//<div id='map' style='width: 400px; height: 300px;'></div>
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYXJ0b2Z1IiwiYSI6ImNrYzZxdXI0eTBwc3UzM3Q2YXA4NzhkcnkifQ.80OZIk2Nh3aCUgJMo07FJw';
  const array = locations[0].coordinates;

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/artofu/ckc6ra7421jsg1inv2na6esr7',
    scrollZoom: false,
    // center: array,
    //zoom: 1,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((el) => {
    // Create Marker
    const ele = document.createElement('div');
    ele.className = 'marker';

    // Add Marker
    var marker = new mapboxgl.Marker({
      element: ele,

      anchor: 'bottom', // THE BOTTOM OF THE ELEMENT WICH IS GONNA BE LOCATED IN THE GPS LOCATION
    })
      .setLngLat(el.coordinates)
      .setPopup(
        new mapboxgl.Popup({
          offset: 30,
          className: 'map-popup',
          closeOnClick: false,
        }).setHTML(`<p>${el.description}</p>`)
      )
      .addTo(map);

    marker.togglePopup(); // toggle popup open or closed
    // Add Popup
    // new mapboxgl.Popup({
    //     offset: 30
    // })
    // .setLngLat(el.coordinates)
    // .setHTML(`<p>Day ${el.day}: ${el.description}</p>`)
    // .addTo(map)

    // Extends map bounds to include the current location
    bounds.extend(el.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    },
  });
};