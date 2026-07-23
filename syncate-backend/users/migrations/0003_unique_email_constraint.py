"""
users/migrations/0003_unique_email_constraint.py

WHY THIS IS RAW SQL INSTEAD OF A NORMAL DJANGO FIELD CONSTRAINT:
------------------------------------------------------------------------
`auth.User` is Django's own built-in model, not one we own — there's no
models.py in this app (or anywhere in this project) where we could add a
Meta.constraints entry for it. Django's migration framework tracks
model-state per app, so "reach into another app's model and add a
constraint" isn't something a normal migrations.AddConstraint operation
supports across app boundaries. RunSQL sidesteps that entirely by just
talking straight to the database, which doesn't care which Django app
"owns" a table.

WHY THIS CONSTRAINT NEEDS TO EXIST AT ALL:
------------------------------------------------------------------------
RegistrationSerializer.validate_email() (registration/serializers.py)
already checks "does this email exist?" before creating an account — but
that's a check-then-act, same category of race condition documented at
length on LegalDocument (legal_docs/models.py): two registration requests
for the same email, arriving close enough together, could both pass that
Python-level check before either one finishes creating its User row. This
index is what makes that actually impossible, not just unlikely — same
belt-and-braces pattern as the LegalDocument "one active version"
guarantee.

WHY PARTIAL (`WHERE email != ''`) AND CASE-INSENSITIVE (`LOWER(email)`):
------------------------------------------------------------------------
- Partial: email is OPTIONAL. Django's User.email defaults to '' (not
  NULL) when unset, and MANY accounts will legitimately have no email at
  all — a plain unique index on `email` would only allow ONE passwordless
  account with a blank email to ever exist, which is exactly the opposite
  of what we want.
- Case-insensitive: "Person@Example.com" and "person@example.com" are the
  same mailbox as far as any email provider is concerned; without
  LOWER(), someone could register the same address twice just by
  changing its capitalization.
"""
from django.db import migrations


CREATE_UNIQUE_EMAIL_INDEX = """
    CREATE UNIQUE INDEX unique_registered_user_email
    ON auth_user (LOWER(email))
    WHERE email != '';
"""

DROP_UNIQUE_EMAIL_INDEX = """
    DROP INDEX IF EXISTS unique_registered_user_email;
"""


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_date_of_birth_and_email_verification"),
    ]

    operations = [
        migrations.RunSQL(
            sql=CREATE_UNIQUE_EMAIL_INDEX,
            reverse_sql=DROP_UNIQUE_EMAIL_INDEX,
        ),
    ]
