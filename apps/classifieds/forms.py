from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Div, HTML, Fieldset

from .models import Donation, Category, Place


class GoogleSearchAddressField(forms.CharField):
    template_name = "classifieds/form_fields/address_search_field.html"


class DonationForm(forms.ModelForm):

    category = forms.ChoiceField(label="Category",
                                 choices=Category().choices_list(),
                                 required=True)

    class Meta:
        model = Donation
        exclude = ['classified_type', 'user', 'status', 'slug']

    def __init__(self, *args, **kwargs):
        super(DonationForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = "donation-form"
        self.helper.form_class = "donation-form col s12"
        self.helper.include_media = False
        self.helper.form_tag = False

        self.helper.layout = Layout(
            Div(
                HTML("<h4>Your Classified</h4>"),
                Field('category', wrapper_class="col s12 m8 l6"),
                Field('title', css_class="validate",
                      wrapper_class="col s12 m10 l8"),
                Field('description', css_class="materialize-textarea",
                      wrapper_class="col s12 m10 l8"),
                css_class='row card-panel'
            ),
        )


class SearchPlaceForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(SearchPlaceForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.form_id = "place-form"
        self.helper.form_class = "place-form col s12"
        self.helper.include_media = False

        self.helper.layout = Layout(
            Div(
                HTML("<h4>Add Your Address</h4>"),
                Div(
                    Field('address',
                          template="classifieds/form_fields/address_search_field.html",
                          css_class="validate active",
                          placeholder="Start typing city name",
                          id="city_search_field",
                          wrapper_class="row"),
                    Div(
                        Field('city',
                              disabled=True,
                              id="locality",
                              wrapper_class="col s6"),
                        Field('country',
                              disabled=True,
                              id="country",
                              wrapper_class="col s6"),
                        css_class='row'
                    ),
                    Field('location', type='hidden', id="lat_field"),
                    Field('location', type='hidden', id="lng_field"),
                    template="classifieds/form_fields/address_search_block.html",
                    css_class="col s12 m6"
                ),
                css_class="row card-panel address-search"
            ),
        )


    class Meta:
        model = Place
        exclude = []
        widgets = {

        }


    class Media:
        js = (
            'http://maps.google.com/maps/api/js?key=AIzaSyAdQWxytU2D9qCYC0OrnwJHNdsAgc3hrlw&libraries=places',
            'js/libs/gmaps.js',
            'js/components/form_field_address_search.js',
        )