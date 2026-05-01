import uuid
from django.db import models
from django.utils.text import slugify
from django.conf import settings

User = settings.AUTH_USER_MODEL


# ─── Category ────────────────────────────────────────────────────────────────

class Category(models.Model):
    name    = models.CharField(max_length=100, verbose_name='Nom (FR)')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='Name (EN)')
    slug    = models.SlugField(unique=True, blank=True)
    image   = models.ImageField(upload_to='categories/', blank=True, null=True)

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
    name     = models.CharField(max_length=100, verbose_name='Nom (FR)')
    name_en  = models.CharField(max_length=100, blank=True, verbose_name='Name (EN)')
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
    name           = models.CharField(max_length=200, verbose_name='Nom (FR)')
    name_en        = models.CharField(max_length=200, blank=True, verbose_name='Name (EN)')
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
    size                   = models.CharField(max_length=10, choices=SIZE_CHOICES, help_text='Taille standard (pour les filtres)')
    size_tag               = models.CharField(max_length=20, blank=True, help_text='Taille indiquee sur l\'etiquette (ex: 10, L/G, 8P)')
    size_recommendation    = models.CharField(max_length=200, blank=True, verbose_name='Recommandation taille (FR)', help_text='Ex: Convient a un 8 ajuste')
    size_recommendation_en = models.CharField(max_length=200, blank=True, verbose_name='Size recommendation (EN)', help_text='Ex: Fits a size 8 slim')

    # ── Mesures a plat (cm) ───────────────────────────────────────────────────
    measure_shoulder = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Epaule a epaule (cm)')
    measure_chest    = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Aisselle a aisselle (cm)')
    measure_waist    = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Taille (cm)')
    measure_hips     = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Hanches (cm)')
    measure_length   = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Longueur totale (cm)')
    measure_sleeve   = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Longueur des manches (cm)')

    # ── Matiere & Details ─────────────────────────────────────────────────────
    material       = models.TextField(blank=True, verbose_name='Matière (FR)', help_text='Ex: Crêpe de polyester, légèrement extensible')
    material_en    = models.TextField(blank=True, verbose_name='Material (EN)', help_text='Ex: Polyester crepe, slightly stretchy')
    details        = models.TextField(blank=True, verbose_name='Détails de coupe (FR)', help_text='Ex: Coupe fourreau, fermeture éclair invisible au dos')
    details_en     = models.TextField(blank=True, verbose_name='Cut details (EN)', help_text='Ex: Sheath cut, invisible back zip, fully lined')
    color          = models.JSONField(default=list, blank=True, help_text='Palette de couleurs (codes hex)')

    # ── Contenu marketing ────────────────────────────────────────────────────
    bullet_1          = models.TextField(blank=True, verbose_name='Argument 1 (FR)')
    bullet_1_en       = models.TextField(blank=True, verbose_name='Argument 1 (EN)')
    bullet_2          = models.TextField(blank=True, verbose_name='Argument 2 (FR)')
    bullet_2_en       = models.TextField(blank=True, verbose_name='Argument 2 (EN)')
    bullet_3          = models.TextField(blank=True, verbose_name='Argument 3 (FR)')
    bullet_3_en       = models.TextField(blank=True, verbose_name='Argument 3 (EN)')
    bullet_4          = models.TextField(blank=True, verbose_name='Argument 4 (FR)')
    bullet_4_en       = models.TextField(blank=True, verbose_name='Argument 4 (EN)')
    description       = models.TextField(blank=True, verbose_name='Description (FR)')
    description_en    = models.TextField(blank=True, verbose_name='Description (EN)')
    mix_match_tips    = models.TextField(blank=True, verbose_name='Mix & Match (FR)', help_text='3 idées de tenues (une par ligne)')
    mix_match_tips_en = models.TextField(blank=True, verbose_name='Mix & Match (EN)', help_text='3 outfit ideas (one per line)')
    expert_tip        = models.TextField(blank=True, verbose_name='Conseil expert (FR)')
    expert_tip_en     = models.TextField(blank=True, verbose_name='Expert tip (EN)')

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
    code             = models.CharField(max_length=50, unique=True)
    discount_type    = models.CharField(max_length=10, choices=PROMO_TYPE_CHOICES, default='percent')
    discount_value   = models.DecimalField(max_digits=8, decimal_places=2, help_text='Valeur de la reduction (% ou $)')
    is_active        = models.BooleanField(default=True)
    usage_limit      = models.PositiveIntegerField(null=True, blank=True, help_text='Laisser vide = illimite')
    used_count       = models.PositiveIntegerField(default=0)
    minimum_amount   = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text='Montant minimum du panier')
    expires_at       = models.DateTimeField(null=True, blank=True, help_text='Laisser vide = pas d\'expiration')
    first_order_only = models.BooleanField(
        default=False,
        verbose_name='Premier achat uniquement',
        help_text='Si coché, le code est refusé si l\'email a déjà une commande payée.',
    )
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def is_valid(self, cart_subtotal=0, email=None):
        from django.utils import timezone
        if not self.is_active:
            return False, 'Ce code promo est désactivé.'
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False, "Ce code promo a atteint sa limite d'utilisation."
        if self.expires_at and self.expires_at < timezone.now():
            return False, 'Ce code promo a expiré.'
        if float(cart_subtotal) < float(self.minimum_amount):
            return False, f'Montant minimum requis : {self.minimum_amount} $'
        # Restriction premier achat — vérifie l'historique de l'email
        if self.first_order_only and email:
            already_ordered = Order.objects.filter(
                email__iexact=email.strip(), is_paid=True
            ).exists()
            if already_ordered:
                return False, 'Ce code est réservé au premier achat.'
        return True, None

    def compute_discount(self, subtotal):
        if self.discount_type == 'percent':
            return round(float(subtotal) * float(self.discount_value) / 100, 2)
        return min(float(self.discount_value), float(subtotal))

    def __str__(self):
        return f'{self.code} ({self.discount_type}: {self.discount_value})'


# ─── Newsletter ───────────────────────────────────────────────────────────────

SOURCE_CHOICES = [
    ('popup_promo', 'Popup bienvenue (code promo)'),
    ('footer',      'Footer newsletter'),
    ('other',       'Autre'),
]

class NewsletterSubscriber(models.Model):
    email      = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True, verbose_name='Prénom')
    source     = models.CharField(
        max_length=20, choices=SOURCE_CHOICES, default='other',
        verbose_name='Source d\'inscription',
    )
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


# ─── Analytics ────────────────────────────────────────────────────────────────

class AnalyticsSession(models.Model):
    DEVICE_CHOICES = [
        ('mobile',  'Mobile'),
        ('tablet',  'Tablette'),
        ('desktop', 'Ordinateur'),
        ('unknown', 'Inconnu'),
    ]

    session_id      = models.CharField(max_length=64, unique=True, db_index=True)
    user            = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='analytics_sessions'
    )

    # ── Origine du trafic ────────────────────────────────────────────────────
    utm_source      = models.CharField(max_length=200, blank=True, db_index=True)
    utm_medium      = models.CharField(max_length=200, blank=True)
    utm_campaign    = models.CharField(max_length=200, blank=True, db_index=True)
    utm_content     = models.CharField(max_length=200, blank=True)
    utm_term        = models.CharField(max_length=200, blank=True)
    referrer        = models.TextField(blank=True)
    referrer_domain = models.CharField(max_length=255, blank=True, db_index=True)
    landing_page    = models.CharField(max_length=500, blank=True)

    # ── Appareil ──────────────────────────────────────────────────────────────
    device_type     = models.CharField(max_length=20, choices=DEVICE_CHOICES, default='unknown')
    user_agent      = models.TextField(blank=True)

    # ── Métriques ─────────────────────────────────────────────────────────────
    page_views      = models.PositiveIntegerField(default=0)

    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['created_at']),
            models.Index(fields=['utm_source', 'utm_campaign']),
        ]

    def __str__(self):
        src = self.utm_source or self.referrer_domain or 'direct'
        return f"Session {self.session_id[:8]}… ({src})"


class AnalyticsEvent(models.Model):
    EVENT_CHOICES = [
        ('page_view',        'Vue de page'),
        ('view_product',     'Vue produit'),
        ('add_to_cart',      'Ajout panier'),
        ('remove_from_cart', 'Retrait panier'),
        ('add_to_wishlist',  'Ajout wishlist'),
        ('begin_checkout',   'Début checkout'),
        ('checkout_step',    'Étape checkout'),
        ('purchase',         'Achat'),
        ('search',           'Recherche'),
        ('newsletter_sub',   'Inscription newsletter'),
    ]

    session     = models.ForeignKey(
        AnalyticsSession, on_delete=models.CASCADE,
        related_name='events', db_index=True
    )
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL
    )
    event_type  = models.CharField(max_length=50, choices=EVENT_CHOICES, db_index=True)
    page        = models.CharField(max_length=500, blank=True)
    properties  = models.JSONField(default=dict, blank=True)
    timestamp   = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes  = [
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['session', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.event_type} — {self.session.session_id[:8]}…"
