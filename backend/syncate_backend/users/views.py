from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializers import NicknameSerializer


class UpdateNicknameView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
        )

        serializer = NicknameSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "profile_id": serializer.instance.profile_id,
                "nickname": serializer.instance.nickname,
                "message": f"Welcome, {serializer.instance.nickname}!",
            },
            status=status.HTTP_200_OK,
        )