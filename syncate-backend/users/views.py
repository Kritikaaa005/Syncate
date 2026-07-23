"""
users/views.py

Two unrelated things live here, both about an EXISTING account rather
than creating one (that's registration/views.py's job):

- VerifyEmailConfirmView: a plain server-rendered page (not a DRF API
  view) — this is what the link INSIDE the verification email actually
  points at. See services.py for why it's a web page, not a deep link.

- LoginView: email+password login for the two optional paths people can
  set up later in Settings. Only works if the account actually has a
  usable password (see registration/serializers.py for how a
  password-less account is represented) — someone who never set one has
  no way to log in on a new device except by re-verifying email, which
  isn't built as a "log in" flow at all, just email verification.
"""
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .services import consume_email_verification_token


class VerifyEmailConfirmView(View):
    """GET /verify-email/<token>/ — not part of the DRF API on purpose;
    this is a page a human taps open in a browser, not a JSON endpoint."""

    def get(self, request, token):
        result = consume_email_verification_token(token)
        return render(
            request,
            "users/verification_result.html",
            {"success": result is not None},
        )


class LoginView(APIView):
    """
    POST /api/auth/login/  { "email": "...", "password": "..." }

    Only ever works for an account that has BOTH a verified email and a
    usable password set — i.e. someone who opted into one of the two
    optional recovery methods from Settings. An account with neither
    (the default, no-friction path) simply can't use this endpoint; that
    tradeoff is disclosed to the user in-app, not hidden.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""

        if not email or not password:
            return Response(
                {"detail": "Both email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Django's authenticate() checks username by default, but we log
        # in by email — look up the username first. The error message
        # below is deliberately the same generic wording whether the
        # email or the password was wrong, so this lookup can't be used
        # to enumerate which emails have accounts on the system.
        try:
            username = User.objects.get(email__iexact=email, is_active=True).username
        except User.DoesNotExist:
            username = None

        user = authenticate(request, username=username, password=password) if username else None

        if user is None:
            return Response(
                {"detail": "Incorrect email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not getattr(user.profile, "is_email_verified", False):
            # A password can only be set from Settings after email is
            # already verified (see registration/serializers.py), so this
            # shouldn't normally trigger — cheap insurance against a
            # future bug letting an unverified account set a password.
            return Response(
                {"detail": "Please verify your email before logging in."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {"access": str(refresh.access_token), "refresh": str(refresh)},
            status=status.HTTP_200_OK,
        )
