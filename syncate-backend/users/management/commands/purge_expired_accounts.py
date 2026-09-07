from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import UserProfile
from users.services import permanently_delete_user


class Command(BaseCommand):
    help = "Permanently delete accounts whose 30-day deletion grace period expired."

    def handle(self, *args, **options):
        user_ids = list(
            UserProfile.objects.filter(
                deletion_due_at__isnull=False,
                deletion_due_at__lte=timezone.now(),
            ).values_list("user_id", flat=True)
        )

        purged = 0
        for user_id in user_ids:
            profile = UserProfile.objects.select_related("user").filter(
                user_id=user_id
            ).first()
            if profile is None:
                continue
            permanently_delete_user(profile.user)
            purged += 1

        self.stdout.write(self.style.SUCCESS(f"Purged {purged} expired account(s)."))
