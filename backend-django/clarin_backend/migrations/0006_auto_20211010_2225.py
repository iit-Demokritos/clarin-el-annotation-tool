# Generated by Django 3.1.7 on 2021-10-10 19:25

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clarin_backend', '0005_auto_20211010_2127'),
    ]

    operations = [
        migrations.AlterField(
            model_name='buttonannotators',
            name='created_at',
            field=models.DateTimeField(default=datetime.datetime.today, verbose_name='created_at'),
        ),
        migrations.AlterField(
            model_name='buttonannotators',
            name='updated_at',
            field=models.DateTimeField(default=datetime.datetime.today, verbose_name='updated_at'),
        ),
        migrations.AlterField(
            model_name='coreferenceannotators',
            name='created_at',
            field=models.DateTimeField(default=datetime.datetime.today, verbose_name='created_at'),
        ),
        migrations.AlterField(
            model_name='coreferenceannotators',
            name='updated_at',
            field=models.DateTimeField(default=datetime.datetime.today, verbose_name='updated_at'),
        ),
    ]