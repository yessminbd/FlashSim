import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Region, Operator, RechargeCard, Transaction, Claim
from .serializers import (
    RegisterSerializer, UserSerializer, UpdateProfileSerializer,
    ChangePasswordSerializer, RegionSerializer, OperatorSerializer,
    RechargeCardSerializer, TransactionSerializer, ClaimSerializer,
    ClaimCreateSerializer, AdminClaimUpdateSerializer
)
from .permissions import IsAdmin, IsClient, IsAdminOrReadOnly

User = get_user_model()
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


# âââ AUTH âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouveau client."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Connexion avec email + mot de passe, retourne tokens JWT."""
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Identifiants invalides.'}, status=400)
        if not user.check_password(password):
            return Response({'error': 'Identifiants invalides.'}, status=400)
        if not user.is_active:
            return Response({'error': 'Compte dÃ©sactivÃ©.'}, status=403)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(generics.RetrieveUpdateAPIView):
    """Profil de l'utilisateur connectÃ©."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Changer le mot de passe de l'utilisateur connectÃ©."""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({'error': 'Ancien mot de passe incorrect.'}, status=400)
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'message': 'Mot de passe mis Ã  jour avec succÃ¨s.'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Supprimer son propre compte."""
    request.user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# âââ REGION âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAdminOrReadOnly]


# âââ OPERATOR âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

class OperatorViewSet(viewsets.ModelViewSet):
    queryset = Operator.objects.select_related('region').all()
    serializer_class = OperatorSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        region = self.request.query_params.get('region')
        if region:
            qs = qs.filter(region__id=region)
        return qs


# âââ RECHARGE CARDS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

class RechargeCardViewSet(viewsets.ModelViewSet):
    queryset = RechargeCard.objects.select_related('operator', 'operator__region').all()
    serializer_class = RechargeCardSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        operator = self.request.query_params.get('operator')
        is_used  = self.request.query_params.get('is_used')
        if operator:
            qs = qs.filter(operator__id=operator)
        if is_used is not None:
            qs = qs.filter(is_used=(is_used.lower() == 'true'))
        return qs


# âââ TRANSACTIONS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('user', 'operator', 'card').order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = super().get_queryset()
        if user.role == 'admin':
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        operator = serializer.validated_data.get('operator')
        amount = serializer.validated_data.get('amount')
        
        # Trouver une carte disponible
        card = RechargeCard.objects.filter(
            operator=operator,
            amount=amount,
            is_used=False
        ).first()

        if not card:
            import random
            pin = "".join(random.choices("0123456789", k=14))
            serial = "SN" + "".join(random.choices("0123456789", k=12))
            card = RechargeCard.objects.create(
                operator=operator,
                amount=amount,
                pin_code=pin,
                serial_number=serial,
                is_used=False
            )

        card.is_used = True
        card.save()
        serializer.save(user=self.request.user, card=card, status='success')


# âââ STRIPE PAYMENT âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    CrÃ©e une session Stripe Checkout pour rediriger l'utilisateur vers la page de paiement.
    Body: { "items": [{"name": "Orange 5DT", "amount": 5000, "quantity": 1}], "success_url": "http://localhost:5173/profile?success=true", "cancel_url": "http://localhost:5173/checkout" }
    """
    try:
        items_data = request.data.get('items', [])
        success_url = request.data.get('success_url', 'http://localhost:5173/profile?success=true')
        cancel_url = request.data.get('cancel_url', 'http://localhost:5173/checkout')

        currency = request.data.get('currency', 'eur')

        line_items = []
        for item in items_data:
            line_items.append({
                'price_data': {
                    'currency': currency,
                    'product_data': {
                        'name': item.get('name', 'Recharge'),
                    },
                    'unit_amount': int(item.get('amount', 0)), # en centimes
                },
                'quantity': item.get('quantity', 1),
            })

        if not line_items:
            return Response({'error': 'Panier vide.'}, status=400)

        # CrÃ©er la session Checkout
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url + "&session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={'user_id': request.user.id, 'user_email': request.user.email}
        )

        return Response({'url': session.url, 'session_id': session.id})
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """
    Confirme le paiement via le session_id et crÃ©e les transactions.
    Body: { "session_id": "cs_test_xxx", "cart_items": [{"operator_id":1, "amount":5, "phone":"...", "quantity":1}] }
    """
    session_id = request.data.get('session_id')
    items = request.data.get('cart_items', [])

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status != 'paid':
            return Response({'error': 'Paiement non validÃ©.'}, status=400)
        
        # Check if already confirmed (avoid duplicates if user reloads page)
        if Transaction.objects.filter(stripe_payment_intent=session_id).exists():
            return Response({'message': 'DÃ©jÃ  confirmÃ©.'}, status=200)

    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=400)

    created_transactions = []
    errors = []

    for item in items:
        operator_id = item.get('operator_id')
        amount      = item.get('amount')
        phone       = item.get('phone', '')
        quantity    = item.get('quantity', 1)

        for _ in range(quantity):
            # Chercher une carte disponible
            card = RechargeCard.objects.filter(
                operator_id=operator_id,
                amount=amount,
                is_used=False
            ).first()

            if not card:
                import random
                pin = "".join(random.choices("0123456789", k=14))
                serial = "SN" + "".join(random.choices("0123456789", k=12))
                card = RechargeCard.objects.create(
                    operator_id=operator_id,
                    amount=amount,
                    pin_code=pin,
                    serial_number=serial,
                    is_used=False
                )

            tx = Transaction.objects.create(
                user=request.user,
                operator_id=operator_id,
                card=card,
                phone_number=phone,
                amount=amount,
                status='success',
                stripe_payment_intent=session_id
            )

            card.is_used = True
            card.save()
            created_transactions.append({
                'transaction_id': tx.id,
                'pin_code': card.pin_code,
                'serial': card.serial_number,
                'amount': str(amount),
            })

    return Response({
        'message': 'Paiement confirmÃ©.',
        'transactions': created_transactions,
        'errors': errors
    })


# âââ CLAIMS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.select_related('user', 'transaction').order_by('-created_at')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ClaimCreateSerializer
        if self.action in ['update', 'partial_update'] and self.request.user.role == 'admin':
            return AdminClaimUpdateSerializer
        return ClaimSerializer

    def get_queryset(self):
        user = self.request.user
        qs   = super().get_queryset()
        if user.role == 'admin':
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# âââ ADMIN VIEWS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_stats(request):
    """Statistiques globales pour le dashboard admin."""
    from django.db.models import Sum, Count
    from django.utils import timezone
    from datetime import timedelta

    now   = timezone.now()
    today = now - timedelta(hours=24)

    total_revenue    = Transaction.objects.filter(status='success').aggregate(s=Sum('amount'))['s'] or 0
    revenue_24h      = Transaction.objects.filter(status='success', created_at__gte=today).aggregate(s=Sum('amount'))['s'] or 0
    recharges_24h    = Transaction.objects.filter(created_at__gte=today).count()
    total_users      = User.objects.filter(role='client').count()
    open_claims      = Claim.objects.filter(status='open').count()
    available_cards  = RechargeCard.objects.filter(is_used=False).count()

    return Response({
        'total_revenue':   float(total_revenue),
        'revenue_24h':     float(revenue_24h),
        'recharges_24h':   recharges_24h,
        'total_users':     total_users,
        'open_claims':     open_claims,
        'available_cards': available_cards,
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_users(request):
    """Liste de tous les clients (admin seulement)."""
    users = User.objects.filter(role='client').order_by('-created_at')
    return Response(UserSerializer(users, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_direct(request):
    from core.models import Operator
    items = request.data.get('cart_items', [])
    created_transactions = []
    errors = []
    for item in items:
        operator_id = item.get('operator_id')
        amount = item.get('amount')
        phone = item.get('phone', '')
        quantity = item.get('quantity', 1)
        
        # Check if Operator exists
        if not Operator.objects.filter(id=operator_id).exists():
            errors.append(f"L'operateur avec l'ID {operator_id} n'existe pas dans la base.")
            continue

        for _ in range(quantity):
            card = RechargeCard.objects.filter(operator_id=operator_id, amount=amount, is_used=False).first()
            if not card:
                import random
                pin = "".join(random.choices("0123456789", k=14))
                serial = "SN" + "".join(random.choices("0123456789", k=12))
                card = RechargeCard.objects.create(
                    operator_id=operator_id,
                    amount=amount,
                    pin_code=pin,
                    serial_number=serial,
                    is_used=False
                )
            tx = Transaction.objects.create(
                user=request.user, operator_id=operator_id, card=card, phone_number=phone,
                amount=amount, status='success', stripe_payment_intent='direct'
            )
            card.is_used = True
            card.save()
            created_transactions.append({'transaction_id': tx.id, 'pin_code': card.pin_code, 'amount': str(amount)})
    return Response({'message': 'Commande traitee', 'transactions': created_transactions, 'errors': errors})

