from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_bilingual_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='newslettersubscriber',
            name='first_name',
            field=models.CharField(blank=True, max_length=100, verbose_name='Prénom'),
        ),
    ]
