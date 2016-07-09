from cms.app_base import CMSApp
from cms.apphook_pool import apphook_pool
from django.utils.translation import ugettext_lazy as _


class ClassifiedsApphook(CMSApp):
    name = _('Classifieds App')
    _urls = ["apps.classifieds.urls"]

apphook_pool.register(ClassifiedsApphook)
