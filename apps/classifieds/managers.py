import django
from parler.managers import TranslatableManager, TranslatableQuerySet
from treebeard.mp_tree import MP_NodeManager
from treebeard.mp_tree import MP_NodeQuerySet


class CategoryQuerySet(TranslatableQuerySet, MP_NodeQuerySet):
    pass

    # Optional: make sure the Django 1.7 way of creating managers works.
    def as_manager(cls):
        manager = CategoryManager.from_queryset(cls)()
        manager._built_with_as_manager = True
        return manager
    as_manager.queryset_only = True
    as_manager = classmethod(as_manager)


class CategoryManager(MP_NodeManager, TranslatableManager):
    _queryset_class = CategoryQuerySet

    def get_queryset(self):
        # This is the safest way to combine both get_queryset() calls
        # supporting all Django versions and MPTT 0.7.x versions
        return self._queryset_class(self.model, using=self._db)

    if django.VERSION < (1, 6):
        get_query_set = get_queryset
