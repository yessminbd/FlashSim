from rest_framework import viewsets
from .models import Region, Operator, RechargeCard, Transaction, Claim
from .serializers import (
    RegionSerializer, OperatorSerializer, RechargeCardSerializer, 
    TransactionSerializer, ClaimSerializer
)

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class OperatorViewSet(viewsets.ModelViewSet):
    queryset = Operator.objects.all()
    serializer_class = OperatorSerializer

class RechargeCardViewSet(viewsets.ModelViewSet):
    queryset = RechargeCard.objects.all()
    serializer_class = RechargeCardSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer

class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all().order_by('-created_at')
    serializer_class = ClaimSerializer
