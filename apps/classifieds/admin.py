# -*- coding: utf-8 -*-
"""Admin classes module."""
from django.contrib import admin
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory
from .models import Category


@admin.register(Category)
class CategoryAdmin(TreeAdmin):
    """Category admin class for django admin."""

    form = movenodeform_factory(Category)

    # list_display_links = ('indented_title', ),

    # def get_prepopulated_fields(self, request, obj=None):
    #    return {'slug': ('name', )}
