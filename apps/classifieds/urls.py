# -*- coding: utf-8 -*-
from django.conf.urls import url

from .views import upload_image, delete_image, new_classified

urlpatterns = [
    url(r'^image/upload/', view=upload_image, name='image_upload'),
    url(r'^image/delete/(?P<pk>\d+)$', view=delete_image, name='image_delete'),
    # url(r'new', view=ClassifiedCreateView.as_view(), name="new_classified")
    url(r'new', view=new_classified, name="new_classified")
]
