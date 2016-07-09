# -*- coding: utf-8 -*-
import os
from django.apps import AppConfig
from django.conf import settings

from .settings import CLASSIFIEDS


class ClassifiedsConfig(AppConfig):
    name = 'apps.classifieds'
    verbose_name = "Classifieds"

    def ready(self):
        super(ClassifiedsConfig, self).ready()
        self._patch_settings()
        self._create_photo_uploads_folders()

    @staticmethod
    def _patch_settings():
        if not hasattr(settings, 'CLASSIFIEDS'):
            settings.CLASSIFIEDS = CLASSIFIEDS
        else:
            settings.CLASSIFIEDS.update(CLASSIFIEDS)

    @staticmethod
    def _create_photo_uploads_folders():
        if not os.path.isdir(settings.CLASSIFIEDS['photo_upload_temp_dir']):
            os.mkdir(settings.CLASSIFIEDS['photo_upload_temp_dir'])
        if not os.path.isdir(settings.CLASSIFIEDS['photo_upload_cls_dir']):
            os.mkdir(settings.CLASSIFIEDS['photo_upload_cls_dir'])

