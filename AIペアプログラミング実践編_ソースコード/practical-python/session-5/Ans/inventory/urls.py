"""URL configuration for inventory app."""
from django.urls import path
from inventory.views import product_views, order_views, inventory_views

urlpatterns = [
    path('products/', product_views.product_list, name='product-list'),
    path('products/<int:pk>/', product_views.product_detail, name='product-detail'),
    path('products/search/', product_views.product_search, name='product-search'),
    path('inventory/<int:product_id>/', inventory_views.inventory_detail, name='inventory-detail'),
    path('inventory/<int:product_id>/in/', inventory_views.inventory_in, name='inventory-in'),
    path('inventory/<int:product_id>/out/', inventory_views.inventory_out, name='inventory-out'),
    path('orders/', order_views.order_list, name='order-list'),
    path('orders/<int:pk>/<str:action>/', order_views.order_action, name='order-action'),
]
