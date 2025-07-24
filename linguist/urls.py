
from django.contrib import admin
from django.urls import path
from linguist import views

urlpatterns = [
    path('', views.index, name='home'),
    path('translate/', views.tran, name='translation'),
    path('doc/', views.doc, name='File'),

   
]
