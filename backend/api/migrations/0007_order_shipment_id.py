from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_newslettersubscriber'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='shipment_id',
            field=models.CharField(blank=True, max_length=100, verbose_name='Chit Chats Shipment ID'),
        ),
    ]
