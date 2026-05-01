from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_welcome_promo'),
    ]

    operations = [
        migrations.AddField(
            model_name='promocode',
            name='first_order_only',
            field=models.BooleanField(
                default=False,
                verbose_name='Premier achat uniquement',
                help_text="Si coché, le code est refusé si l'email a déjà une commande payée.",
            ),
        ),
        # Active la restriction sur BIENVENUE15 maintenant que le champ existe
        migrations.RunSQL(
            sql="UPDATE api_promocode SET first_order_only = TRUE WHERE code = 'BIENVENUE15';",
            reverse_sql="UPDATE api_promocode SET first_order_only = FALSE WHERE code = 'BIENVENUE15';",
        ),
    ]
