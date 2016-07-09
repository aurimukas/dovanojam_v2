# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand, CommandError
from ...models import _create_filer_thumbs


class Command(BaseCommand):
    help = 'Creates a basic Filler Thumb options for Classifieds app'

    def handle(self, *args, **options):
        created = _create_filer_thumbs()
        self.stdout.write(self.style.SUCCESS("Successfully create following thumbs: %s" % ', '.join(created)))