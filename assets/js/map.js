function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom:   14,
    center: window.locationPins[0],
    mapTypeId: 'terrain',
  });

  const bikeLayer = new google.maps.BicyclingLayer();
  bikeLayer.setMap(map);
}
