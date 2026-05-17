from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Region, Operator, RechargeCard, Transaction, Claim

User = get_user_model()


# ─── AUTH SERIALIZERS ─────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['email', 'name', 'phone', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'email', 'name', 'phone', 'role', 'created_at']
        read_only_fields = ['id', 'role', 'created_at']


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['name', 'phone']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


# ─── DATA SERIALIZERS ─────────────────────────────────────────────────────────

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Region
        fields = '__all__'


class OperatorSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    available_amounts = serializers.SerializerMethodField()

    class Meta:
        model  = Operator
        fields = '__all__'

    def get_available_amounts(self, obj):
        # Retourne les montants distincts pour lesquels il y a des cartes non utilisées
        amounts = RechargeCard.objects.filter(operator=obj, is_used=False).values_list('amount', flat=True).distinct()
        return [float(a) for a in amounts]


class RechargeCardSerializer(serializers.ModelSerializer):
    operator_name  = serializers.CharField(source='operator.name', read_only=True)
    operator_region = serializers.CharField(source='operator.region.name', read_only=True)

    class Meta:
        model  = RechargeCard
        fields = '__all__'

    def validate_pin_code(self, value):
        if not value or str(value).strip() == "":
            raise serializers.ValidationError("Le code PIN ne peut pas être vide.")
        
        # Check uniqueness (excluding current card if editing)
        instance_id = self.instance.id if self.instance else None
        qs = RechargeCard.objects.filter(pin_code=value)
        if instance_id:
            qs = qs.exclude(id=instance_id)
        if qs.exists():
            raise serializers.ValidationError("Ce code PIN existe déjà dans le système.")
        return value

    def validate_serial_number(self, value):
        if not value or str(value).strip() == "":
            raise serializers.ValidationError("Le numéro de série ne peut pas être vide.")
        
        # Check uniqueness (excluding current card if editing)
        instance_id = self.instance.id if self.instance else None
        qs = RechargeCard.objects.filter(serial_number=value)
        if instance_id:
            qs = qs.exclude(id=instance_id)
        if qs.exists():
            raise serializers.ValidationError("Ce numéro de série existe déjà dans le système.")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    user_email    = serializers.CharField(source='user.email', read_only=True)
    user_name     = serializers.CharField(source='user.name', read_only=True)
    pin_code      = serializers.CharField(source='card.pin_code', read_only=True, default=None)

    class Meta:
        model  = Transaction
        fields = '__all__'
        read_only_fields = ['user', 'card', 'stripe_payment_intent', 'created_at']


class ClaimSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name  = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model  = Claim
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class ClaimCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Claim
        fields = ['transaction', 'subject', 'message']


class AdminClaimUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Claim
        fields = ['status', 'admin_reply']
