"""
Script a executer une seule fois pour creer le compte admin initial.
Usage: python manage.py shell < create_admin.py
       OU: python create_admin.py (depuis le dossier back/)
"""
import os, sys, django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flashsim.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

ADMIN_EMAIL    = 'admin@flashsim.tn'
ADMIN_PASSWORD = 'Admin@FlashSim2024!'
ADMIN_NAME     = 'Administrateur FlashSim'

if not User.objects.filter(email=ADMIN_EMAIL).exists():
    User.objects.create_superuser(
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
        name=ADMIN_NAME,
    )
    print(f"[OK] Admin cree: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
else:
    print(f"[INFO] Admin existe deja: {ADMIN_EMAIL}")
