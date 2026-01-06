from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = "Create initial admin user if not exists"

    def handle(self, *args, **options):
        User = get_user_model()

        email = os.getenv("ADMIN_EMAIL")
        password = os.getenv("ADMIN_PASSWORD")

        if not email or not password:
            self.stdout.write("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping.")
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write("Admin already exists. Skipping.")
            return

        User.objects.create_superuser(
            username=email,
            email=email,
            password=password,
        )

        self.stdout.write("Admin user created.")
