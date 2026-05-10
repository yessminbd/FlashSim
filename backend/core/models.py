from django.db import models

class Region(models.Model):
    code = models.CharField(max_length=10, unique=True, help_text="ex: tn, fr, dz")
    name = models.CharField(max_length=100, help_text="Nom complet de la région")
    dial_code = models.CharField(max_length=10, default="+216", help_text="ex: +216")

    def __str__(self):
        return f"{self.name} ({self.dial_code})"

class Operator(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='operators')
    logo_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.region.code})"

class RechargeCard(models.Model):
    operator = models.ForeignKey(Operator, on_delete=models.CASCADE)
    pin_code = models.CharField(max_length=50, unique=True)
    serial_number = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Carte {self.amount} {self.operator.name}"

class Transaction(models.Model):
    user_email = models.EmailField()
    operator = models.ForeignKey(Operator, on_delete=models.SET_NULL, null=True)
    phone_number = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='success')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TX {self.id} - {self.user_email}"

class Claim(models.Model):
    user_email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, default='open') # open, resolved
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Claim {self.id} - {self.subject}"
