from django.contrib import admin

from .models import RoomMember, Room

# Register your models here.

admin.site.register(RoomMember)
admin.site.register(Room)