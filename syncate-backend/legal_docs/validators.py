"""
legal_docs/validators.py

Small, boring, single-purpose file: just the version-string validator.

Why this is its own file (SRP):
-------------------------------
`models.py` should only describe *what a LegalDocument is*. The exact
regex we use to decide "is this a real version string" is a separate
concern — it can change independently of the model shape — so it lives
here instead of being buried inline in a field definition.

The bug we're fixing (issue #8 from the review):
--------------------------------------------------
Before, `version` was a plain CharField with no validation, so someone
could genuinely type "banana" as a version and Django would happily save
it. That breaks anything downstream that expects to sort/compare versions
(and looks unprofessional in an audit trail).

Locked to "major.minor" ONLY — "1.0", "1.1", "2.0". No patch numbers
("1.0.1"), no "v" prefix, no free text. This is a product decision, not
an arbitrary technical one: legal doc versions bump per publish, and two
numbers is all that's ever needed for that.
"""
from django.core.validators import RegexValidator

# Matches: 1.0  |  1.1  |  2.0  |  10.20  — exactly two dot-separated
# number groups. Not "1", not "1.2.3", not "banana", not "v1.0".
version_format_validator = RegexValidator(
    regex=r'^\d+\.\d+$',
    message=(
        'Version must be major.minor only, e.g. "1.0" or "2.3" '
        '— no patch numbers, no "v" prefix, no suffixes.'
    ),
    code='invalid_version_format',
)
