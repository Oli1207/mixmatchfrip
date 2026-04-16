from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Subcategory, Product, ProductImage,
    Wishlist, Cart, CartItem,
    Order, OrderItem,
)


# ─── Category & Subcategory ───────────────────────────────────────────────────

class SubcategoryInline(admin.TabularInline):
    model  = Subcategory
    extra  = 2
    fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug', 'subcategory_count']
    prepopulated_fields = {'slug': ('name',)}
    inlines             = [SubcategoryInline]

    def subcategory_count(self, obj):
        return obj.subcategories.count()
    subcategory_count.short_description = 'Sous-categories'


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'category', 'slug']
    list_filter         = ['category']
    prepopulated_fields = {'slug': ('name',)}


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
        # ── 1. Identification ────────────────────────────────────────────────
        ('Identification', {
            'fields': (
                ('category', 'subcategory'),
                'name',
                'brand',
                'slug',
            ),
        }),

        # ── 2. Etat & Disponibilite ───────────────────────────────────────────
        ('Etat & Disponibilite', {
            'fields': (
                'condition',
                ('stock', 'is_available'),
            ),
        }),

        # ── 3. Prix ──────────────────────────────────────────────────────────
        ('Prix', {
            'fields': (
                ('price', 'original_price'),
            ),
            'description': 'Le pourcentage de reduction sera calcule automatiquement si vous renseignez les deux prix.',
        }),

        # ── 4. Taille ────────────────────────────────────────────────────────
        ('Taille', {
            'fields': (
                'size',
                'size_tag',
                'size_recommendation',
            ),
            'description': (
                'Taille standard = pour les filtres du catalogue. '
                'Taille indiquee = ce qui est ecrit sur l\'etiquette (ex: 10, L/G, 8P). '
                'Taille recommandee = votre conseil client (ex: Convient a un 8 ajuste).'
            ),
        }),

        # ── 5. Mesures a plat ────────────────────────────────────────────────
        ('Mesures a plat (en cm)', {
            'fields': (
                ('measure_shoulder', 'measure_chest'),
                ('measure_waist', 'measure_hips'),
                ('measure_length', 'measure_sleeve'),
            ),
            'description': 'Toutes les mesures sont prises a plat, en centimetres. Laissez vide si non applicable.',
            'classes': ('collapse',),
        }),

        # ── 6. Matiere & Details ─────────────────────────────────────────────
        ('Matiere & Details de coupe', {
            'fields': (
                'material',
                'details',
                'color',
            ),
            'description': (
                'Matiere : decrivez le tissu (ex: Crepe de polyester, legèrement extensible, entierement doublee). '
                'Details : decollete, coupe, fermeture, doublure, etc. '
                'Couleurs : entrez les codes hex en JSON, ex: ["#FF0000", "#000000"]'
            ),
        }),

        # ── 7. Contenu marketing ─────────────────────────────────────────────
        ('Arguments de vente (affiches pres du prix)', {
            'fields': (
                'bullet_1',
                'bullet_2',
                'bullet_3',
                'bullet_4',
            ),
            'description': (
                'Ces 4 arguments courts seront affiches en gras pres du prix et des photos. '
                'Exemple : "La couleur qui donne confiance : rouge vibrant, coupe impeccable, assurance garantie."'
            ),
        }),

        ('Description & Conseils', {
            'fields': (
                'description',
                'mix_match_tips',
                'expert_tip',
            ),
            'description': (
                'Description : texte long de presentation de la piece. '
                'Mix & Match : 3 idees de tenues (une par ligne, commencez chaque ligne par un tiret -). '
                'Conseil expert : votre conseil personnalise pour porter cette piece.'
            ),
        }),

        # ── 8. Logistique ────────────────────────────────────────────────────
        ('Logistique', {
            'fields': ('weight_g',),
            'classes': ('collapse',),
            'description': 'Poids en grammes, utilise pour calculer les frais de port Canada Post.',
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
