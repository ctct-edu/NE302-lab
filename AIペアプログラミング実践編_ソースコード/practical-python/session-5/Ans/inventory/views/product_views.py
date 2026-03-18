"""商品 API ビュー"""
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from inventory.models.product import Product, ProductCategory
from inventory.services.product_service import ProductService
from inventory.services.dto import ProductInput
from inventory.serializers.product_serializer import ProductSerializer


# Service のインスタンス
product_service = ProductService()


@api_view(['GET', 'POST'])
def product_list(request):
    """商品一覧・登録"""
    if request.method == 'GET':
        products = product_service.find_all()
        serializer = ProductSerializer(products, many=True)
        return Response({'products': serializer.data})

    elif request.method == 'POST':
        try:
            # カテゴリの変換
            category_str = request.data.get('category')
            category = None
            if category_str:
                try:
                    category = ProductCategory(category_str)
                except ValueError:
                    pass

            input_data = ProductInput(
                name=request.data.get('name', ''),
                category=category,
                price=int(request.data.get('price', 0))
            )
            product = product_service.create(input_data)
            serializer = ProductSerializer(product)
            return Response({'product': serializer.data}, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
def product_detail(request, pk):
    """商品詳細・削除"""
    if request.method == 'DELETE':
        try:
            product = product_service.find_by_id(pk)
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

    try:
        product = product_service.find_by_id(pk)
        serializer = ProductSerializer(product)
        return Response({'product': serializer.data})
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def product_search(request):
    """商品検索"""
    name = request.query_params.get('name')
    category = request.query_params.get('category')
    min_price = request.query_params.get('min_price')
    max_price = request.query_params.get('max_price')

    # 型変換
    min_price = int(min_price) if min_price else None
    max_price = int(max_price) if max_price else None

    products = product_service.search(
        name=name,
        category=category,
        min_price=min_price,
        max_price=max_price
    )
    serializer = ProductSerializer(products, many=True)
    return Response({'products': serializer.data})
