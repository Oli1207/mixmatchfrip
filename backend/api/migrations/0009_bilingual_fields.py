from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_analytics'),
    ]

    operations = [
        # ── Category ─────────────────────────────────────────────────────────
        migrations.AddField(
            model_name='category',
            name='name_en',
            field=models.CharField(blank=True, max_length=100, verbose_name='Name (EN)'),
        ),

        # ── Subcategory ───────────────────────────────────────────────────────
        migrations.AddField(
            model_name='subcategory',
            name='name_en',
            field=models.CharField(blank=True, max_length=100, verbose_name='Name (EN)'),
        ),

        # ── Product — Identification ──────────────────────────────────────────
        migrations.AddField(
            model_name='product',
            name='name_en',
            field=models.CharField(blank=True, max_length=200, verbose_name='Name (EN)'),
        ),

        # ── Product — Taille ──────────────────────────────────────────────────
        migrations.AddField(
            model_name='product',
            name='size_recommendation_en',
            field=models.CharField(blank=True, max_length=200, verbose_name='Size recommendation (EN)'),
        ),

        # ── Product — Matière & Détails ───────────────────────────────────────
        migrations.AddField(
            model_name='product',
            name='material_en',
            field=models.TextField(blank=True, verbose_name='Material (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='details_en',
            field=models.TextField(blank=True, verbose_name='Cut details (EN)'),
        ),

        # ── Product — Arguments de vente ──────────────────────────────────────
        migrations.AddField(
            model_name='product',
            name='bullet_1_en',
            field=models.TextField(blank=True, verbose_name='Argument 1 (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='bullet_2_en',
            field=models.TextField(blank=True, verbose_name='Argument 2 (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='bullet_3_en',
            field=models.TextField(blank=True, verbose_name='Argument 3 (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='bullet_4_en',
            field=models.TextField(blank=True, verbose_name='Argument 4 (EN)'),
        ),

        # ── Product — Description & Conseils ──────────────────────────────────
        migrations.AddField(
            model_name='product',
            name='description_en',
            field=models.TextField(blank=True, verbose_name='Description (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='mix_match_tips_en',
            field=models.TextField(blank=True, verbose_name='Mix & Match (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='expert_tip_en',
            field=models.TextField(blank=True, verbose_name='Expert tip (EN)'),
        ),

        # ── verbose_name updates (non-breaking) ───────────────────────────────
        migrations.AlterField(
            model_name='category',
            name='name',
            field=models.CharField(max_length=100, verbose_name='Nom (FR)'),
        ),
        migrations.AlterField(
            model_name='subcategory',
            name='name',
            field=models.CharField(max_length=100, verbose_name='Nom (FR)'),
        ),
        migrations.AlterField(
            model_name='product',
            name='name',
            field=models.CharField(max_length=200, verbose_name='Nom (FR)'),
        ),
    ]
