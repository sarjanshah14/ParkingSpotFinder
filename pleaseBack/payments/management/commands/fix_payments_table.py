from django.core.management.base import BaseCommand
from django.db import connection
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Fixes missing payments table by re-running migration if needed'

    def handle(self, *args, **options):
        table_name = 'payments_payment'
        
        with connection.cursor() as cursor:
            # Check if table exists
            cursor.execute("""
                SELECT exists(
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, [table_name])
            exists = cursor.fetchone()[0]

            if exists:
                self.stdout.write(self.style.SUCCESS(f'Table {table_name} already exists.'))
            else:
                self.stdout.write(self.style.WARNING(f'Table {table_name} missing! Attempting to fix...'))
                
                # Check if django thinks it applied the migration
                cursor.execute("SELECT app, name FROM django_migrations WHERE app='payments' AND name='0001_initial';")
                migration_record = cursor.fetchone()
                
                if migration_record:
                    self.stdout.write(self.style.WARNING('Migration 0001 marked applied but table missing. Faking zero.'))
                    call_command('migrate', 'payments', 'zero', fake=True)
                
                self.stdout.write(self.style.SUCCESS('Running migrate payments...'))
                call_command('migrate', 'payments')
