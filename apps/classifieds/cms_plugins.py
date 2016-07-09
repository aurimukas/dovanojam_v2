# -*- coding: utf-8 -*-
"""DJANGO-CMS Plugin module."""
from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from django.utils.translation import ugettext_lazy as _
from .models import Category


class CategoryList(CMSPluginBase):
    """Category List Plugin."""

    module = _("Classifieds")
    name = _("Category Listing Plugin")
    render_template = "classifieds/cms_plugins/categories_list.html"

    def render(self, context, instance, placeholder):
        """Render function."""
        context.update({'roots': Category.get_root_nodes()})
        return context


plugin_pool.register_plugin(CategoryList)
