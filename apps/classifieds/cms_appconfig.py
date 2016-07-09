# -*- coding: utf-8 -*-
"""CMS Apps config file."""
from django.db import models
from django.utils.translation import ugettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields
from aldryn_apphooks_config.models import AppHookConfig


class ClassifiedsCategoryConfig(TranslatableModel, AppHookConfig):
    """Classifieds Category Plugin Config."""

    translations = TranslatedFields(
        app_title=models.CharField(_('Application Title'), max_length=234),
        object_name=models.CharField(_('Object Name'), max_length=234,
                                     default='Classified'),
    )

    class Meta:
        verbose_name = _('Classifieds Config')
        verbose_name_plural = _('Classifieds Configs')

    def get_app_title(self):
        """Get App title."""
        return getattr(self, 'app_title', _('untitled'))
