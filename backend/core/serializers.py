from rest_framework import serializers
from .models import Region, Operator, RechargeCard, Transaction, Claim

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'

class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operator
        fields = '__all__'

class RechargeCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RechargeCard
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    class Meta:
        model = Transaction
        fields = '__all__'

class ClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = '__all__'
