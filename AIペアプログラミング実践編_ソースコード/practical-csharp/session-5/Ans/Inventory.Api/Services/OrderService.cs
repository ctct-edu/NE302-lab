namespace Inventory.Api.Services;

using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Repositories;

public class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly InventoryService _inventoryService;

    public OrderService(IOrderRepository orderRepository, InventoryService inventoryService)
    {
        _orderRepository = orderRepository;
        _inventoryService = inventoryService;
    }

    public Order Create(OrderInput input)
    {
        var order = new Order
        {
            ProductId = input.ProductId,
            Quantity = input.Quantity,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.Now
        };
        return _orderRepository.Save(order);
    }

    public Order Order(int orderId)
    {
        var order = _orderRepository.FindById(orderId)
            ?? throw new ArgumentException("発注が見つかりません");

        if (order.Status != OrderStatus.Pending)
        {
            throw new InvalidOperationException("発注中の発注のみ発注済みにできます");
        }

        order.Status = OrderStatus.Ordered;
        order.OrderedAt = DateTime.Now;
        return _orderRepository.Save(order);
    }

    public Order Receive(int orderId)
    {
        var order = _orderRepository.FindById(orderId)
            ?? throw new ArgumentException("発注が見つかりません");

        if (order.Status != OrderStatus.Ordered)
        {
            throw new InvalidOperationException("発注済みの発注のみ入荷処理できます");
        }

        // 在庫を更新
        _inventoryService.UpdateQuantity(order.ProductId, TransactionType.In, order.Quantity);

        order.Status = OrderStatus.Received;
        order.ReceivedAt = DateTime.Now;
        return _orderRepository.Save(order);
    }

    public Order Cancel(int orderId)
    {
        var order = _orderRepository.FindById(orderId)
            ?? throw new ArgumentException("発注が見つかりません");

        if (order.Status == OrderStatus.Received)
        {
            throw new InvalidOperationException("入荷済みの発注はキャンセルできません");
        }

        order.Status = OrderStatus.Cancelled;
        return _orderRepository.Save(order);
    }

    public List<Order> FindAll()
    {
        return _orderRepository.FindAll();
    }

    public List<Order> FindByStatus(OrderStatus status)
    {
        return _orderRepository.FindByStatus(status);
    }
}
