"""
registration/views.py
"""
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegistrationSerializer


class RegisterView(APIView):
    """
    POST /api/auth/register/

    Body: { "date_of_birth": "2005-04-12", "email": "...", "password": "..." }
    (email and password both optional — see serializers.py module docstring)

    Unauthenticated by nature (nobody has an account yet), so it's
    explicitly AllowAny AND explicitly throttled (throttle_scope="register",
    rate configured in config/settings.py DEFAULT_THROTTLE_RATES) — an
    endpoint that's open to anyone AND creates real accounts/issues real
    tokens needs its own abuse limit independent of general API traffic.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issued immediately — no password/email verification required to
        # start using the app (see serializers.py for the full reasoning).
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "is_email_verified": user.profile.is_email_verified,
                    "email_verification_sent": bool(user.email),
                },
            },
            status=status.HTTP_201_CREATED,
        )
