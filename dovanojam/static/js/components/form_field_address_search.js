'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchField = function () {
    function SearchField() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, SearchField);

        this._config = {
            map: {
                id: "map",
                defaulZoom: 14,
                config: {
                    zoom: 13,
                    scrollWheel: false,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: { lat: 47.658236, lng: -2.7608470000000125 }
                }
            },
            marker: {
                position: null,
                map: null,
                animation: google.maps.Animation.DROP
            },
            autocomplete: {
                types: ['geocode']
            },
            search_form: {
                address_field_id: 'city_search_field',
                default_address: 'Vannes, France',
                lat_field_id: 'lat_field',
                lng_field_id: 'lng_field'
            }
        };
        this.default_config = config;

        this.addressForm = {
            locality: 'long_name',
            country: 'long_name'
        };

        this.initializeElements();
    }

    _createClass(SearchField, [{
        key: 'initializeElements',
        value: function initializeElements() {
            var _this = this;

            this.autocomplete = new google.maps.places.Autocomplete(this.searchFieldElement, this._config.autocomplete);

            this.autocomplete.addListener('place_changed', function () {
                var place = _this.autocomplete.getPlace();
                _this.updateMap(place);
            });

            this.geocoder = new google.maps.Geocoder();
            this.infoWindow = new google.maps.InfoWindow();
            this.marker = null;
            this.map = null;

            this.geocodeFromAddress(this._config.search_form.default_address, function (place) {
                if (place) {
                    _this.updateMap(place);
                } else {
                    _this.handleLocationError(true);
                }
            });

            this.geolocalizeMe();
        }
    }, {
        key: 'geolocalizeMe',
        value: function geolocalizeMe() {
            var _this2 = this;

            this.geolocalize(function (geolocalized) {
                if (!geolocalized) {
                    _this2.handleLocationError(false);
                } else {
                    _this2.updateMap(geolocalized);
                    _this2.fillAddressForm(geolocalized);
                }
            });
        }
    }, {
        key: 'geocodeFromAddress',
        value: function geocodeFromAddress() {
            var address = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
            var cb = arguments[1];

            if (!address) address = this._config.search_form.default_address;

            this.geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    cb(results[0]);
                } else {
                    cb(null);
                }
            });
        }
    }, {
        key: 'geocodeFromLatLng',
        value: function geocodeFromLatLng() {
            var latlng = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
            var cb = arguments[1];

            if (!latlng) return cb(null);

            this.geocoder.geocode({ 'location': latlng }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) return cb(results[0]);

                return cb(null);
            });
        }
    }, {
        key: 'fillAddressForm',
        value: function fillAddressForm() {
            var place = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            if (!place) return null;

            for (var component in this.addressForm) {
                document.getElementById(component).value = '';
            }

            document.getElementById(this._config.search_form.lat_field_id).value = '';
            document.getElementById(this._config.search_form.lng_field_id).value = '';
            this.searchFieldElement.value = '';

            for (var i = 0; i < place.address_components.length; i++) {
                var addressType = place.address_components[i].types[0];
                if (this.addressForm[addressType]) {
                    var val = place.address_components[i][this.addressForm[addressType]];
                    document.getElementById(addressType).value = val;
                }
            }
            this.searchFieldElement.value = place.formatted_address;
            document.getElementById(this._config.search_form.lat_field_id).value = place.geometry.location.lat();
            document.getElementById(this._config.search_form.lng_field_id).value = place.geometry.location.lng();
        }
    }, {
        key: 'updateMap',
        value: function updateMap(place) {
            if (!this.map) {
                this.map = new google.maps.Map(this.mapElement, this._config.map.config);
            }

            //this.map.setCenter(place.geometry.location)
            this.map.panTo(place.geometry.location);
            this.map.setZoom(this._config.map.defaulZoom);

            // Update Search Form with the Address of the place
            this.fillAddressForm(place);

            // Update Marker ans set info Window
            this.updateMarker(place);
            this.infoWindow.setContent(place.formatted_address);
            this.infoWindow.open(this.map, this.marker);
        }
    }, {
        key: 'updateMarker',
        value: function updateMarker(place) {
            if (!this.marker) {
                this.marker = new google.maps.Marker(this.marker);
                this.marker.setMap(this.map);
            }

            this.marker.setPosition(place.geometry.location);
            if (place.icon) {
                this.marker.setIcon({
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(34, 34),
                    scaledSize: new google.maps.Size(35, 35)
                });
            }
        }
    }, {
        key: 'geolocalize',
        value: function geolocalize(cb) {
            var _this3 = this;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    _this3.geocodeFromLatLng(pos, function (place) {
                        if (!place) {
                            _this3.handleLocationError(true, pos);
                        }

                        cb(place);
                    });
                }, function () {
                    cb(false);
                });
            } else {
                // Browser doesn't support Geolocation
                cb(false);
            }
        }
    }, {
        key: 'handleLocationError',
        value: function handleLocationError() {
            var browserHasGeolocation = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var pos = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            if (!pos) pos = this.map.getCenter();

            this.infoWindow.setPosition(pos);
            this.infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation services has failed' : 'Error: Your browser doesn\'t support geolocation.');
        }
    }, {
        key: 'mapElement',
        get: function get() {
            return document.getElementById(this._config.map.id);
        }
    }, {
        key: 'searchFieldElement',
        get: function get() {
            return document.getElementById(this._config.search_form.address_field_id);
        }
    }, {
        key: 'default_config',
        get: function get() {
            return this._config;
        },
        set: function set(config) {
            this._config = Object.assign(this._config, config);
        }
    }]);

    return SearchField;
}();

(function ($) {
    'use strict';

    var SearchForm = null;
    google.maps.event.addDomListener(window, 'load', function () {
        SearchForm = new SearchField();
        google.maps.event.addListener(SearchForm.infoWindow, 'content_changed', function () {
            Materialize.updateTextFields();
        });
    });

    $(document).ready(function () {

        $('form#create_classified').on('keypress', function (event) {
            // If Keyboard ENTER beeing pressed
            if (event.which === 13) {
                event.preventDefault();
                return false;
            }
        });

        $('a.localize-me').on('click tap', function (e) {
            $('.progress', '#map').show();
            SearchForm.geolocalizeMe();
            e.preventDefault();
            return false;
        });
    });
})(jQuery);

//# sourceMappingURL=form_field_address_search.js.map