# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-11-01 12:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0004_auto_20161028_1620'),
    ]

    operations = [
        migrations.AddField(
            model_name='exportrun',
            name='worker',
            field=models.CharField(default='', editable=False, max_length=50, null=True),
        ),
    ]