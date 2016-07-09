# -*- coding: utf-8 -*-
"""Module Views File."""
import os
from django.shortcuts import HttpResponseRedirect, render, get_object_or_404
from django.core.urlresolvers import reverse
from django.views import generic
from django.views.decorators.http import require_POST
from django.contrib.auth.models import User
from django.core.files import File

from jfu.http import upload_receive, UploadResponse, JFUResponse

from filer.models import Image as F_Image

from .models import Image
from .forms import DonationForm, SearchPlaceForm


class ClassifiedCreateView(generic.FormView):
    template_name = 'classifieds/create_classified.html'
    form_class = SearchPlaceForm


def new_classified(request):
    return render(request,
                  'classifieds/create_classified.html',
                  {
                      'donation_form': DonationForm,
                      'place_form': SearchPlaceForm
                  })


@require_POST
def upload_image(request):
    """
    Image uploading through jQuery using JFU module.

    If multiple files can be uploaded simultanuasly,
    'file' may be list of files.
    """
    file_dict = {}

    file = upload_receive(request)
    user = User.objects.get(username=request.user.username)

    try:
        file_obj = File(file, name=file)
        image = F_Image.objects.create(owner=user,
                                       original_filename=file, file=file_obj)

        instance = Image(file=image, user=user)
        instance.save()

        thumb = instance.get_file_thumbnail()
        print('Thumb', thumb)

        file_dict = {
            'name': '%s' % instance.file.label,
            'size': file.size,
            'id': instance.id,
            'url': instance.file.url,
            'thumbnailUrl': thumb.url,
            'deleteUrl': reverse('image_delete', kwargs={'pk': instance.pk}),
            'deleteType': 'POST',
        }
    except instance.DoesNotExist or image.DoesNotExist:
        print("Couldn't save Image")

    return UploadResponse(request, file_dict)

@require_POST
def delete_image(request, pk):
    success = True

    try:
        instance = Image.objects.get(pk=pk)
        instance.file.delete()
        instance.delete()
    except Image.DoesNotExist:
        success = False

    print("Delete Image", pk, "Status:", success)

    return JFUResponse(request, success)