from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Registers the pre_delete signal receiver in signals.py — the
        # "never delete the last superuser" safety net (issue #4 fix).
        # Import here, not at module top-level, so this only runs once
        # Django's app registry is ready (standard Django signal pattern).
        import accounts.signals  # noqa: F401
