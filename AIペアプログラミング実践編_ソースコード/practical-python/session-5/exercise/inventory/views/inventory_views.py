"""在庫 API ビュー"""
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from inventory.models.inventory import Inventory
from inventory.models.transaction import TransactionType


def _serialize_inventory(inventory):
    """Inventory モデルを camelCase の辞書に変換"""
    return {
        'productId': inventory.product_id,
        'quantity': inventory.quantity,
        'threshold': inventory.threshold,
        'updatedAt': inventory.updated_at,
    }


@api_view(['GET'])
def inventory_detail(request, product_id):
    """在庫情報の取得"""
    try:
        inventory = Inventory.objects.get(product_id=product_id)
        return Response({'inventory': _serialize_inventory(inventory)})
    except Inventory.DoesNotExist:
        return Response(
            {'error': f'在庫情報が見つかりません: {product_id}'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def inventory_in(request, product_id):
    """入庫処理"""
    try:
        inventory = Inventory.objects.get(product_id=product_id)
    except Inventory.DoesNotExist:
        return Response(
            {'error': f'在庫情報が見つかりません: {product_id}'},
            status=status.HTTP_404_NOT_FOUND
        )

    quantity = request.data.get('quantity')
    if quantity is None or int(quantity) <= 0:
        return Response(
            {'error': '数量は1以上で入力してください'},
            status=status.HTTP_400_BAD_REQUEST
        )

    inventory.quantity += int(quantity)
    inventory.save()
    return Response({'inventory': _serialize_inventory(inventory)})


@api_view(['POST'])
def inventory_out(request, product_id):
    """出庫処理"""
    try:
        inventory = Inventory.objects.get(product_id=product_id)
    except Inventory.DoesNotExist:
        return Response(
            {'error': f'在庫情報が見つかりません: {product_id}'},
            status=status.HTTP_404_NOT_FOUND
        )

    quantity = request.data.get('quantity')
    if quantity is None or int(quantity) <= 0:
        return Response(
            {'error': '数量は1以上で入力してください'},
            status=status.HTTP_400_BAD_REQUEST
        )

    quantity = int(quantity)
    if inventory.quantity - quantity < 0:
        return Response(
            {'error': '在庫が不足しています'},
            status=status.HTTP_400_BAD_REQUEST
        )

    inventory.quantity -= quantity
    inventory.save()
    return Response({'inventory': _serialize_inventory(inventory)})
