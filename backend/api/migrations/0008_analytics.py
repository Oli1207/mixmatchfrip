from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_order_shipment_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AnalyticsSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('session_id', models.CharField(db_index=True, max_length=64, unique=True)),
                ('utm_source', models.CharField(blank=True, db_index=True, max_length=200)),
                ('utm_medium', models.CharField(blank=True, max_length=200)),
                ('utm_campaign', models.CharField(blank=True, db_index=True, max_length=200)),
                ('utm_content', models.CharField(blank=True, max_length=200)),
                ('utm_term', models.CharField(blank=True, max_length=200)),
                ('referrer', models.TextField(blank=True)),
                ('referrer_domain', models.CharField(blank=True, db_index=True, max_length=255)),
                ('landing_page', models.CharField(blank=True, max_length=500)),
                ('device_type', models.CharField(choices=[('mobile', 'Mobile'), ('tablet', 'Tablette'), ('desktop', 'Ordinateur'), ('unknown', 'Inconnu')], default='unknown', max_length=20)),
                ('user_agent', models.TextField(blank=True)),
                ('page_views', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='analytics_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='AnalyticsEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('event_type', models.CharField(choices=[('page_view', 'Vue de page'), ('view_product', 'Vue produit'), ('add_to_cart', 'Ajout panier'), ('remove_from_cart', 'Retrait panier'), ('add_to_wishlist', 'Ajout wishlist'), ('begin_checkout', 'Début checkout'), ('checkout_step', 'Étape checkout'), ('purchase', 'Achat'), ('search', 'Recherche'), ('newsletter_sub', 'Inscription newsletter')], db_index=True, max_length=50)),
                ('page', models.CharField(blank=True, max_length=500)),
                ('properties', models.JSONField(blank=True, default=dict)),
                ('timestamp', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='api.analyticssession')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-timestamp']},
        ),
        migrations.AddIndex(
            model_name='analyticssession',
            index=models.Index(fields=['created_at'], name='api_anlytcs_created_idx'),
        ),
        migrations.AddIndex(
            model_name='analyticssession',
            index=models.Index(fields=['utm_source', 'utm_campaign'], name='api_anlytcs_utm_idx'),
        ),
        migrations.AddIndex(
            model_name='analyticsevent',
            index=models.Index(fields=['event_type', 'timestamp'], name='api_evt_type_ts_idx'),
        ),
        migrations.AddIndex(
            model_name='analyticsevent',
            index=models.Index(fields=['session', 'timestamp'], name='api_evt_session_ts_idx'),
        ),
    ]
