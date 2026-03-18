"""URL configuration for inventory project."""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/static/index.html', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
]
