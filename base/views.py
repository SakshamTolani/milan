from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import json
import base64
import os
from .models import Room, RoomMember
import time
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist


def getToken(request):
    appId = settings.APP_ID
    appCertificate = settings.APP_CERTIFICATE
    channelName = request.GET.get("channel")
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = request.GET.get("role")
    if role.lower() == "host":
        role = 1
    elif role.lower() == "audience":
        role = 2
    else:
        return JsonResponse({"error": "Invalid role"}, status=400)
    token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs
    )
    return JsonResponse({"token": token, "uid": uid}, safe=False)


def lobby(request):
    return render(request, "base/lobby.html")


def room(request, room_token):
    try:
        decoded_data = base64.b64decode(room_token).decode("utf-8")
        room_data = json.loads(decoded_data)

        UID = room_data.get("UID")
        token = room_data.get("token")
        room_name = room_data.get("room")
        name = room_data.get("name", "").strip()
        role = room_data.get("role")
        if role=="audience":
            room_obj = get_object_or_404(Room, name=room_name)

        context = {
            "UID": UID,
            "token": token,
            "room": name,
            "name": name,
            "APP_ID": settings.APP_ID,
        }
        return render(request, "base/room.html", context)
    except Exception as e:
        print(e)
        return JsonResponse({"error": "Invalid room token"}, status=400)


def checkRoomExists(request):
    room_name = request.GET.get("room_name")
    if not room_name:
        return JsonResponse({"error": "Room name is required."}, status=400)
    try:
        room = Room.objects.get(name=room_name)
        return JsonResponse({"exists": True, "room_name": room.name}, safe=False)
    except Room.DoesNotExist:
        return JsonResponse({"exists": False}, safe=False)


@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    room, _ = Room.objects.get_or_create(name=data["room_name"])
    member, created = RoomMember.objects.get_or_create(
        name=data["name"],
        uid=data["UID"],
        room=room,
    )
    return JsonResponse({"name": data["name"]}, safe=False)


def getMember(request):
    uid = request.GET.get("UID")
    room_name = request.GET.get("room_name")

    try:
        room = Room.objects.get(name=room_name)
        member = RoomMember.objects.get(uid=uid, room=room)
        name = member.name
        return JsonResponse({"name": name}, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Member not found"}, status=404)


# Delete a RoomMember
@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)

    try:
        room = Room.objects.get(name=data["room_name"])
        member = RoomMember.objects.get(name=data["name"], uid=data["UID"], room=room)
        member.delete()
        return JsonResponse("Member was deleted successfully.", safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Member or Room not found"}, status=404)
