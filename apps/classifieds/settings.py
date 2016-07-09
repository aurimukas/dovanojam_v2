# -*- coding: utf-8 -*-
import os
from django.conf import settings

CLASSIFIEDS = {
    'photo_upload_temp_dir': os.path.join(settings.MEDIA_ROOT, 'tmp'),
    'photo_upload_cls_dir': os.path.join(settings.MEDIA_ROOT, 'classifieds'),
}