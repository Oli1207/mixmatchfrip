import uuid
from django.db import models
from django.utils.text import slugify
from django.conf import settings

User = settings.AUTH_USER_MODEL


# ─── Category ────────────────────────────────────────────────────────────────

class Category(models.Model):
    name  = models.CharField(max_length=100)
    slug  = models.SlugField(unique=True, blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ─── Subcategory ─────────────────────────────────────────────────────────────

class Subcategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name     = models.CharField(max_length=100)
    slug     = models.SlugField(unique=True, blank=True)

    class Meta:
        verbose_name        = 'Sous-categorie'
        verbose_name_plural = 'Sous-categories'
        ordering            = ['category__name', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.category.slug}-{self.name}")
            slug = base
            n = 1
            while Subcategory.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} > {self.name}"


# ─── Product ─────────────────────────────────────────────────────────────────

CONDITION_CHOICES = [
    ('new_with_tags', 'Neuf avec etiquette'),
    ('excellent',     'Excellent etat'),
    ('very_good',     'Tres bon etat'),
    ('good',          'Bon etat'),
]

SIZE_CHOICES = [
    ('XS', 'XS'), ('S', 'S'), ('M', 'M'),
    ('L', 'L'), ('XL', 'XL'), ('XXL', 'XXL'),
    ('unique', 'Taille unique'),
    ('autre', 'Autre (voir taille indiquee)'),
]


class Product(models.Model):
    # ── Identification ────────────────────────────────────────────────────────
    category       = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    subcategory    = models.ForeignKey(Subcategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name           = models.CharField(max_length=200)
    brand          = models.CharField(max_length=100, blank=True)
    slug           = models.SlugField(unique=True, blank=True, max_length=250)

    # ── Etat & Stock ──────────────────────────────────────────────────────────
    condition      = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    stock          = models.PositiveIntegerField(default=1)
    is_available   = models.BooleanField(default=True)

    # ── Tarification ─────────────────────────────────────────────────────────
    price          = models.DecimalField(max_digits=8, decimal_places=2)
    original_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # ── Taille ───────────────────────────────────────────────────────────────
    size               = models.CharField(max_length=10, choices=SIZE_CHOICES, help_text='Taille standard (pour les filtres)')
    size_tag           = models.CharField(max_length=20, blank=True, help_text='Taille indiquee sur l\'etiquette (ex: 10, L/G, 8P)')
    size_recommendation = models.CharField(max_length=200, blank=True, help_text='Ex: Convient a un 8 ajuste')

    # ── Mesures a plat (cm) ───────────────────────────────────────────────────
    measure_shoulder = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Epaule a epaule (cm)')
    measure_chest    = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Aisselle a aisselle (cm)')
    measure_waist    = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Taille (cm)')
    measure_hips     = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Hanches (cm)')
    measure_length   = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Longueur totale (cm)')
    measure_sleeve   = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Longueur des manches (cm)')

    # ── Matiere & Details ─────────────────────────────────────────────────────
    material       = models.TextField(blank=True, verbose_name='Matiere', help_text='Ex: Crepe de polyester, legèrement extensible')
    details        = models.TextField(blank=True, verbose_name='Details de coupe', help_text='Ex: Coupe fourreau, fermeture eclair invisible au dos, entierement doublee')
    color          = models.JSONField(default=list, blank=True, help_text='Palette de couleurs (codes hex)')

    # ── Contenu marketing ────────────────────────────────────────────────────
    bullet_1       = models.TextField(blank=True, verbose_name='Argument 1', help_text='Premier argument de vente (accroche principale)')
    bullet_2       = models.TextField(blank=True, verbose_name='Argument 2')
    bullet_3       = models.TextField(blank=True, verbose_name='Argument 3')
    bullet_4       = models.TextField(blank=True, verbose_name='Argument 4')
    description    = models.TextField(blank=True, verbose_name='Description produit', help_text='Texte long de presentation')
    mix_match_tips = models.TextField(blank=True, verbose_name='Idees Mix & Match', help_text='3 idees de tenues (une par ligne)')
    expert_tip     = models.TextField(blank=True, verbose_name='Conseil d\'expert')

    # ── Logistique ────────────────────────────────────────────────────────────
    weight_g       = models.PositiveIntegerField(default=400, help_text='Poids en grammes (frais de port)')

    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.brand}-{self.name}")
            slug = base
            n = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def discount_percent(self):
        try:
            op = float(self.original_price)
            p  = float(self.price)
            if op and op > p:
                return round((1 - p / op) * 100)
        except (TypeError, ValueError):
            pass
        return 0

    @property
    def main_image(self):
        img = self.images.filter(is_main=True).first()
        if img:
            return img
        return self.images.first()

    def __str__(self):
        return f"{self.brand} - {self.name} ({self.size})"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image   = models.ImageField(upload_to='products/')
    is_main = models.BooleanField(default=False)
    order   = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image #{self.id} - {self.product.name}"


# ─── Wishlist ─────────────────────────────────────────────────────────────────

class Wishlist(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"


# ─── PromoCode ────────────────────────────────────────────────────────────────

PROMO_TYPE_CHOICES = [
    ('percent', 'Pourcentage (%)'),
    ('fixed',   'Montant fixe ($)'),
]

class PromoCode(models.Model):
    code           = models.CharField(max_length=50, unique=True)
    discount_type  = models.CharField(max_length=10, choices=PROMO_TYPE_CHOICES, default='percent')
    discount_value = models.DecimalField(max_digits=8, decimal_places=2, help_text='Valeur de la reduction (% ou $)')
    is_active      = models.BooleanField(default=True)
    usage_limit    = models.PositiveIntegerField(null=True, blank=True, help_text='Laisser vide = illimite')
    used_count     = models.PositiveIntegerField(default=0)
    minimum_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text='Montant minimum du panier')
    expires_at     = models.DateTimeField(null=True, blank=True, help_text='Laisser vide = pas d\'expiration')
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def is_valid(self, cart_subtotal=0):
        from django.utils import timezone
        if not self.is_active:
            return False, 'Ce code promo est desactive.'
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False, 'Ce code promo a atteint sa limite d\'utilisation.'
        if self.expires_at and self.expires_at < timezone.now():
            return False, 'Ce code promo a expire.'
        if float(cart_subtotal) < float(self.minimum_amount):
            return False, f'Montant minimum requis : {self.minimum_amount} $'
        return True, None

    def compute_discount(self, subtotal):
        if self.discount_type == 'percent':
            return round(float(subtotal) * float(self.discount_value) / 100, 2)
        return min(float(self.discount_value), float(subtotal))

    def __str__(self):
        return f'{self.code} ({self.discount_type}: {self.discount_value})'


# ─── Newsletter ───────────────────────────────────────────────────────────────

class NewsletterSubscriber(models.Model):
    email      = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email


# ─── Cart ─────────────────────────────────────────────────────────────────────

class Cart(models.Model):
    cart_id    = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user       = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart {self.cart_id}"

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())

    @property
    def tax(self):
        return 0.0

    @property
    def total(self):
        return round(float(self.subtotal), 2)

    @property
    def item_count(self):
        return self.items.count()


class CartItem(models.Model):
    cart       = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty        = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product')

    @property
    def line_total(self):
        return float(self.product.price) * self.qty

    def __str__(self):
        return f"{self.qty}x {self.product.name}"


# ─── Order ────────────────────────────────────────────────────────────────────

ORDER_STATUS = [
    ('pending',   'En attente'),
    ('confirmed', 'Confirmee'),
    ('shipped',   'Expediee'),
    ('delivered', 'Livree'),
    ('cancelled', 'Annulee'),
]

SHIPPING_METHOD = [
    ('standard', 'Standard (5-7 jours)'),
    ('express',  'Express (2-3 jours)'),
    ('pickup',   'Retrait en magasin'),
]


class Order(models.Model):
    user            = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders')
    order_number    = models.CharField(max_length=20, unique=True, blank=True)
    status          = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')

    first_name      = models.CharField(max_length=100)
    last_name       = models.CharField(max_length=100)
    email           = models.EmailField()
    phone           = models.CharField(max_length=20)
    address         = models.CharField(max_length=255)
    city            = models.CharField(max_length=100)
    province        = models.CharField(max_length=100)
    postal_code     = models.CharField(max_length=10)
    instructions    = models.TextField(blank=True)

    shipping_method = models.CharField(max_length=20, choices=SHIPPING_METHOD, default='standard')
    shipping_cost   = models.DecimalField(max_digits=6, decimal_places=2, default=4.99)

    subtotal        = models.DecimalField(max_digits=10, decimal_places=2)
    tax             = models.DecimalField(max_digits=10, decimal_places=2)
    total           = models.DecimalField(max_digits=10, decimal_places=2)

    payment_ref     = models.CharField(max_length=200, blank=True)
    shipment_id     = models.CharField(max_length=100, blank=True, verbose_name='Chit Chats Shipment ID')
    is_paid         = models.BooleanField(default=False)
    paid_at         = models.DateTimeField(null=True, blank=True)
    account_created = models.BooleanField(default=False)

    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random, string
            self.order_number = 'MMF-' + ''.join(random.choices(string.digits, k=6))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} - {self.user}"


class OrderItem(models.Model):
    order         = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product       = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name  = models.CharField(max_length=200)
    product_brand = models.CharField(max_length=100, blank=True)
    unit_price    = models.DecimalField(max_digits=8, decimal_places=2)
    qty           = models.PositiveIntegerField(default=1)

    @property
    def line_total(self):
        return float(self.unit_price) * self.qty

    def __str__(self):
        return f"{self.qty}x {self.product_name}"
