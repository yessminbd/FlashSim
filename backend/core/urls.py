from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegionViewSet, OperatorViewSet, RechargeCardViewSet,
    TransactionViewSet, ClaimViewSet
)

router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'operators', OperatorViewSet)
router.register(r'cards', RechargeCardViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'claims', ClaimViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
