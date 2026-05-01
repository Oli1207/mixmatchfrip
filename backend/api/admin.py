from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Subcategory, Product, ProductImage,
    Wishlist, Cart, CartItem,
    Order, OrderItem, NewsletterSubscriber
)



admin.site.register(NewsletterSubscriber)
# ─── Category & Subcategory ───────────────────────────────────────────────────



class SubcategoryInline(admin.TabularInline):
    model  = Subcategory
    extra  = 2
    fields = ['name', 'name_en', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'name_en', 'slug', 'subcategory_count']
    prepopulated_fields = {'slug': ('name',)}
    inlines             = [SubcategoryInline]
    fieldsets = (
        ('Nom de la catégorie', {
            'fields': (('name', 'name_en'), 'slug', 'image'),
            'description': '🇫🇷 Nom (FR) — obligatoire &nbsp;&nbsp;|&nbsp;&nbsp; 🇬🇧 Name (EN) — optionnel, affiché en anglais',
        }),
    )

    def subcategory_count(self, obj):
        return obj.subcategories.count()
    subcategory_count.short_description = 'Sous-catégories'


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'name_en', 'category', 'slug']
    list_filter         = ['category']
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        ('Nom de la sous-catégorie', {
            'fields': ('category', ('name', 'name_en'), 'slug'),
            'description': '🇫🇷 Nom (FR) — obligatoire &nbsp;&nbsp;|&nbsp;&nbsp; 🇬🇧 Name (EN) — optionnel',
        }),
    )


# ─── Product ─────────────────────────────────────────────────────────────────

class ProductImageInline(admin.TabularInline):
    model   = ProductImage
    extra   = 3
    fields  = ['image', 'is_main', 'order', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:80px;border-radius:4px;"/>', obj.image.url)
        return '-'
    image_preview.short_description = 'Apercu'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ['name', 'brand', 'category', 'subcategory', 'price', 'size_tag', 'condition_badge', 'stock', 'is_available']
    list_filter    = ['category', 'subcategory', 'condition', 'is_available']
    search_fields  = ['name', 'brand']
    list_editable  = ['is_available', 'stock']
    prepopulated_fields = {'slug': ('brand', 'name')}
    inlines        = [ProductImageInline]

    fieldsets = (
        # ── 1. Identification ─────────────────────────────────────────────────
        ('Identification', {
            'fields': (
                ('category', 'subcategory'),
                ('name', 'name_en'),
                'brand',
                'slug',
            ),
            'description': '🇫🇷 Champs FR — obligatoires &nbsp;|&nbsp; 🇬🇧 Champs EN — optionnels (laissez vide = même que le FR)',
        }),

        # ── 2. État & Disponibilité ───────────────────────────────────────────
        ('État & Disponibilité', {
            'fields': (
                'condition',
                ('stock', 'is_available'),
            ),
        }),

        # ── 3. Prix ───────────────────────────────────────────────────────────
        ('Prix', {
            'fields': (('price', 'original_price'),),
            'description': 'La réduction sera calculée automatiquement si les deux prix sont renseignés.',
        }),

        # ── 4. Taille ─────────────────────────────────────────────────────────
        ('Taille', {
            'fields': (
                'size',
                'size_tag',
                ('size_recommendation', 'size_recommendation_en'),
            ),
            'description': (
                '<strong>Taille standard</strong> : pour les filtres du catalogue. '
                '<strong>Taille indiquée</strong> : ce qui est écrit sur l\'étiquette (ex: 10, L/G, 8P). '
                '<strong>Recommandation (FR/EN)</strong> : votre conseil client — ex: Convient à un 8 ajusté / Fits a slim size 8.'
            ),
        }),

        # ── 5. Mesures à plat ─────────────────────────────────────────────────
        ('Mesures à plat (cm) — pas de traduction nécessaire', {
            'fields': (
                ('measure_shoulder', 'measure_chest'),
                ('measure_waist', 'measure_hips'),
                ('measure_length', 'measure_sleeve'),
            ),
            'description': 'Toutes les mesures sont prises à plat, en centimètres. Laissez vide si non applicable.',
            'classes': ('collapse',),
        }),

        # ── 6. Matière & Détails ──────────────────────────────────────────────
        ('Matière & Détails de coupe', {
            'fields': (
                'material',
                'material_en',
                'details',
                'details_en',
                'color',
            ),
            'description': (
                '🇫🇷 <strong>Matière (FR)</strong> : ex: Crêpe de polyester, légèrement extensible, entièrement doublée. '
                '🇬🇧 <strong>Material (EN)</strong> : ex: Polyester crepe, slightly stretchy, fully lined. '
                '<br>Couleurs : codes hex en JSON, ex: ["#FF0000", "#000000"]'
            ),
        }),

        # ── 7. Arguments de vente ─────────────────────────────────────────────
        ('Arguments de vente (affichés près du prix)', {
            'fields': (
                ('bullet_1', 'bullet_1_en'),
                ('bullet_2', 'bullet_2_en'),
                ('bullet_3', 'bullet_3_en'),
                ('bullet_4', 'bullet_4_en'),
            ),
            'description': (
                'Chaque ligne = un argument court. 🇫🇷 à gauche, 🇬🇧 à droite. '
                'Ex FR : "Coupe impeccable — rouge vibrant, assurance garantie." '
                'Ex EN : "Impeccable cut — vibrant red, confidence guaranteed."'
            ),
        }),

        # ── 8. Description & Conseils ─────────────────────────────────────────
        ('Description complète', {
            'fields': (
                'description',
                'description_en',
            ),
            'description': '🇫🇷 Texte long de présentation de la pièce — 🇬🇧 English version (optionnel).',
        }),

        ('Mix & Match', {
            'fields': (
                'mix_match_tips',
                'mix_match_tips_en',
            ),
            'description': '3 idées de tenues, une par ligne. Commencez chaque ligne par un tiret -.',
        }),

        ('Conseil expert', {
            'fields': (
                'expert_tip',
                'expert_tip_en',
            ),
            'description': 'Votre conseil personnalisé pour porter cette pièce / Your personal tip for wearing this piece.',
        }),

        # ── 9. Logistique ─────────────────────────────────────────────────────
        ('Logistique', {
            'fields': ('weight_g',),
            'classes': ('collapse',),
            'description': 'Poids en grammes — utilisé pour calculer les frais de port Chit Chats.',
        }),
    )

    def condition_badge(self, obj):
        colors = {
            'new_with_tags': ('#1a7a4a', '#e8f5ee'),
            'excellent':     ('#1a7a4a', '#e8f5ee'),
            'very_good':     ('#2563eb', '#eff6ff'),
            'good':          ('#b45309', '#fffbeb'),
        }
        color, bg = colors.get(obj.condition, ('#666', '#f5f5f5'))
        return format_html(
            '<span style="background:{};color:{};padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            bg, color, obj.get_condition_display()
        )
    condition_badge.short_description = 'Etat'


# ─── Wishlist ─────────────────────────────────────────────────────────────────

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter  = ['created_at']


# ─── Cart ─────────────────────────────────────────────────────────────────────

class CartItemInline(admin.TabularInline):
    model  = CartItem
    extra  = 0
    fields = ['product', 'qty']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display    = ['cart_id', 'user', 'item_count', 'total', 'created_at']
    inlines         = [CartItemInline]
    readonly_fields = ['cart_id', 'created_at', 'updated_at']


# ─── Order ────────────────────────────────────────────────────────────────────

class OrderItemInline(admin.TabularInline):
    model           = OrderItem
    extra           = 0
    fields          = ['product_name', 'product_brand', 'unit_price', 'qty']
    readonly_fields = ['product_name', 'product_brand', 'unit_price', 'qty']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ['order_number', 'user', 'status', 'total', 'is_paid', 'created_at']
    list_filter     = ['status', 'is_paid', 'shipping_method']
    search_fields   = ['order_number', 'email', 'first_name', 'last_name']
    readonly_fields = ['order_number', 'payment_ref', 'paid_at', 'created_at', 'updated_at']
    inlines         = [OrderItemInline]
    list_editable   = ['status']

