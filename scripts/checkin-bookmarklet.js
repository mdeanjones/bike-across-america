javascript: (() => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy, altitude } = pos.coords;
      alert(`Captured { lat: ${ latitude }, lng: ${ longitude }, accuracy: ${ accuracy } }`);

      function findElementWithText(querySelector, searchTerm) {
        return [...document.querySelectorAll(querySelector)].find(
          item => item.textContent.toLowerCase().includes(searchTerm)
        );
      }

      try {
        findElementWithText('details summary', 'run workflow').click();

        setTimeout(() => {
          document.querySelector('[name="inputs[latitude]"]').value  = latitude;
          document.querySelector('[name="inputs[longitude]"]').value = longitude;
          document.querySelector('[name="inputs[accuracy]"]').value  = accuracy;
          document.querySelector('[name="inputs[altitude]"]').value  = altitude;

          findElementWithText('button[type="submit"]', 'run workflow').click();
        }, 500);
      }
      catch (err) {
        alert(`Error: ${ err.code } - ${ err.message }`);
      }
    },

    (err) => alert(`Error: ${ err.code } - ${ err.message }`)
  );
})();