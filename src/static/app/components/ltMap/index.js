import template from './ltMap.pug';

let layerFromLocalStorage;

class ltMap {
  constructor($scope, localStorageService) {
    Object.assign(this, {$scope, localStorageService});
    layerFromLocalStorage = this.localStorageService.get('mapLayer') || 'OSM';
  }

  mapInit(L, map) {
    ltMap._mapInit(L, map);
  }

  static _mapInit(L, map) {
    const external = '<svg class="octicon"><use xlink:href="#link-external"></use></svg>';
    const attribution = `<a href="https://www.openstreetmap.org/copyright" target="_blank">
      OpenStreetMap</a> contributors`;
    const wm = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
      name: 'Wikimedia maps',
      maxZoom: 18,
      attribution: 'Wikimedia maps | Map data &copy; ' + attribution
    });
    const osm = L.tileLayer('https://tiles.wmflabs.org/osm/{z}/{x}/{y}.png', {
      name: 'OSM @wmflabs.org',
      maxZoom: 18,
      attribution
    });
    const osmOrg = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      name: `OSM ${external}`,
      maxZoom: 19,
      attribution
    });
    const layersControl = L.control.layers().addTo(map);
    const layers = [osmOrg, osm, wm];
    layers.forEach(l => layersControl.addBaseLayer(l, l.options.name));
    const activeLayer = layers.filter(l => l.options.name === layerFromLocalStorage).shift() || osm;
    activeLayer.addTo(map);
    new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.OpenStreetMap(),
      showMarker: false
    }).addTo(map);
  }

  mapClick($event) {
    // http://leafletjs.com/reference.html#mouse-event
    const {latlng: {lat, lng}, originalEvent: {shiftKey}} = $event;
    if (lat && lng) {
      const target = shiftKey ? this.mapObjectLocation : this.mapMarker;
      const coordinates = target.withLatLng({
        lat: roundToPrecision(lat),
        lng: roundToPrecision(lng)
      });
      this.$scope.$emit('coordinatesChanged', coordinates);
    }
  }

  markerMoveend($event, target) {
    const {lat, lng} = $event.target.getLatLng();
    if (lat && lng) {
      const coordinates = target.withLatLng({
        lat: roundToPrecision(lat),
        lng: roundToPrecision(lng)
      });
      this.$scope.$emit('coordinatesChanged', coordinates);
    }
  }

  mapLayerChange($event) {
    this.localStorageService.set('mapLayer', $event.name);
  }
}
ltMap.$inject = ['$scope', 'localStorageService'];

export default {
  bindings: {
    mapView: '<',
    mapMarker: '<',
    mapObjectLocation: '<'
  },
  template,
  controller: ltMap
};

function roundToPrecision(value, precision = 10e7) {
  return value * precision % 1 ? Math.round(value * precision) / precision : value;
}
