# -*- coding: utf-8 -*-
"""Classifieds Module models file."""
import datetime
from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from treebeard.mp_tree import MP_Node
from filer.fields.image import FilerImageField
from filer.models.thumbnailoptionmodels import ThumbnailOption
from filer.models.abstract import BaseImage as FilerBaseImage
from django_extensions.db.models import (
    TimeStampedModel,
    TitleSlugDescriptionModel,
)
from django_extensions.db.fields import AutoSlugField
from parler.models import TranslatableModel, TranslatedFields

from .settings import CLASSIFIEDS as APP_CLASSIFIEDS


CLASSIFIEDS_THUMBS = [
    {
        "name": "upload_card_thumb",
        "width": 230,
        "height": 300,
        "crop": False,
        "upscale": True
    },
]


class ClassifiedBase(TimeStampedModel, TitleSlugDescriptionModel):
    """A Base Classfied Class."""

    STATUS_NEW = 1
    STATUS_ACTIVE = 2
    STATUS_DISABLED = 3
    STATUS_OUTDATED = 4
    STATUS_COMPLETED = 5
    STATUS_DELETED = 99

    CLASSIFIED_TYPE_DONATION = 1
    CLASSIFIED_TYPE_DEMAND = 2

    STATUS_CHOICES = (
            (STATUS_NEW, _("New")),
            (STATUS_ACTIVE, _("Active")),
            (STATUS_DISABLED, _("Disabled")),
            (STATUS_OUTDATED, _("Outdated")),
            (STATUS_COMPLETED, _("Completed")),
            (STATUS_DELETED, _("Deleted")),
        )
    CLASSIFIED_TYPE_CHOICES = (
            (CLASSIFIED_TYPE_DONATION, _('Classified for donation')),
            (CLASSIFIED_TYPE_DEMAND, _('Classified for demanding')),
        )

    user = models.ForeignKey(User, verbose_name=_('User'),
                             related_name='classifieds')

    status = models.SmallIntegerField(_("Status"), blank=True, null=True,
                                      help_text=_("Classifieds Status"),
                                      choices=STATUS_CHOICES,
                                      default=STATUS_NEW)

    classified_type = models.SmallIntegerField(
        null=True, blank=True, verbose_name=_("Classified Type"),
        default=CLASSIFIED_TYPE_DONATION, choices=CLASSIFIED_TYPE_CHOICES)

    active_till = models.DateField(verbose_name=_('Active Till'),
                                   null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ['modified', 'created']


class Category(MP_Node, TimeStampedModel):
    """Category Model to create a classifieds categories."""

    name = models.CharField(_("Name"), max_length=255, blank=False, null=False)
    slug = AutoSlugField(_("Slug"), max_length=255, populate_from="name")
    icon = models.CharField(_("Category Icon"), max_length=32, blank=True,
                            null=True, default="info_outline")
    icon_type = models.CharField(_("Icon Library to Use"), max_length=32,
                                 blank=True, null=True, default="materialize")
    badge_color = models.CharField(_("Category Badge Color"), max_length=32,
                                   blank=True, null=True, default="red")

    node_order_by = ['name']

    class Meta:
        verbose_name = _('Classifieds Category')
        verbose_name_plural = _('Classifieds Categories')

    def __str__(self):
        """Return Object as Category Name."""
        return self.name

    @property
    def count(self):
        """Return classifieds quantity in category."""
        return self.classifieds.count()

    def choices_list(self):
        """Generate Choices list for a Select Form Field"""
        result = list()
        roots = self.__class__.get_root_nodes()
        for root in roots:
            childs = list((i.id, i.name) for i in root.get_children())
            if len(childs):
                result.append((root.name, childs))

        return result


class Place(models.Model):
    """Place Object which defines an address of the classified."""

    city = models.CharField(verbose_name=_('City'), max_length=128,
                            null=False, blank=False)
    address = models.CharField(verbose_name=_('Address'), max_length=256,
                               null=False, blank=False)
    location = JSONField(verbose_name=_("Location object"))
    country = models.CharField(verbose_name=_('Country'), max_length=64,
                               null=False, blank=False)


class Donation(ClassifiedBase):
    """Classified Object for donating things."""

    category = models.ForeignKey(Category, verbose_name=_('Category'),
                                 related_name='classifieds')
    place = models.ForeignKey(Place, verbose_name=_("Place"),
                              related_name='classifieds')


class Image(TimeStampedModel):
    """Image object related to Classifieds Object."""

    upload_dir = settings.CLASSIFIEDS['photo_upload_temp_dir'] \
        if hasattr(settings, 'CLASSIFIEDS') \
        else APP_CLASSIFIEDS['photo_upload_temp_dir']

    file = FilerImageField(null=False, blank=False,
                           related_name="classified_image")
    user = models.ForeignKey(User, verbose_name=_("Uploaded By"),
                             related_name="photos")
    classified = models.ForeignKey(Donation, blank=True, null=True,
                                   verbose_name="Classified Image",
                                   related_name="images")

    def get_file_thumbnail(self, thumbnail="upload_card_thumb"):
        thumb = None
        try:
            thumbnail_options = ThumbnailOption.objects.get(name=thumbnail).as_dict
            thumbnailer = self.file.easy_thumbnails_thumbnailer
            thumb = thumbnailer.get_thumbnail(thumbnail_options)
        except ObjectDoesNotExist:
            print("Selected Thumbnail Name does not exists")

        return thumb


def _create_filer_thumbs():
    created_thumbs = []
    for thumb in CLASSIFIEDS_THUMBS:
        try:
            ThumbnailOption.objects.get(name=thumb["name"])
        except ObjectDoesNotExist:
            new_thumb = ThumbnailOption()
            for k, v in thumb.items():
                setattr(new_thumb, k, v)
            try:
                new_thumb.save()
                created_thumbs.append(thumb['name'])
            except new_thumb.DoesNotExist:
                print("There were problems while trying to create a Thumb Option:", thumb)

    return created_thumbs
