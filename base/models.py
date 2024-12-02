from django.db import models

# Create your models here.

class Room(models.Model):
    name = models.CharField(max_length=200, unique=True)  # Room name should be unique
    description = models.TextField(blank=True, null=True)  # Optional room description
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for room creation

    def __str__(self):
        return self.name
    

class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=200, unique=True)  # Unique identifier for the user
    room = models.ForeignKey(Room, related_name="members", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} in {self.room.name}"
