import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flashsim.settings')
django.setup()

from core.models import Region, Operator

def seed():
    # Regions
    tn, _ = Region.objects.get_or_create(code='TN', name='Tunisie', dial_code='+216', flag='🇹🇳')
    fr, _ = Region.objects.get_or_create(code='FR', name='France', dial_code='+33', flag='🇫🇷')
    
    # Operators TN
    Operator.objects.get_or_create(name='Ooredoo', region=tn, logo_url='https://seeklogo.com/images/O/ooredoo-logo-720B9C9B4C-seeklogo.com.png')
    Operator.objects.get_or_create(name='Orange TN', region=tn, logo_url='https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg')
    Operator.objects.get_or_create(name='Tunisie Telecom', region=tn, logo_url='https://seeklogo.com/images/T/tunisie-telecom-logo-4E38676D36-seeklogo.com.png')
    
    # Operators FR
    Operator.objects.get_or_create(name='SFR', region=fr, logo_url='https://upload.wikimedia.org/wikipedia/commons/d/d9/SFR_logo.svg')
    Operator.objects.get_or_create(name='Orange FR', region=fr, logo_url='https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg')

    print("Initial data seeded.")

if __name__ == '__main__':
    seed()
