from django.urls import path
from . import views

urlpatterns = [
    path('', views.lobby),
    path('room/<str:room_token>/', views.room),
    path('get_room/', views.checkRoomExists),
    path('get_token/', views.getToken),
    path('create_member/', views.createMember),
    path('get_member/', views.getMember),
    path('delete_member/', views.deleteMember),
]
