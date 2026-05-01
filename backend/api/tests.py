"""
Tests unitaires & d'intégration — Mix&Match Frip API
=====================================================
Lancement :
    python manage.py test api --verbosity=2

Couverture :
    pip install coverage
    coverage run manage.py test api
    coverage report -m
"""

import uuid
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import (
    Category, Subcategory, Product, ProductImage,
    Cart, CartItem, Order, OrderItem,
    PromoCode, NewsletterSubscriber,
)

User = get_user_model()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def make_category(name='Robes', slug='robes'):
    return Category.objects.create(name=name, slug=slug)


def make_product(category, name='Robe noire', price='25.00', stock=1):
    return Product.objects.create(
        category  = category,
        name      = name,
        brand     = 'Zara',
        price     = Decimal(price),
        size      = 'M',
        condition = 'excellent',
        stock     = stock,
        is_available = True,
    )


def make_user(email='test@mmf.com', password='pass1234!'):
    return User.objects.create_user(
        email    = email,
        username = email,
        password = password,
    )


def auth_client(user):
    """Retourne un APIClient authentifié via JWT."""
    c = APIClient()
    resp = c.post('/api/user/token/', {'email': user.email, 'password': 'pass1234!'}, format='json')
    token = resp.data.get('access')
    if token:
        c.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return c


# ══════════════════════════════════════════════════════════════════════════════
# CATEGORIES
# ══════════════════════════════════════════════════════════════════════════════

class CategoryAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.cat = make_category('Robes', 'robes')
        Category.objects.create(name='Hauts', slug='hauts')

    def test_list_returns_all_categories(self):
        resp = self.client.get('/api/categories/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 2)

    def test_category_has_name_en_field(self):
        resp = self.client.get('/api/categories/')
        self.assertIn('name_en', resp.data[0])

    def test_subcategories_by_slug(self):
        Subcategory.objects.create(category=self.cat, name='Robes mi-longues', slug='robes-mi-longues')
        resp = self.client.get(f'/api/categories/{self.cat.slug}/subcategories/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_unknown_category_returns_404(self):
        resp = self.client.get('/api/categories/inexistant/subcategories/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# ══════════════════════════════════════════════════════════════════════════════
# PRODUITS
# ══════════════════════════════════════════════════════════════════════════════

class ProductAPITest(TestCase):

    def setUp(self):
        self.client  = APIClient()
        self.cat     = make_category()
        self.product = make_product(self.cat)

    def test_list_returns_available_products(self):
        resp = self.client.get('/api/products/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_unavailable_product_not_listed(self):
        self.product.is_available = False
        self.product.save()
        resp = self.client.get('/api/products/')
        self.assertEqual(len(resp.data), 0)

    def test_product_detail_by_slug(self):
        resp = self.client.get(f'/api/products/{self.product.slug}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], self.product.name)

    def test_product_detail_contains_bilingual_fields(self):
        resp = self.client.get(f'/api/products/{self.product.slug}/')
        for field in ['name_en', 'description', 'description_en', 'material', 'material_en']:
            self.assertIn(field, resp.data, f"Champ manquant : {field}")

    def test_product_detail_unknown_slug_returns_404(self):
        resp = self.client.get('/api/products/slug-inexistant/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_filter_by_category(self):
        cat2 = make_category('Hauts', 'hauts')
        make_product(cat2, 'Top blanc', price='15.00')
        resp = self.client.get('/api/products/', {'category': 'robes'})
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['name'], 'Robe noire')

    def test_filter_by_condition(self):
        make_product(self.cat, 'Robe usée', price='8.00')
        p2 = Product.objects.get(name='Robe usée')
        p2.condition = 'good'
        p2.save()
        resp = self.client.get('/api/products/', {'condition': 'excellent'})
        self.assertEqual(len(resp.data), 1)

    def test_search_by_name(self):
        make_product(self.cat, 'Veste en cuir', price='45.00')
        resp = self.client.get('/api/products/', {'search': 'cuir'})
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['name'], 'Veste en cuir')

    def test_discount_percent_calculated(self):
        self.product.original_price = Decimal('50.00')
        self.product.price = Decimal('25.00')
        self.product.save()
        resp = self.client.get(f'/api/products/{self.product.slug}/')
        self.assertEqual(resp.data['discount_percent'], 50)

    def test_related_products_in_detail(self):
        make_product(self.cat, 'Robe rouge', price='30.00')
        resp = self.client.get(f'/api/products/{self.product.slug}/')
        self.assertIn('related', resp.data)
        self.assertIsInstance(resp.data['related'], list)


# ══════════════════════════════════════════════════════════════════════════════
# PANIER
# ══════════════════════════════════════════════════════════════════════════════

class CartAPITest(TestCase):

    def setUp(self):
        self.client  = APIClient()
        self.cat     = make_category()
        self.product = make_product(self.cat)
        self.cart_id = str(uuid.uuid4())

    def _get_cart(self):
        return self.client.get('/api/cart/', {'cart_id': self.cart_id})

    def _add(self, product_id=None, qty=1):
        return self.client.post('/api/cart/add/', {
            'product_id': product_id or self.product.id,
            'qty':        qty,
            'cart_id':    self.cart_id,
        }, format='json')

    def test_empty_cart_returns_zero_items(self):
        resp = self._get_cart()
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['item_count'], 0)

    def test_add_item_to_cart(self):
        resp = self._add()
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['item_count'], 1)

    def test_add_same_item_twice_increments_qty(self):
        self._add()
        self._add()
        resp = self._get_cart()
        self.assertEqual(resp.data['items'][0]['qty'], 2)

    def test_add_unavailable_product_rejected(self):
        self.product.is_available = False
        self.product.save()
        resp = self._add()
        self.assertIn(resp.status_code, [
            status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND
        ])

    def test_cart_subtotal_correct(self):
        self._add(qty=2)
        resp = self._get_cart()
        expected = float(self.product.price) * 2
        self.assertAlmostEqual(float(resp.data['subtotal']), expected, places=2)

    def test_remove_item_from_cart(self):
        self._add()
        cart_resp = self._get_cart()
        item_id   = cart_resp.data['items'][0]['id']
        rem = self.client.delete(
            f'/api/cart/item/{item_id}/remove/',
            {'cart_id': self.cart_id},
        )
        self.assertEqual(rem.status_code, status.HTTP_200_OK)
        self.assertEqual(self._get_cart().data['item_count'], 0)


# ══════════════════════════════════════════════════════════════════════════════
# CODES PROMO
# ══════════════════════════════════════════════════════════════════════════════

class PromoCodeTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.cat    = make_category()

    def _make_promo(self, code='TEST10', discount=10, first_order_only=False):
        return PromoCode.objects.create(
            code             = code,
            discount_type    = 'percent',
            discount_value   = Decimal(str(discount)),
            is_active        = True,
            first_order_only = first_order_only,
        )

    def test_valid_promo_applies_discount(self):
        self._make_promo('SAVE10', 10)
        resp = self.client.post('/api/promo/apply/', {
            'code': 'SAVE10', 'subtotal': 100.0, 'email': 'nouveau@test.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(resp.data['discount_amount'], 10.0, places=2)

    def test_invalid_code_returns_404(self):
        resp = self.client.post('/api/promo/apply/', {
            'code': 'INEXISTANT', 'subtotal': 50.0,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_inactive_code_rejected(self):
        promo = self._make_promo('INACTIVE')
        promo.is_active = False
        promo.save()
        resp = self.client.post('/api/promo/apply/', {
            'code': 'INACTIVE', 'subtotal': 50.0,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_first_order_only_accepted_for_new_customer(self):
        """Un email sans commande payée doit pouvoir utiliser le code."""
        self._make_promo('BIENVENUE15', 15, first_order_only=True)
        resp = self.client.post('/api/promo/apply/', {
            'code':     'BIENVENUE15',
            'subtotal': 80.0,
            'email':    'nouveau@client.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(resp.data['discount_amount'], 12.0, places=2)  # 15% de 80

    def test_first_order_only_rejected_for_existing_customer(self):
        """Un email avec une commande payée ne doit PAS pouvoir utiliser le code."""
        self._make_promo('BIENVENUE15', 15, first_order_only=True)
        product = make_product(self.cat)
        # Crée une commande payée pour cet email
        Order.objects.create(
            email='ancien@client.com', first_name='Marie', last_name='Dupont',
            phone='0600000000', address='123 rue Test', city='Gatineau',
            province='Québec', postal_code='J8X 1A1',
            shipping_method='standard', shipping_cost=Decimal('4.99'),
            subtotal=Decimal('50.00'), tax=Decimal('0'), total=Decimal('54.99'),
            is_paid=True,
        )
        resp = self.client.post('/api/promo/apply/', {
            'code':     'BIENVENUE15',
            'subtotal': 80.0,
            'email':    'ancien@client.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('premier achat', resp.data['detail'].lower())

    def test_first_order_only_not_blocked_if_only_unpaid_orders(self):
        """Une commande non payée ne doit pas bloquer le code."""
        self._make_promo('BIENVENUE15', 15, first_order_only=True)
        make_product(self.cat)
        Order.objects.create(
            email='pending@client.com', first_name='Luc', last_name='Martin',
            phone='0600000000', address='1 rue Test', city='Gatineau',
            province='Québec', postal_code='J8X 1A1',
            shipping_method='standard', shipping_cost=Decimal('4.99'),
            subtotal=Decimal('50.00'), tax=Decimal('0'), total=Decimal('54.99'),
            is_paid=False,   # ← non payée
        )
        resp = self.client.post('/api/promo/apply/', {
            'code':     'BIENVENUE15',
            'subtotal': 80.0,
            'email':    'pending@client.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_expired_code_rejected(self):
        from django.utils import timezone
        from datetime import timedelta
        promo = self._make_promo('EXPIRED')
        promo.expires_at = timezone.now() - timedelta(days=1)
        promo.save()
        resp = self.client.post('/api/promo/apply/', {
            'code': 'EXPIRED', 'subtotal': 50.0,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_usage_limit_reached(self):
        promo = self._make_promo('LIMITE')
        promo.usage_limit = 3
        promo.used_count  = 3
        promo.save()
        resp = self.client.post('/api/promo/apply/', {
            'code': 'LIMITE', 'subtotal': 50.0,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_minimum_amount_not_reached(self):
        promo = self._make_promo('MIN50')
        promo.minimum_amount = Decimal('50.00')
        promo.save()
        resp = self.client.post('/api/promo/apply/', {
            'code': 'MIN50', 'subtotal': 30.0,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ══════════════════════════════════════════════════════════════════════════════
# NEWSLETTER
# ══════════════════════════════════════════════════════════════════════════════

class NewsletterTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_subscribe_with_email_only(self):
        resp = self.client.post('/api/newsletter/subscribe/', {
            'email': 'marie@test.com',
        }, format='json')
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertTrue(NewsletterSubscriber.objects.filter(email='marie@test.com').exists())

    def test_subscribe_with_first_name_and_source(self):
        resp = self.client.post('/api/newsletter/subscribe/', {
            'email':      'sophie@test.com',
            'first_name': 'Sophie',
            'source':     'popup_promo',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        sub = NewsletterSubscriber.objects.get(email='sophie@test.com')
        self.assertEqual(sub.first_name, 'Sophie')
        self.assertEqual(sub.source, 'popup_promo')

    def test_duplicate_email_returns_200_not_error(self):
        NewsletterSubscriber.objects.create(email='deja@test.com')
        resp = self.client.post('/api/newsletter/subscribe/', {
            'email': 'deja@test.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_invalid_email_returns_400(self):
        resp = self.client.post('/api/newsletter/subscribe/', {
            'email': 'pas-un-email',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_source_upgrades_to_popup_promo(self):
        """Si l'abonné vient du footer puis utilise la popup, la source se met à jour."""
        NewsletterSubscriber.objects.create(email='upgrade@test.com', source='footer')
        self.client.post('/api/newsletter/subscribe/', {
            'email':  'upgrade@test.com',
            'source': 'popup_promo',
        }, format='json')
        sub = NewsletterSubscriber.objects.get(email='upgrade@test.com')
        self.assertEqual(sub.source, 'popup_promo')

    def test_source_does_not_downgrade(self):
        """popup_promo ne doit pas être écrasé par footer (rang inférieur)."""
        NewsletterSubscriber.objects.create(email='nodown@test.com', source='popup_promo')
        self.client.post('/api/newsletter/subscribe/', {
            'email':  'nodown@test.com',
            'source': 'footer',
        }, format='json')
        sub = NewsletterSubscriber.objects.get(email='nodown@test.com')
        self.assertEqual(sub.source, 'popup_promo')

    def test_invalid_source_defaults_to_other(self):
        self.client.post('/api/newsletter/subscribe/', {
            'email':  'invsrc@test.com',
            'source': 'source_invalide',
        }, format='json')
        sub = NewsletterSubscriber.objects.get(email='invsrc@test.com')
        self.assertEqual(sub.source, 'other')


# ══════════════════════════════════════════════════════════════════════════════
# WISHLIST (utilisateur connecté)
# ══════════════════════════════════════════════════════════════════════════════

class WishlistTest(TestCase):

    def setUp(self):
        self.user    = make_user()
        self.client  = auth_client(self.user)
        self.cat     = make_category()
        self.product = make_product(self.cat)

    def test_wishlist_empty_at_start(self):
        resp = self.client.get('/api/wishlist/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

    def test_toggle_adds_to_wishlist(self):
        resp = self.client.post('/api/wishlist/toggle/', {
            'product_id': self.product.id,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(self.client.get('/api/wishlist/').data), 1)

    def test_toggle_twice_removes_from_wishlist(self):
        self.client.post('/api/wishlist/toggle/', {'product_id': self.product.id}, format='json')
        self.client.post('/api/wishlist/toggle/', {'product_id': self.product.id}, format='json')
        self.assertEqual(len(self.client.get('/api/wishlist/').data), 0)

    def test_wishlist_requires_auth(self):
        anon = APIClient()
        resp = anon.post('/api/wishlist/toggle/', {'product_id': self.product.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
