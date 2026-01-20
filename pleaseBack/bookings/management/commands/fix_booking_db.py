from django.core.management.base import BaseCommand
from django.db import connection
from django.core.management import call_command
import sys

class Command(BaseCommand):
    help = "Fix missing booking table by resetting migrations if needed"

    def handle(self, *args, **kwargs):
        self.stdout.write("Checking for bookings_booking table...")
        
        # Check if table exists
        with connection.cursor() as cursor:
            # Check for PostgreSQL
            if connection.vendor == 'postgresql':
                cursor.execute("SELECT to_regclass('public.bookings_booking');")
                result = cursor.fetchone()[0]
                exists = result is not None
            else:
                # Fallback for sqlite (local dev)
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings_booking';")
                exists = cursor.fetchone() is not None

        if not exists:
            self.stdout.write(self.style.WARNING("Table bookings_booking is MISSING. Fixing migrations..."))
            
            # 1. Fake-revert to zero to clear migration history for 'bookings'
            try:
                self.stdout.write("Running: migrate bookings zero --fake")
                call_command('migrate', 'bookings', 'zero', fake=True)
                self.stdout.write(self.style.SUCCESS("Successfully reset bookings migrations to zero."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error resetting migrations: {e}"))
                # Continue anyway, as we want to try to migrate forward
            
            # 2. Run migrate normally to re-apply and CREATE TABLES
            try:
                self.stdout.write("Running: migrate bookings")
                call_command('migrate', 'bookings')
                self.stdout.write(self.style.SUCCESS("Successfully re-ran bookings migrations."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error applying migrations: {e}"))
                sys.exit(1)
                
        else:
            self.stdout.write(self.style.SUCCESS("Table bookings_booking exists. No action needed."))
