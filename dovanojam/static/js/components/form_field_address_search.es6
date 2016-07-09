class SearchField {

    constructor (config = {}) {
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
        }
        this.default_config = config

        this.addressForm = {
            locality: 'long_name',
            country: 'long_name'
        }

        this.initializeElements()
    }

    get mapElement () {
        return document.getElementById(this._config.map.id)
    }

    get searchFieldElement () {
        return document.getElementById(this._config.search_form.address_field_id)
    }

    get default_config () {
        return this._config
    }

    set default_config (config) {
        this._config = Object.assign(this._config, config)
    }

    initializeElements () {
        this.autocomplete = new google.maps.places.Autocomplete(this.searchFieldElement, this._config.autocomplete)

        this.autocomplete.addListener('place_changed', () => {
            let place = this.autocomplete.getPlace()
            this.updateMap(place)
        })

        this.geocoder = new google.maps.Geocoder()
        this.infoWindow = new google.maps.InfoWindow
        this.marker = null
        this.map = null

        this.geocodeFromAddress(this._config.search_form.default_address, (place) => {
            if (place) {
                this.updateMap(place)
            } else {
                this.handleLocationError(true)
            }
        })

        this.geolocalizeMe()
    }

    geolocalizeMe () {
        this.geolocalize((geolocalized) => {
            if (!geolocalized) {
                this.handleLocationError(false)
            } else {
                this.updateMap(geolocalized)
                this.fillAddressForm(geolocalized)
            }
        })
    }

    geocodeFromAddress (address = null, cb) {
        if (!address)
            address = this._config.search_form.default_address

        this.geocoder.geocode({'address': address}, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                cb(results[0])
            } else {
                cb(null);
            }
        });
    }

    geocodeFromLatLng (latlng = null, cb) {
        if (!latlng)
            return cb(null)

        this.geocoder.geocode({'location': latlng}, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK)
                return cb(results[0])

            return cb(null)
        })
    }

    fillAddressForm (place = null) {
        if (!place)
            return null

        for (var component in this.addressForm) {
            document.getElementById(component).value = ''
        }

        document.getElementById(this._config.search_form.lat_field_id).value = ''
        document.getElementById(this._config.search_form.lng_field_id).value = ''
        this.searchFieldElement.value = ''

        for(var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0]
            if (this.addressForm[addressType]) {
                var val = place.address_components[i][this.addressForm[addressType]]
                document.getElementById(addressType).value = val
            }
        }
        this.searchFieldElement.value = place.formatted_address
        document.getElementById(this._config.search_form.lat_field_id).value = place.geometry.location.lat()
        document.getElementById(this._config.search_form.lng_field_id).value = place.geometry.location.lng()
    }

    updateMap (place) {
        if (!this.map) {
            this.map = new google.maps.Map(this.mapElement, this._config.map.config)
        }

        //this.map.setCenter(place.geometry.location)
        this.map.panTo(place.geometry.location)
        this.map.setZoom(this._config.map.defaulZoom)

        // Update Search Form with the Address of the place
        this.fillAddressForm(place)

        // Update Marker ans set info Window
        this.updateMarker(place)
        this.infoWindow.setContent(place.formatted_address)
        this.infoWindow.open(this.map, this.marker)
    }

    updateMarker (place) {
        if (!this.marker) {
            this.marker = new google.maps.Marker(this.marker)
            this.marker.setMap(this.map)
        }

        this.marker.setPosition(place.geometry.location)
        if (place.icon) {
            this.marker.setIcon({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(34, 34),
                scaledSize: new google.maps.Size(35, 35)
            })
        }

    }

    geolocalize (cb) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }

                this.geocodeFromLatLng(pos, (place) => {
                    if (!place) {
                        this.handleLocationError(true, pos)
                    }

                    cb(place)
                })
            }, () => {
                cb(false)
            })
        } else {
            // Browser doesn't support Geolocation
            cb(false)
        }
    }

    handleLocationError (browserHasGeolocation = false, pos = null) {
        if (!pos)
            pos = this.map.getCenter()

        this.infoWindow.setPosition(pos)
        this.infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation services has failed' :
            'Error: Your browser doesn\'t support geolocation.'
        )
    }
}

(function ($) {
    'use strict'

    var SearchForm = null
    google.maps.event.addDomListener(window, 'load', () => {
        SearchForm = new SearchField()
        google.maps.event.addListener(SearchForm.infoWindow, 'content_changed', () => {
            Materialize.updateTextFields()
        })
    })

    $(document).ready(function () {

        $('form#create_classified').on('keypress', (event) => {
            // If Keyboard ENTER beeing pressed
            if (event.which === 13) {
                event.preventDefault()
                return false
            }
        })

        $('a.localize-me').on('click tap', function (e) {
            $('.progress', '#map').show()
            SearchForm.geolocalizeMe()
            e.preventDefault()
            return false
        });
    });

})(jQuery);
