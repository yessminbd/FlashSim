from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [('admin', 'Admin'), ('client', 'Client')]
    email      = models.EmailField(unique=True)
    name       = models.CharField(max_length=150)
    phone      = models.CharField(max_length=20, blank=True, null=True)
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


class Region(models.Model):
    code      = models.CharField(max_length=10, unique=True)
    name      = models.CharField(max_length=100)
    dial_code = models.CharField(max_length=10, default="+216")
    flag      = models.CharField(max_length=10, default="🌍")

    def __str__(self):
        return f"{self.name} ({self.dial_code})"


class Operator(models.Model):
    name     = models.CharField(max_length=100)
    region   = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='operators')
    logo_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.region.code})"


class RechargeCard(models.Model):
    operator      = models.ForeignKey(Operator, on_delete=models.CASCADE)
    pin_code      = models.CharField(max_length=50, unique=True)
    serial_number = models.CharField(max_length=100, unique=True)
    amount        = models.DecimalField(max_digits=10, decimal_places=2)
    is_used       = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Carte {self.amount} {self.operator.name}"


class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('success', 'Succes'),
        ('failed', 'Echoue'),
        ('refunded', 'Rembourse'),
    ]
    user          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='transactions')
    operator      = models.ForeignKey(Operator, on_delete=models.SET_NULL, null=True)
    card          = models.ForeignKey(RechargeCard, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number  = models.CharField(max_length=20)
    amount        = models.DecimalField(max_digits=10, decimal_places=2)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    stripe_payment_intent = models.CharField(max_length=200, blank=True, null=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TX-{self.id} | {self.amount} DT | {self.status}"


class Claim(models.Model):
    STATUS_CHOICES = [
        ('open', 'Ouvert'),
        ('in_progress', 'En cours'),
        ('resolved', 'Resolu'),
        ('closed', 'Ferme'),
    ]
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)
    subject     = models.CharField(max_length=200)
    message     = models.TextField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    admin_reply = models.TextField(blank=True, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reclamation #{self.id} - {self.subject} ({self.status})"
