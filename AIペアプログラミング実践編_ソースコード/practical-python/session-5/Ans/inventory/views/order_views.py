"""発注 API ビュー"""
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from inventory.models.order import OrderStatus
from inventory.services.order_service import OrderService
from inventory.services.dto import OrderInput
from inventory.serializers.order_serializer import OrderSerializer


order_service = OrderService()


@api_view(['GET', 'POST'])
def order_list(request):
    """発注一覧・作成"""
    if request.method == 'GET':
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = order_service.find_by_status(OrderStatus(status_filter))
        else:
            orders = order_service.find_all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        try:
            input_data = OrderInput(
                product_id=int(request.data.get('product_id', 0)),
                quantity=int(request.data.get('quantity', 0))
            )
            order = order_service.create(input_data)
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def order_action(request, pk, action):
    """発注ステータス更新"""
    try:
        if action == 'order':
            order = order_service.order(pk)
        elif action == 'receive':
            order = order_service.receive(pk)
        elif action == 'cancel':
            order = order_service.cancel(pk)
        else:
            return Response({'error': '無効なアクション'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
