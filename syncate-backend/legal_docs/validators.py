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

We're not going full semver (no build-metadata, no pre-release tags —
legal docs don't need that). We just require "one or more dot-separated
number groups", e.g. "1", "1.0", "1.2.3", "2.0.1". That covers every
real-world way someone versions a Terms & Conditions doc.
"""
from django.core.validators import RegexValidator

# Matches: 1  |  1.0  |  1.2.3  |  10.20.30   — not "banana", not "v1.0",
# not "1.0-beta". Keep it strict; loosen later only if a real need shows up.
version_format_validator = RegexValidator(
    regex=r'^\d+(\.\d+)*$',
    message=(
        'Version must be numbers separated by dots, e.g. "1.0" or "2.3.1" '
        '— no letters, no "v" prefix, no suffixes.'
    ),
    code='invalid_version_format',
)
