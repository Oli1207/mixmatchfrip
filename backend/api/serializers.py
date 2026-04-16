from rest_framework import serializers
from .models import (
    Category, Subcategory, Product, ProductImage,
    Wishlist, PromoCode, Cart, CartItem,
    Order, OrderItem,
)


# ─── Category & Subcategory ───────────────────────────────────────────────────

class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subcategory
        fields = ['id', 'name', 'slug']


class CategorySerializer(serializers.ModelSerializer):
    product_count  = serializers.IntegerField(source='products.count', read_only=True)
    subcategories  = SubcategorySerializer(many=True, read_only=True)

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'image', 'product_count', 'subcategories']


# ─── Product Images ───────────────────────────────────────────────────────────

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductImage
        fields = ['id', 'image', 'is_main', 'order']


# ─── Product List (catalogue grid) ───────────────────────────────────────────

class ProductListSerializer(serializers.ModelSerializer):
    category_name    = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    main_image_url   = serializers.SerializerMethodField()
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'brand', 'slug',
            'price', 'original_price', 'discount_percent',
            'size', 'size_tag', 'condition', 'color', 'weight_g',
            'category_name', 'subcategory_name', 'main_image_url',
            'is_available', 'stock',
        ]

    def get_main_image_url(self, obj):
        request = self.context.get('request')
        img = obj.main_image
        if img and request:
            return request.build_absolute_uri(img.image.url)
        return None


# ─── Product Detail ───────────────────────────────────────────────────────────

class ProductDetailSerializer(serializers.ModelSerializer):
    category         = CategorySerializer(read_only=True)
    subcategory      = SubcategorySerializer(read_only=True)
    images           = ProductImageSerializer(many=True, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    related          = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = [
            # Identification
            'id', 'name', 'brand', 'slug',
            'category', 'subcategory',
            # Prix
            'price', 'original_price', 'discount_percent',
            # Etat
            'condition', 'stock', 'is_available',
            # Taille
            'size', 'size_tag', 'size_recommendation',
            # Mesures
            'measure_shoulder', 'measure_chest', 'measure_waist',
            'measure_hips', 'measure_length', 'measure_sleeve',
            # Matiere & details
            'material', 'details', 'color',
            # Marketing
            'bullet_1', 'bullet_2', 'bullet_3', 'bullet_4',
            'description', 'mix_match_tips', 'expert_tip',
            # Medias
            'images',
            # Meta
            'weight_g', 'created_at', 'related',
        ]

    def get_related(self, obj):
        # Priorite: meme sous-categorie, sinon meme categorie
        if obj.subcategory:
            qs = Product.objects.filter(subcategory=obj.subcategory, is_available=True).exclude(pk=obj.pk)[:4]
        else:
            qs = Product.objects.filter(category=obj.category, is_available=True).exclude(pk=obj.pk)[:4]
        return ProductListSerializer(qs, many=True, context=self.context).data


# ─── Wishlist ─────────────────────────────────────────────────────────────────

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model  = Wishlist
        fields = ['id', 'product', 'created_at']


# ─── PromoCode ────────────────────────────────────────────────────────────────

class PromoCodeSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    is_maxed   = serializers.SerializerMethodField()

    class Meta:
        model  = PromoCode
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'is_active', 'usage_limit', 'used_count',
            'minimum_amount', 'expires_at', 'created_at',
            'is_expired', 'is_maxed',
        ]

    def get_is_expired(self, obj):
        from django.utils import timezone
        return bool(obj.expires_at and obj.expires_at < timezone.now())

    def get_is_maxed(self, obj):
        return bool(obj.usage_limit and obj.used_count >= obj.usage_limit)


# ─── Cart ─────────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product    = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_available=True),
        source='product',
        write_only=True,
    )
    line_total = serializers.FloatField(read_only=True)

    class Meta:
        model  = CartItem
        fields = ['id', 'product', 'product_id', 'qty', 'line_total']


class CartSerializer(serializers.ModelSerializer):
    items      = CartItemSerializer(many=True, read_only=True)
    subtotal   = serializers.FloatField(read_only=True)
    tax        = serializers.FloatField(read_only=True)
    total      = serializers.FloatField(read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Cart
        fields = ['id', 'cart_id', 'items', 'subtotal', 'tax', 'total', 'item_count']


# ─── Order ────────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.FloatField(read_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'product_brand', 'unit_price', 'qty', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'order_number', 'status',
            'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'province', 'postal_code', 'instructions',
            'shipping_method', 'shipping_cost',
            'subtotal', 'tax', 'total',
            'is_paid', 'paid_at', 'payment_ref',
            'items', 'created_at',
        ]
        read_only_fields = ['order_number', 'status', 'is_paid', 'paid_at', 'payment_ref']


class OrderCreateSerializer(serializers.Serializer):
    """Payload envoyé depuis le checkout pour créer une commande."""
    first_name      = serializers.CharField(max_length=100)
    last_name       = serializers.CharField(max_length=100)
    email           = serializers.EmailField()
    phone           = serializers.CharField(max_length=20)
    address         = serializers.CharField(max_length=255)
    city            = serializers.CharField(max_length=100)
    province        = serializers.CharField(max_length=100)
    postal_code     = serializers.CharField(max_length=10)
    instructions    = serializers.CharField(required=False, allow_blank=True, default='')
    shipping_method = serializers.CharField(max_length=30, default='standard')
    shipping_cost   = serializers.DecimalField(max_digits=8, decimal_places=2, default=4.99)
    promo_code      = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
