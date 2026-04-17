# Generated manually — adds account_created flag to Order

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_promocode'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='account_created',
            field=models.BooleanField(default=False),
        ),
    ]
