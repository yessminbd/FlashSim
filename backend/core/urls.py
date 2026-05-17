from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, MeView, change_password, delete_account,
    RegionViewSet, OperatorViewSet, RechargeCardViewSet,
    TransactionViewSet, ClaimViewSet,
    create_payment_intent, confirm_payment, checkout_direct,
    admin_stats, admin_users,
)

router = DefaultRouter()
router.register(r'regions',      RegionViewSet)
router.register(r'operators',    OperatorViewSet)
router.register(r'cards',        RechargeCardViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'claims',       ClaimViewSet)

urlpatterns = [
    # Auth
    path('auth/register/',        RegisterView.as_view(),     name='register'),
    path('auth/login/',           LoginView.as_view(),        name='login'),
    path('auth/token/refresh/',   TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/',              MeView.as_view(),           name='me'),
    path('auth/change-password/', change_password,            name='change_password'),
    path('auth/delete-account/',  delete_account,             name='delete_account'),

    # Stripe & Direct Payment
    path('payment/create-intent/', create_payment_intent, name='create_payment_intent'),
    path('payment/confirm/',       confirm_payment,        name='confirm_payment'),
    path('payment/checkout-direct/', checkout_direct,      name='checkout_direct'),

    # Admin
    path('admin/stats/', admin_stats, name='admin_stats'),
    path('admin/users/', admin_users, name='admin_users'),

    # CRUD (regions, operators, cards, transactions, claims)
    path('', include(router.urls)),
]
