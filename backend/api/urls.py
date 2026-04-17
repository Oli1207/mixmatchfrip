from django.urls import path
from userauths import views as userauths_views
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [

    # ── Auth ──────────────────────────────────────────────────────────────────
    path('user/token/',                  userauths_views.MyTokenObtainPairView.as_view()),
    path('user/token/refresh/',          TokenRefreshView.as_view()),
    path('user/register/',               userauths_views.RegisterView.as_view()),
    path('user/profile/<int:user_id>/',  userauths_views.ProfileView.as_view()),
    path('user/me/',                     userauths_views.MeView.as_view(),             name='me'),
    path('user/me/update/',              userauths_views.MeUpdateView.as_view(),        name='me-update'),
    path('user/me/change-password/',     userauths_views.ChangePasswordView.as_view(), name='me-change-password'),
    path('user/password-reset/',         userauths_views.PasswordResetEmailVerify.as_view()),
    path('user/password-reset-confirm/', userauths_views.PasswordResetConfirmAPIView.as_view()),

    # ── Categories & Sous-categories ─────────────────────────────────────────
    path('categories/',                         views.category_list,       name='category-list'),
    path('subcategories/',                      views.subcategory_list,    name='subcategory-list'),
    path('categories/<slug:slug>/subcategories/', views.subcategories_by_category, name='subcategories-by-category'),

    # ── Products ──────────────────────────────────────────────────────────────
    path('products/',           views.product_list,   name='product-list'),
    path('products/<slug:slug>/', views.product_detail, name='product-detail'),

    # ── Wishlist ──────────────────────────────────────────────────────────────
    path('wishlist/',        views.wishlist_list,   name='wishlist-list'),
    path('wishlist/toggle/', views.wishlist_toggle, name='wishlist-toggle'),

    # ── Cart ──────────────────────────────────────────────────────────────────
    path('cart/',                   views.cart_detail,      name='cart-detail'),
    path('cart/add/',               views.cart_add,          name='cart-add'),
    path('cart/item/<int:item_id>/', views.cart_item_update, name='cart-item-update'),
    path('cart/item/<int:item_id>/remove/', views.cart_item_remove, name='cart-item-remove'),

    # ── Orders ────────────────────────────────────────────────────────────────
    path('orders/',                                    views.order_list,            name='order-list'),
    path('orders/create/',                             views.order_create,          name='order-create'),
    path('orders/<str:order_number>/',                 views.order_detail,          name='order-detail'),
    path('orders/<str:order_number>/stripe-checkout/',  views.stripe_checkout_view,  name='order-stripe-checkout'),
    path('orders/<str:order_number>/payment-success/', views.payment_success_view,   name='order-payment-success'),

    # ── Shipping ──────────────────────────────────────────────────────────────
    path('shipping/rates/', views.shipping_rates, name='shipping-rates'),

    # ── Webhooks ──────────────────────────────────────────────────────────────
    path('webhooks/paystack/', views.paystack_webhook, name='paystack-webhook'),

    # ── Newsletter ────────────────────────────────────────────────────────────
    path('newsletter/subscribe/', views.newsletter_subscribe, name='newsletter-subscribe'),

    # ── Promo ─────────────────────────────────────────────────────────────────
    path('promo/apply/', views.promo_apply, name='promo-apply'),

    # ── Admin ─────────────────────────────────────────────────────────────────
    path('admin/stats/',                            views.admin_stats,               name='admin-stats'),
    path('admin/products/',                         views.admin_product_list,         name='admin-products'),
    path('admin/products/<int:pk>/',                views.admin_product_detail,       name='admin-product-detail'),
    path('admin/products/<int:pk>/images/',                        views.admin_product_upload_image,  name='admin-product-images'),
    path('admin/products/<int:pk>/images/<int:image_id>/',         views.admin_product_delete_image,  name='admin-product-image-delete'),
    path('admin/orders/',                           views.admin_order_list,           name='admin-orders'),
    path('admin/orders/<str:order_number>/status/', views.admin_order_update_status,  name='admin-order-status'),
    path('admin/promos/',                           views.admin_promo_list,           name='admin-promos'),
    path('admin/promos/<int:pk>/',                  views.admin_promo_detail,         name='admin-promo-detail'),
    path('admin/categories/',                       views.admin_category_list,        name='admin-categories'),
    path('admin/categories/<int:pk>/',              views.admin_category_detail,      name='admin-category-detail'),
    path('admin/subcategories/',                    views.admin_subcategory_list,     name='admin-subcategories'),
    path('admin/subcategories/<int:pk>/',           views.admin_subcategory_detail,   name='admin-subcategory-detail'),
]
