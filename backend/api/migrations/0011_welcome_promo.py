"""
Data migration — crée le code promo BIENVENUE15 (15% de rabais, premier achat)
s'il n'existe pas encore.
"""
from django.db import migrations


def create_welcome_promo(apps, schema_editor):
    PromoCode = apps.get_model('api', 'PromoCode')
    PromoCode.objects.get_or_create(
        code='BIENVENUE15',
        defaults={
            'discount_type':  'percent',
            'discount_value': 15,
            'is_active':      True,
            'usage_limit':    None,   # illimité
            'minimum_amount': 0,
            'expires_at':     None,
        },
    )


def remove_welcome_promo(apps, schema_editor):
    PromoCode = apps.get_model('api', 'PromoCode')
    PromoCode.objects.filter(code='BIENVENUE15').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_newsletter_first_name'),
    ]

    operations = [
        migrations.RunPython(create_welcome_promo, remove_welcome_promo),
    ]
