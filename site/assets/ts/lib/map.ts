declare global {
  interface Window {
    readonly locationPins: {
      lat:   number,
      lng:   number,
      time:  number,
      alt:   number | null,
      dist:  number | null,
      speed: number | null,
    }[];
  }
}

export default function initMap() {
  const mapEl = document.getElementById("map") as HTMLElement;


  const pins    = window.locationPins;
  const iconUrl = 'http://maps.google.com/mapfiles/kml/shapes/cycling.png';

  const map    = new google.maps.Map(mapEl, { mapTypeId: 'terrain' });
  const bounds = new google.maps.LatLngBounds();
  const info   = new google.maps.InfoWindow();

  new google.maps.BicyclingLayer().setMap(map);

  for (let pin of pins) {
    bounds.extend(pin);
  }

  map.fitBounds(bounds);

  // Cause the markers to drop in a staggered wave
  function generateNextMarker(pins: { lat: number, lng: number }[]) {
    const pin = pins.shift();

    if (!pin) {
      return;
    }

    const marker = new google.maps.Marker({
      map,
      position: pin,
      title: 'Hello World',
      animation: google.maps.Animation.DROP,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(40, 40),
      },
    });

    marker.addListener('click', () => {
      info.setContent(`${ pin.lat }/${ pin.lng }`);
      info.open({ map, anchor: marker });
    });

    if (pins.length) {
      setTimeout(() => generateNextMarker(pins), 350);
    }
  }

  generateNextMarker(pins.slice());
}
