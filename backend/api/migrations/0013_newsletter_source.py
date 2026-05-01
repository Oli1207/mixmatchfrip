from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_promocode_first_order_only'),
    ]

    operations = [
        migrations.AddField(
            model_name='newslettersubscriber',
            name='source',
            field=models.CharField(
                choices=[
                    ('popup_promo', "Popup bienvenue (code promo)"),
                    ('footer',      'Footer newsletter'),
                    ('other',       'Autre'),
                ],
                default='other',
                max_length=20,
                verbose_name="Source d'inscription",
            ),
        ),
    ]
