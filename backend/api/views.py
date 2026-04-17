import stripe
import requests as http_requests

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone
from django.db.models import Sum, Count, Q

stripe.api_key = settings.STRIPE_SECRET_KEY
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import (
    Category, Subcategory, Product, ProductImage,
    Wishlist, Cart, CartItem,
    Order, OrderItem, PromoCode,
)
from .serializers import (
    CategorySerializer, SubcategorySerializer, SubcategoryAdminSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductImageSerializer,
    WishlistSerializer,
    CartSerializer, CartItemSerializer,
    OrderSerializer, OrderCreateSerializer,
    PromoCodeSerializer,
)

SHIPPING_COSTS = {
    'standard': 4.99,
    'express':  12.99,
    'pickup':   0.00,
}


# ─── helpers ─────────────────────────────────────────────────────────────────

def get_or_create_cart(request):
    """Retourne le Cart lié au user authentifié, ou au cart_id localStorage."""
    from uuid import UUID

    def _get_req_cart_id():
        """Lit le cart_id depuis request.data (POST/PATCH) ou request.GET (GET/DELETE)."""
        if hasattr(request, 'data') and request.data.get('cart_id'):
            return str(request.data.get('cart_id'))
        return request.GET.get('cart_id', '')

    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        # Fusionne le panier anonyme localStorage si présent
        anon_cart_id = _get_req_cart_id()
        if anon_cart_id:
            try:
                anon_cart = Cart.objects.get(cart_id=UUID(anon_cart_id), user__isnull=True)
                for item in anon_cart.items.all():
                    ci, created = CartItem.objects.get_or_create(
                        cart=cart, product=item.product,
                        defaults={'qty': item.qty}
                    )
                    if not created:
                        ci.qty += item.qty
                        ci.save()
                anon_cart.delete()
            except Exception:
                pass
        return cart

    # Panier anonyme via localStorage cart_id
    req_cart_id = _get_req_cart_id()
    if req_cart_id:
        try:
            cart = Cart.objects.filter(cart_id=UUID(req_cart_id), user__isnull=True).first()
            if cart:
                return cart
        except Exception:
            pass

    return Cart.objects.create()


# ─── Categories & Sous-categories ────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def subcategory_list(request):
    subcategories = Subcategory.objects.select_related('category').all()
    serializer = SubcategorySerializer(subcategories, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def subcategories_by_category(request, slug):
    subcategories = Subcategory.objects.filter(category__slug=slug).select_related('category')
    serializer = SubcategorySerializer(subcategories, many=True, context={'request': request})
    return Response(serializer.data)


# ─── Products ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    qs = Product.objects.filter(is_available=True).select_related('category', 'subcategory').prefetch_related('images')

    # Filters
    category    = request.GET.get('category')
    subcategory = request.GET.get('subcategory')
    size        = request.GET.get('size')
    condition   = request.GET.get('condition')
    min_price   = request.GET.get('min_price')
    max_price   = request.GET.get('max_price')
    search      = request.GET.get('search', '').strip()
    sort        = request.GET.get('sort', 'recent')

    if category:
        qs = qs.filter(category__slug=category)
    if subcategory:
        qs = qs.filter(subcategory__slug=subcategory)
    if size:
        qs = qs.filter(size=size)
    if condition:
        qs = qs.filter(condition=condition)
    if min_price:
        qs = qs.filter(price__gte=min_price)
    if max_price:
        qs = qs.filter(price__lte=max_price)
    if search:
        qs = qs.filter(name__icontains=search) | qs.filter(brand__icontains=search)

    if sort == 'price_asc':
        qs = qs.order_by('price')
    elif sort == 'price_desc':
        qs = qs.order_by('-price')
    elif sort == 'recent':
        qs = qs.order_by('-created_at')

    serializer = ProductListSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, slug):
    try:
        product = Product.objects.select_related('category').prefetch_related('images').get(
            slug=slug, is_available=True
        )
    except Product.DoesNotExist:
        return Response({'detail': 'Produit introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductDetailSerializer(product, context={'request': request})
    return Response(serializer.data)


# ─── Wishlist ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    items = Wishlist.objects.filter(user=request.user).select_related('product')
    serializer = WishlistSerializer(items, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wishlist_toggle(request):
    product_id = request.data.get('product_id')
    if not product_id:
        return Response({'detail': 'product_id requis.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id, is_available=True)
    except Product.DoesNotExist:
        return Response({'detail': 'Produit introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    if not created:
        item.delete()
        return Response({'status': 'removed'})
    return Response({'status': 'added'}, status=status.HTTP_201_CREATED)


# ─── Cart ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def cart_detail(request):
    cart = get_or_create_cart(request)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def cart_add(request):
    """
    Body: { product_id, qty }
    """
    product_id = request.data.get('product_id')
    qty        = int(request.data.get('qty', 1))

    if not product_id:
        return Response({'detail': 'product_id requis.'}, status=status.HTTP_400_BAD_REQUEST)
    if qty < 1:
        return Response({'detail': 'Quantité invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(pk=product_id, is_available=True)
    except Product.DoesNotExist:
        return Response({'detail': 'Produit introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if product.stock < qty:
        return Response({'detail': f'Stock insuffisant (disponible: {product.stock}).'},
                        status=status.HTTP_400_BAD_REQUEST)

    cart = get_or_create_cart(request)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'qty': qty})
    if not created:
        item.qty += qty
        item.save()

    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def cart_item_update(request, item_id):
    """Body: { qty }"""
    qty = request.data.get('qty')
    if qty is None:
        return Response({'detail': 'qty requis.'}, status=status.HTTP_400_BAD_REQUEST)

    qty = int(qty)
    cart = get_or_create_cart(request)

    try:
        item = cart.items.get(pk=item_id)
    except CartItem.DoesNotExist:
        return Response({'detail': 'Article introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if qty < 1:
        item.delete()
    else:
        if item.product.stock < qty:
            return Response({'detail': f'Stock insuffisant (disponible: {item.product.stock}).'},
                            status=status.HTTP_400_BAD_REQUEST)
        item.qty = qty
        item.save()

    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def cart_item_remove(request, item_id):
    cart = get_or_create_cart(request)
    try:
        item = cart.items.get(pk=item_id)
        item.delete()
    except CartItem.DoesNotExist:
        return Response({'detail': 'Article introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


# ─── Orders ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def order_create(request):
    """
    Crée une commande à partir du panier actif.
    Accessible aux utilisateurs connectés ET aux invités.
    Body: adresse de livraison + shipping_method + (optionnel) create_account
    """
    serializer = OrderCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    cart = get_or_create_cart(request)
    if cart.item_count == 0:
        return Response({'detail': 'Le panier est vide.'}, status=status.HTTP_400_BAD_REQUEST)

    data            = serializer.validated_data
    shipping_method = data['shipping_method']
    shipping_cost   = float(data.get('shipping_cost', 0))
    if shipping_method == 'pickup':
        shipping_cost = 0.00
    subtotal        = float(cart.subtotal)
    tax             = 0.0

    # Appliquer le code promo si fourni
    promo_code_str  = request.data.get('promo_code', '').strip().upper()
    discount        = float(request.data.get('discount', 0))
    if promo_code_str and discount == 0:
        try:
            promo = PromoCode.objects.get(code=promo_code_str)
            valid, _ = promo.is_valid(subtotal)
            if valid:
                discount = promo.compute_discount(subtotal)
        except PromoCode.DoesNotExist:
            pass

    total = round(max(0, subtotal - discount) + shipping_cost, 2)

    # Utilisateur connecté ou invité
    user = request.user if request.user.is_authenticated else None

    order = Order.objects.create(
        user            = user,
        first_name      = data['first_name'],
        last_name       = data['last_name'],
        email           = data['email'],
        phone           = data['phone'],
        address         = data['address'],
        city            = data['city'],
        province        = data['province'],
        postal_code     = data['postal_code'],
        instructions    = data.get('instructions', ''),
        shipping_method = shipping_method,
        shipping_cost   = shipping_cost,
        subtotal        = subtotal,
        tax             = tax,
        total           = total,
    )

    # Incrementer le compteur d'utilisation du code promo
    if promo_code_str:
        try:
            from django.db.models import F
            PromoCode.objects.filter(code=promo_code_str).update(used_count=F('used_count') + 1)
        except Exception:
            pass

    # Créer les OrderItems depuis le Cart et décrémente le stock
    for item in cart.items.select_related('product').all():
        OrderItem.objects.create(
            order         = order,
            product       = item.product,
            product_name  = item.product.name,
            product_brand = item.product.brand,
            unit_price    = item.product.price,
            qty           = item.qty,
        )
        item.product.stock = max(0, item.product.stock - item.qty)
        item.product.save(update_fields=['stock'])

    # Vider le panier
    cart.items.all().delete()

    # ── Création de compte invité (optionnel) ──────────────────────────────────
    create_account = str(request.data.get('create_account', '')).lower() in ('true', '1', 'yes')
    if create_account and user is None:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        email = data['email']
        if not User.objects.filter(email=email).exists():
            try:
                new_user = User(
                    email      = email,
                    first_name = data['first_name'],
                    last_name  = data['last_name'],
                    phone      = data['phone'],
                )
                new_user.set_password('12345678')
                new_user.save()
                order.user            = new_user
                order.account_created = True
                order.save(update_fields=['user', 'account_created'])
            except Exception:
                pass  # La commande reste valide même si la création de compte échoue
    # ──────────────────────────────────────────────────────────────────────────

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_number):
    try:
        order = Order.objects.prefetch_related('items').get(
            order_number=order_number, user=request.user
        )
    except Order.DoesNotExist:
        return Response({'detail': 'Commande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderSerializer(order)
    return Response(serializer.data)


# ─── Paystack Webhook ─────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def paystack_webhook(request):
    """
    Reçoit les événements Paystack (charge.success) et marque la commande comme payée.
    À sécuriser avec la vérification HMAC en production.
    """
    event = request.data.get('event')
    data  = request.data.get('data', {})

    if event == 'charge.success':
        reference = data.get('reference', '')
        try:
            order = Order.objects.get(payment_ref=reference, is_paid=False)
            order.is_paid  = True
            order.paid_at  = timezone.now()
            order.status   = 'confirmed'
            order.save(update_fields=['is_paid', 'paid_at', 'status'])
        except Order.DoesNotExist:
            pass

    return Response({'status': 'ok'})


# ─── Stripe : créer la session de paiement ────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_checkout_view(request, order_number):
    """
    Crée une session Stripe Checkout et retourne l'URL de redirection.
    Accessible aux invités (pas de contrainte user=request.user).
    """
    try:
        order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({'detail': 'Commande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if order.is_paid:
        return Response({'detail': 'Commande déjà payée.'}, status=status.HTTP_400_BAD_REQUEST)

    if not settings.STRIPE_SECRET_KEY:
        return Response({'detail': 'Stripe non configuré.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    frontend_url = "https://www.mixmatchfrip.com"

    try:
        session = stripe.checkout.Session.create(
            customer_email=order.email,
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'cad',
                    'product_data': {
                        'name': f'Commande MixMatchFrip #{order.order_number}',
                    },
                    'unit_amount': int(order.total * 100),  # en cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{frontend_url}/payment-success/{order.order_number}?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{frontend_url}/payment-failed/{order.order_number}',
        )

        # Stocker l'ID de session pour vérification ultérieure
        order.payment_ref = session.id
        order.save(update_fields=['payment_ref'])

        return Response({'checkout_url': session.url})

    except stripe.error.StripeError as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Stripe : confirmer le paiement après retour ──────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def payment_success_view(request, order_number):
    """
    Appelé par PaymentSuccessScreen après la redirection Stripe.
    Vérifie la session Stripe, marque la commande payée, envoie l'email.
    Inspiré du projet lips_empire_by_arielle.
    """
    session_id = request.data.get('session_id', '').strip()
    if not session_id:
        return Response({'detail': 'Session ID requis.'}, status=status.HTTP_400_BAD_REQUEST)

    # select_for_update pour éviter les doubles traitements (race condition)
    with transaction.atomic():
        try:
            order = Order.objects.select_for_update().get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'detail': 'Commande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # Déjà traitée — retourner sans re-envoyer l'email
        if order.is_paid:
            return Response(OrderSerializer(order).data)

        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except stripe.error.StripeError as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if session.payment_status == 'paid':
            order.is_paid     = True
            order.payment_ref = session_id
            order.paid_at     = timezone.now()
            order.status      = 'confirmed'
            order.save(update_fields=['is_paid', 'payment_ref', 'paid_at', 'status'])

            # Créer l'envoi Chit Chats et sauvegarder l'ID de suivi
            if not order.shipment_id:
                try:
                    shipment_id = _create_chitchats_shipment(order)
                    if shipment_id:
                        order.shipment_id = shipment_id
                        order.save(update_fields=['shipment_id'])
                except Exception:
                    pass  # Ne pas bloquer la confirmation si Chit Chats échoue

            # Envoyer l'email de confirmation
            _send_order_confirmation_email(order)

            return Response(OrderSerializer(order).data)

        elif session.payment_status == 'unpaid':
            return Response({'detail': 'Paiement non complété.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'Paiement annulé.'}, status=status.HTTP_400_BAD_REQUEST)


def _create_chitchats_shipment(order):
    """
    Crée un envoi Chit Chats réel (non temporaire) pour une commande payée.
    Retourne le shipment_id (str) ou None en cas d'erreur / retrait en magasin.
    """
    import logging
    log = logging.getLogger(__name__)

    token     = getattr(settings, 'CHITCHATS_ACCESS_TOKEN', None)
    client_id = getattr(settings, 'CHITCHATS_CLIENT_ID', None)
    if not token or not client_id:
        return None
    if order.shipping_method == 'pickup':
        return None

    # Mapping nom de province → code ISO
    _PROV = {
        'Alberta': 'AB', 'Colombie-Britannique': 'BC', 'Manitoba': 'MB',
        'Nouveau-Brunswick': 'NB', 'Nouvelle-Écosse': 'NS', 'Ontario': 'ON',
        'Québec': 'QC', 'Saskatchewan': 'SK', 'Terre-Neuve-et-Labrador': 'NL',
        'Île-du-Prince-Édouard': 'PE', 'Territoires du Nord-Ouest': 'NT',
        'Nunavut': 'NU', 'Yukon': 'YT',
    }
    province_code = _PROV.get(order.province, order.province[:2].upper() if order.province else 'QC')

    # Poids total depuis les articles de la commande
    weight_g = sum(
        (item.product.weight_g if item.product else 400) * item.qty
        for item in order.items.select_related('product').all()
    ) or 400
    size_x, size_y, size_z = _estimate_package_dimensions(weight_g)

    base_url = f'https://chitchats.com/api/v1/clients/{client_id}/shipments'
    headers  = {'Authorization': token, 'Content-Type': 'application/json'}

    payload = {
        'name':                f'{order.first_name} {order.last_name}',
        'address_1':           order.address,
        'city':                order.city,
        'province_code':       province_code,
        'postal_code':         order.postal_code,
        'country_code':        'CA',
        'phone':               order.phone or '',
        'description':         'Vêtements seconde main — MixMatchFrip',
        'value':               str(round(float(order.subtotal), 2)),
        'value_currency':      'cad',
        'package_type':        'parcel',
        'size_unit':           'cm',
        'size_x':              size_x,
        'size_y':              size_y,
        'size_z':              size_z,
        'weight_unit':         'g',
        'weight':              max(weight_g, 50),
        'postage_type':        order.shipping_method,
        'ship_date':           'today',
        'order_id':            order.order_number,
        'insurance_requested': True,
        'signature_requested': False,
    }

    try:
        resp = http_requests.post(base_url, json=payload, headers=headers, timeout=15)
        if not resp.ok:
            log.error('ChitChats shipment creation HTTP %s: %s', resp.status_code, resp.text[:500])
            return None
        body        = resp.json()
        data        = body.get('shipment', body) if isinstance(body, dict) else {}
        shipment_id = data.get('id')
        log.info('ChitChats shipment created: id=%s order=%s', shipment_id, order.order_number)
        return str(shipment_id) if shipment_id else None
    except Exception as exc:
        log.error('ChitChats shipment exception: %s', exc)
        return None


def _send_order_confirmation_email(order):
    """Envoie l'email de confirmation de commande au client."""
    try:
        order_items  = order.items.select_related('product').all()
        tracking_url = (
            f'https://chitchats.com/tracking/{order.shipment_id}/'
            if order.shipment_id else None
        )
        context = {
            'order':            order,
            'order_items':      order_items,
            'tracking_url':     tracking_url,
            'account_created':  order.account_created,
            'account_email':    order.email if order.account_created else None,
            'account_password': '12345678'  if order.account_created else None,
        }
        subject   = f'MixMatchFrip — Commande #{order.order_number} confirmée ✓'
        text_body = render_to_string('email/order_confirmation.txt',  context)
        html_body = render_to_string('email/order_confirmation.html', context)
        send_mail(
            subject        = subject,
            message        = text_body,
            from_email     = settings.DEFAULT_FROM_EMAIL,
            recipient_list = [order.email],
            html_message   = html_body,
            fail_silently  = True,
        )
    except Exception:
        pass


# ─── Shipping rates (Chit Chats) ──────────────────────────────────────────────

# Mapping premiere lettre du code postal → province canadienne
_POSTAL_TO_PROVINCE = {
    'A': 'NL', 'B': 'NS', 'C': 'PE', 'E': 'NB',
    'G': 'QC', 'H': 'QC', 'J': 'QC',
    'K': 'ON', 'L': 'ON', 'M': 'ON', 'N': 'ON', 'P': 'ON',
    'R': 'MB', 'S': 'SK', 'T': 'AB', 'V': 'BC',
    'X': 'NT', 'Y': 'YT',
}

def _province_from_postal(postal_code):
    return _POSTAL_TO_PROVINCE.get(postal_code[0].upper() if postal_code else '', 'QC')


@api_view(['POST'])
@permission_classes([AllowAny])
def shipping_rates(request):
    """
    Retourne les options de livraison via Chit Chats.
    Fallback sur tarifs statiques si les credentials sont absents.
    """
    import logging
    log = logging.getLogger(__name__)

    destination = request.data.get('postal_code', '').replace(' ', '').upper()
    weight_g    = int(request.data.get('weight_g', 500))
    cart_value  = request.data.get('cart_value')        # valeur du panier en $CAD (optionnel)

    if not destination:
        return Response({'detail': 'Code postal requis.'}, status=status.HTTP_400_BAD_REQUEST)

    token     = settings.CHITCHATS_ACCESS_TOKEN
    client_id = settings.CHITCHATS_CLIENT_ID

    if token and client_id:
        try:
            rates = _get_chitchats_rates(destination, weight_g, token, client_id, cart_value=cart_value)
            return Response(rates)
        except Exception as exc:
            log.error('Chit Chats API error: %s', exc)
            if settings.DEBUG:
                return Response(
                    {'detail': f'Chit Chats: {exc}'},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

    return Response(_static_shipping_rates())


def _static_shipping_rates():
    return [
        {'code': 'chit_chats_canada_tracked',  'name': 'Chit Chats Standard — 5 a 7 jours', 'price': 4.99,  'days': '5-7'},
        {'code': 'chit_chats_canada_priority',  'name': 'Chit Chats Prioritaire — 2 a 3 jours', 'price': 12.99, 'days': '2-3'},
        {'code': 'pickup',                       'name': 'Retrait en magasin — Gratuit',         'price': 0.00,  'days': '0'},
    ]


# Ville representive par province pour le colis temporaire de tarification
_PROVINCE_CITY = {
    'AB': 'Calgary',       'BC': 'Vancouver',    'MB': 'Winnipeg',
    'NB': 'Fredericton',   'NL': "St. John's",   'NS': 'Halifax',
    'NT': 'Yellowknife',   'NU': 'Iqaluit',      'ON': 'Toronto',
    'PE': 'Charlottetown', 'QC': 'Montreal',     'SK': 'Saskatoon',
    'YT': 'Whitehorse',
}


def _estimate_package_dimensions(weight_g):
    """
    Estime les dimensions d'un colis vêtements (cm) en fonction du poids.
    Basé sur des tailles réelles d'envois de friperie.
    """
    if weight_g < 200:
        return 20, 15, 3    # accessoire, chaussettes, foulard
    elif weight_g < 400:
        return 25, 20, 4    # t-shirt, débardeur
    elif weight_g < 700:
        return 30, 20, 5    # chemise, haut léger, pantalon fin
    elif weight_g < 1000:
        return 35, 25, 6    # jean, pull, robe légère
    elif weight_g < 1500:
        return 40, 30, 8    # pull épais, robe longue, veste légère
    else:
        return 50, 35, 10   # manteau, veste épaisse, multiple articles


def _get_chitchats_rates(destination_postal, weight_g, token, client_id, cart_value=None):
    """
    Cree un colis temporaire Chit Chats avec postage_type=unknown pour obtenir
    les tarifs disponibles, puis supprime le colis immediatement.
    Format de payload base sur la doc officielle Chit Chats.
    """
    import logging, re
    log = logging.getLogger(__name__)

    province_code        = _province_from_postal(destination_postal)
    city                 = _PROVINCE_CITY.get(province_code, 'Montreal')
    size_x, size_y, size_z = _estimate_package_dimensions(weight_g)
    declared_value       = str(round(float(cart_value), 2)) if cart_value else '50'

    base_url = f'https://chitchats.com/api/v1/clients/{client_id}/shipments'
    headers  = {
        'Authorization': token,
        'Content-Type':  'application/json',
    }

    # Payload calque exactement sur la doc officielle Chit Chats
    payload = {
        'name':           'Client MixMatchFrip',
        'address_1':      '1 Main St',
        'city':           city,
        'province_code':  province_code,
        'postal_code':    destination_postal,
        'country_code':   'CA',
        'description':    'Vetements seconde main',
        'value':          declared_value,
        'value_currency': 'cad',
        'package_type':   'parcel',
        'size_unit':      'cm',
        'size_x':         size_x,
        'size_y':         size_y,
        'size_z':         size_z,
        'weight_unit':    'g',
        'weight':         max(weight_g, 50),
        'postage_type':   'unknown',
        'ship_date':      'today',
    }

    resp = http_requests.post(base_url, json=payload, headers=headers, timeout=15)
    log.debug('ChitChats create → HTTP %s\n%s', resp.status_code, resp.text[:800])

    if not resp.ok:
        raise Exception(f'HTTP {resp.status_code}: {resp.text[:500]}')

    body = resp.json()

    # Chit Chats peut retourner soit l'objet directement, soit wrappé dans "shipment"
    data = body.get('shipment', body) if isinstance(body, dict) else {}

    shipment_id = data.get('id')
    rates_raw   = data.get('rates', [])

    log.debug('ChitChats shipment_id=%s rates_count=%s', shipment_id, len(rates_raw))
    if not rates_raw:
        # Logguer la reponse complete pour faciliter le debug
        log.error('ChitChats reponse complete: %s', resp.text[:1000])
        raise Exception(
            f'Aucun tarif retourne (id={shipment_id}). '
            f'Reponse: {resp.text[:300]}'
        )

    # Supprimer le colis temporaire immediatement
    if shipment_id:
        try:
            http_requests.delete(f'{base_url}/{shipment_id}', headers=headers, timeout=5)
        except Exception:
            pass

    rates = []
    for r in rates_raw:
        postage_type  = r.get('postage_type', '')
        description   = r.get('postage_description') or postage_type.replace('_', ' ').title()
        delivery_desc = r.get('delivery_time_description', '')

        # Extraire le nombre de jours depuis la description ("2 business days" → "2")
        days_match = re.search(r'(\d[\d\-]*)', delivery_desc)
        days       = days_match.group(1) if days_match else ''

        # Prix total : total_fee est prioritaire, fallback sur postage_fee
        raw_price = r.get('total_fee') or r.get('postage_fee') or '0'
        try:
            price = float(raw_price)
        except (ValueError, TypeError):
            price = 0.0

        label = f'{description} — {delivery_desc}' if delivery_desc else description
        rates.append({'code': postage_type, 'name': label, 'price': price, 'days': days})

    # Trier par prix croissant
    rates.sort(key=lambda x: x['price'])

    # Ajouter retrait en magasin
    rates.append({'code': 'pickup', 'name': 'Retrait en magasin \u2014 Gratuit', 'price': 0.00, 'days': '0'})
    return rates


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN VIEWS  (IsAdminUser = is_staff=True requis)
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Stats dashboard ──────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    total_revenue   = Order.objects.filter(is_paid=True).aggregate(t=Sum('total'))['t'] or 0
    orders_today    = Order.objects.filter(created_at__date=timezone.now().date()).count()
    pending_orders  = Order.objects.filter(status='pending').count()
    total_orders    = Order.objects.count()
    total_products  = Product.objects.filter(is_available=True).count()
    low_stock       = Product.objects.filter(stock__lte=2, is_available=True).count()
    total_clients   = User.objects.filter(is_staff=False).count()

    # Revenus des 7 derniers jours
    from datetime import timedelta
    from django.db.models.functions import TruncDate
    week_ago = timezone.now() - timedelta(days=7)
    revenue_by_day = (
        Order.objects
        .filter(is_paid=True, paid_at__gte=week_ago)
        .annotate(day=TruncDate('paid_at'))
        .values('day')
        .annotate(total=Sum('total'))
        .order_by('day')
    )

    return Response({
        'total_revenue':  float(total_revenue),
        'orders_today':   orders_today,
        'pending_orders': pending_orders,
        'total_orders':   total_orders,
        'total_products': total_products,
        'low_stock':      low_stock,
        'total_clients':  total_clients,
        'revenue_by_day': list(revenue_by_day),
    })


# ─── Admin Products ───────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_product_list(request):
    if request.method == 'GET':
        search = request.GET.get('search', '').strip()
        qs = Product.objects.select_related('category').prefetch_related('images').order_by('-created_at')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(brand__icontains=search))
        serializer = ProductDetailSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    # POST — créer un produit
    data = request.data

    # ── Validation des champs obligatoires ────────────────────────────────────
    name      = (data.get('name') or '').strip()
    price_raw = data.get('price')
    if not name:
        return Response({'detail': 'Le nom du produit est requis.'}, status=status.HTTP_400_BAD_REQUEST)
    if price_raw in ('', None):
        return Response({'detail': 'Le prix est requis.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        price = float(price_raw)   # coerce string → float pour éviter les comparaisons str/float
    except (ValueError, TypeError):
        return Response({'detail': 'Le prix doit être un nombre valide.'}, status=status.HTTP_400_BAD_REQUEST)

    category_id    = data.get('category')
    subcategory_id = data.get('subcategory')
    try:
        category = Category.objects.get(pk=category_id) if category_id else None
    except Category.DoesNotExist:
        return Response({'detail': 'Catégorie introuvable.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        subcategory = Subcategory.objects.get(pk=subcategory_id) if subcategory_id else None
    except Subcategory.DoesNotExist:
        subcategory = None

    def _decimal_or_none(val):
        try:
            return float(val) if val not in ('', None) else None
        except (ValueError, TypeError):
            return None

    def _safe_int(val, default):
        try:
            return int(val) if val not in ('', None) else default
        except (ValueError, TypeError):
            return default

    try:
        product = Product.objects.create(
            category            = category,
            subcategory         = subcategory,
            name                = name,
            brand               = data.get('brand', ''),
            description         = data.get('description', ''),
            price               = price,
            original_price      = _decimal_or_none(data.get('original_price')),
            size                = data.get('size', 'M'),
            size_tag            = data.get('size_tag', ''),
            size_recommendation = data.get('size_recommendation', ''),
            condition           = data.get('condition', 'good'),
            color               = data.get('color', []),
            stock               = _safe_int(data.get('stock'), 1),
            weight_g            = _safe_int(data.get('weight_g'), 400),
            is_available        = data.get('is_available', True),
            material            = data.get('material', ''),
            details             = data.get('details', ''),
            bullet_1            = data.get('bullet_1', ''),
            bullet_2            = data.get('bullet_2', ''),
            bullet_3            = data.get('bullet_3', ''),
            bullet_4            = data.get('bullet_4', ''),
            mix_match_tips      = data.get('mix_match_tips', ''),
            expert_tip          = data.get('expert_tip', ''),
            measure_shoulder    = _decimal_or_none(data.get('measure_shoulder')),
            measure_chest       = _decimal_or_none(data.get('measure_chest')),
            measure_waist       = _decimal_or_none(data.get('measure_waist')),
            measure_hips        = _decimal_or_none(data.get('measure_hips')),
            measure_length      = _decimal_or_none(data.get('measure_length')),
            measure_sleeve      = _decimal_or_none(data.get('measure_sleeve')),
        )
        # ⚠️ La sérialisation est incluse dans le même try pour capturer toute exception
        return Response(
            ProductDetailSerializer(product, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error('admin_product_list POST error: %s', exc, exc_info=True)
        return Response(
            {'detail': f'Erreur lors de la création du produit : {exc}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_product_detail(request, pk):
    try:
        product = Product.objects.select_related('category').prefetch_related('images').get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Produit introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductDetailSerializer(product, context={'request': request}).data)

    if request.method == 'PUT':
        data = request.data

        category_id = data.get('category')
        if category_id:
            try:
                product.category = Category.objects.get(pk=category_id)
            except Category.DoesNotExist:
                pass
        elif 'category' in data:
            product.category = None

        subcategory_id = data.get('subcategory')
        if subcategory_id:
            try:
                product.subcategory = Subcategory.objects.get(pk=subcategory_id)
            except Subcategory.DoesNotExist:
                pass
        elif 'subcategory' in data:
            product.subcategory = None

        def _decimal_or_none(val):
            try:
                return float(val) if val not in ('', None) else None
            except (ValueError, TypeError):
                return None

        simple_fields = [
            'name', 'brand', 'description', 'size', 'size_tag', 'size_recommendation',
            'condition', 'color', 'stock', 'weight_g', 'is_available',
            'material', 'details',
            'bullet_1', 'bullet_2', 'bullet_3', 'bullet_4',
            'mix_match_tips', 'expert_tip',
        ]
        for field in simple_fields:
            if field in data:
                setattr(product, field, data[field])

        decimal_fields = [
            'price', 'original_price',
            'measure_shoulder', 'measure_chest', 'measure_waist',
            'measure_hips', 'measure_length', 'measure_sleeve',
        ]
        for field in decimal_fields:
            if field in data:
                setattr(product, field, _decimal_or_none(data[field]))

        product.save()
        return Response(ProductDetailSerializer(product, context={'request': request}).data)

    # DELETE
    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_product_upload_image(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Produit introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    image   = request.FILES.get('image')
    is_main = request.data.get('is_main', False)
    if not image:
        return Response({'detail': 'Image requise.'}, status=status.HTTP_400_BAD_REQUEST)

    if is_main:
        product.images.update(is_main=False)

    img = ProductImage.objects.create(product=product, image=image, is_main=bool(is_main))
    return Response(ProductImageSerializer(img, context={'request': request}).data,
                    status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_product_delete_image(request, pk, image_id):
    try:
        img = ProductImage.objects.get(pk=image_id, product_id=pk)
    except ProductImage.DoesNotExist:
        return Response({'detail': 'Image introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    img.image.delete(save=False)
    img.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Admin Orders ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_order_list(request):
    status_filter = request.GET.get('status')
    search        = request.GET.get('search', '').strip()

    qs = Order.objects.prefetch_related('items').select_related('user').order_by('-created_at')
    if status_filter:
        qs = qs.filter(status=status_filter)
    if search:
        qs = qs.filter(
            Q(order_number__icontains=search) |
            Q(first_name__icontains=search)   |
            Q(last_name__icontains=search)    |
            Q(email__icontains=search)
        )
    serializer = OrderSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_order_update_status(request, order_number):
    try:
        order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({'detail': 'Commande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    valid = [s[0] for s in Order._meta.get_field('status').choices]
    if new_status not in valid:
        return Response({'detail': f'Statut invalide. Valeurs: {valid}'},
                        status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    order.save(update_fields=['status'])
    return Response(OrderSerializer(order).data)


# ─── Admin Promo Codes ────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_promo_list(request):
    if request.method == 'GET':
        promos = PromoCode.objects.all().order_by('-created_at')
        return Response(PromoCodeSerializer(promos, many=True).data)

    # POST — creer un code
    serializer = PromoCodeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_promo_detail(request, pk):
    try:
        promo = PromoCode.objects.get(pk=pk)
    except PromoCode.DoesNotExist:
        return Response({'detail': 'Code promo introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = PromoCodeSerializer(promo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    promo.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Admin Categories ─────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_category_list(request):
    if request.method == 'GET':
        categories = Category.objects.prefetch_related('subcategories').all()
        return Response(CategorySerializer(categories, many=True, context={'request': request}).data)

    # POST
    name = request.data.get('name', '').strip()
    if not name:
        return Response({'detail': 'Nom requis.'}, status=status.HTTP_400_BAD_REQUEST)
    cat = Category(name=name)
    if request.FILES.get('image'):
        cat.image = request.FILES['image']
    cat.save()
    return Response(CategorySerializer(cat, context={'request': request}).data,
                    status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_category_detail(request, pk):
    try:
        cat = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'detail': 'Catégorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        name = request.data.get('name', cat.name).strip()
        if not name:
            return Response({'detail': 'Nom requis.'}, status=status.HTTP_400_BAD_REQUEST)
        cat.name = name
        if request.FILES.get('image'):
            cat.image = request.FILES['image']
        cat.save()
        return Response(CategorySerializer(cat, context={'request': request}).data)

    cat.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Admin Subcategories ───────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_subcategory_list(request):
    if request.method == 'GET':
        subs = Subcategory.objects.select_related('category').all()
        return Response(SubcategoryAdminSerializer(subs, many=True).data)

    # POST
    name       = request.data.get('name', '').strip()
    cat_id     = request.data.get('category')
    if not name:
        return Response({'detail': 'Nom requis.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        cat = Category.objects.get(pk=cat_id)
    except (Category.DoesNotExist, TypeError, ValueError):
        return Response({'detail': 'Catégorie requise.'}, status=status.HTTP_400_BAD_REQUEST)

    sub = Subcategory(category=cat, name=name)
    sub.save()
    return Response(SubcategoryAdminSerializer(sub).data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_subcategory_detail(request, pk):
    try:
        sub = Subcategory.objects.select_related('category').get(pk=pk)
    except Subcategory.DoesNotExist:
        return Response({'detail': 'Sous-catégorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        name   = request.data.get('name', sub.name).strip()
        cat_id = request.data.get('category')
        if not name:
            return Response({'detail': 'Nom requis.'}, status=status.HTTP_400_BAD_REQUEST)
        if cat_id:
            try:
                sub.category = Category.objects.get(pk=cat_id)
            except Category.DoesNotExist:
                return Response({'detail': 'Catégorie introuvable.'}, status=status.HTTP_400_BAD_REQUEST)
        sub.name = name
        sub.save()
        return Response(SubcategoryAdminSerializer(sub).data)

    sub.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Promo Apply (public — utilise par le checkout) ───────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def promo_apply(request):
    """
    Valide un code promo et retourne le montant de remise.
    Accessible aux invités et utilisateurs connectés.
    Body: { code: str, subtotal: float }
    """
    code     = request.data.get('code', '').strip().upper()
    subtotal = float(request.data.get('subtotal', 0))

    try:
        promo = PromoCode.objects.get(code=code)
    except PromoCode.DoesNotExist:
        return Response({'detail': 'Code promo invalide.'}, status=status.HTTP_404_NOT_FOUND)

    valid, msg = promo.is_valid(subtotal)
    if not valid:
        return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)

    discount_amount = promo.compute_discount(subtotal)
    return Response({
        'code':            promo.code,
        'discount_type':   promo.discount_type,
        'discount_value':  float(promo.discount_value),
        'discount_amount': round(discount_amount, 2),
    })


# ─── Admin Newsletter ─────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_newsletter_list(request):
    from .models import NewsletterSubscriber
    subs = NewsletterSubscriber.objects.all().order_by('-created_at')
    data = [
        {'id': s.id, 'email': s.email, 'created_at': s.created_at}
        for s in subs
    ]
    return Response({'count': len(data), 'results': data})


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_newsletter_detail(request, pk):
    from .models import NewsletterSubscriber
    try:
        sub = NewsletterSubscriber.objects.get(pk=pk)
    except NewsletterSubscriber.DoesNotExist:
        return Response({'detail': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    sub.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Admin Clients (cart + wishlist) ──────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_clients_list(request):
    from django.contrib.auth import get_user_model
    UserModel = get_user_model()

    users = UserModel.objects.filter(
        is_staff=False, is_superuser=False
    ).order_by('-date_joined')

    result = []
    for user in users:
        # ── Panier ──
        cart_items = []
        cart_total = 0.0
        try:
            cart = user.cart
            for item in cart.items.select_related('product').all():
                img = item.product.main_image
                cart_items.append({
                    'product_id':   item.product.id,
                    'product_name': item.product.name,
                    'brand':        item.product.brand,
                    'price':        float(item.product.price),
                    'qty':          item.qty,
                    'line_total':   item.line_total,
                    'image':        request.build_absolute_uri(img.image.url) if img else None,
                    'slug':         item.product.slug,
                })
            cart_total = float(cart.subtotal)
        except Exception:
            pass

        # ── Wishlist ──
        wishlist_items = []
        for w in user.wishlist.select_related('product').all():
            img = w.product.main_image
            wishlist_items.append({
                'product_id':   w.product.id,
                'product_name': w.product.name,
                'brand':        w.product.brand,
                'price':        float(w.product.price),
                'image':        request.build_absolute_uri(img.image.url) if img else None,
                'slug':         w.product.slug,
            })

        result.append({
            'id':           user.id,
            'email':        user.email,
            'full_name':    user.full_name or user.username or '',
            'phone':        user.phone or '',
            'date_joined':  user.date_joined,
            'last_login':   user.last_login,
            'orders_count': user.orders.count(),
            'cart':         cart_items,
            'cart_total':   cart_total,
            'wishlist':     wishlist_items,
        })

    return Response({'count': len(result), 'results': result})


# ─── Newsletter ───────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def newsletter_subscribe(request):
    """
    Enregistre un email pour la newsletter.
    Body: { email: str }
    """
    from .models import NewsletterSubscriber
    import re

    email = (request.data.get('email') or '').strip().lower()
    if not email or not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        return Response({'detail': 'Adresse e-mail invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    _, created = NewsletterSubscriber.objects.get_or_create(email=email)
    if created:
        return Response({'detail': 'Inscription confirmée !'}, status=status.HTTP_201_CREATED)
    # Already subscribed — treat as success so no info leakage
    return Response({'detail': 'Vous êtes déjà inscrit(e).'}, status=status.HTTP_200_OK)
