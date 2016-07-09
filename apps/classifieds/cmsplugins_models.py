# -*- coding: utf-8 -*-
"""DjangoCMS plugins models file."""
from django.utils.translation import ugettext_lazy as _
from cms.models import CMSPlugin
from aldryn_apphooks_config.fields import AppHookConfigField
from .cms_appconfig import ClassifiedsCategoryConfig


class ClassifiedsCategoryPlugin(CMSPlugin):
    """A Classified Categories Plugin for django CMS."""

    app_config = AppHookConfigField(
        ClassifiedsCategoryConfig, null=True, verbose_name=_('app. config'),
        blank=True
    )
