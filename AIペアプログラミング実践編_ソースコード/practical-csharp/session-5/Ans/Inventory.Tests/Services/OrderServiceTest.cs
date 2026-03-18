namespace Inventory.Tests.Services;

using Moq;
using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;
using Inventory.Api.Repositories;

public class OrderServiceTest
{
    private readonly Mock<IOrderRepository> _mockOrderRepository;
    private readonly Mock<IInventoryRepository> _mockInventoryRepository;
    private readonly InventoryService _inventoryService;
    private readonly OrderService _service;

    public OrderServiceTest()
    {
        _mockOrderRepository = new Mock<IOrderRepository>();
        _mockInventoryRepository = new Mock<IInventoryRepository>();
        _inventoryService = new InventoryService(_mockInventoryRepository.Object);
        _service = new OrderService(_mockOrderRepository.Object, _inventoryService);
    }

    [Fact]
    public void Create_CreatesOrder()
    {
        var input = new OrderInput { ProductId = 1, Quantity = 10 };
        var savedOrder = new Order
        {
            Id = 1,
            ProductId = 1,
            Quantity = 10,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.Now
        };

        _mockOrderRepository
            .Setup(r => r.Save(It.IsAny<Order>()))
            .Returns(savedOrder);

        var order = _service.Create(input);

        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.Equal(1, order.ProductId);
        Assert.Equal(10, order.Quantity);
    }

    [Fact]
    public void Order_UpdatesStatusToOrdered()
    {
        var order = new Order
        {
            Id = 1,
            ProductId = 1,
            Quantity = 10,
            Status = OrderStatus.Pending
        };

        _mockOrderRepository.Setup(r => r.FindById(1)).Returns(order);
        _mockOrderRepository.Setup(r => r.Save(It.IsAny<Order>())).Returns<Order>(o => o);

        var result = _service.Order(1);

        Assert.Equal(OrderStatus.Ordered, result.Status);
        Assert.NotNull(result.OrderedAt);
    }

    [Fact]
    public void Receive_ThrowsException_WhenStatusIsNotOrdered()
    {
        var order = new Order
        {
            Id = 1,
            Status = OrderStatus.Pending
        };

        _mockOrderRepository.Setup(r => r.FindById(1)).Returns(order);

        var exception = Assert.Throws<InvalidOperationException>(() => _service.Receive(1));
        Assert.Equal("発注済みの発注のみ入荷処理できます", exception.Message);
    }

    [Fact]
    public void Cancel_ThrowsException_WhenAlreadyReceived()
    {
        var order = new Order
        {
            Id = 1,
            Status = OrderStatus.Received
        };

        _mockOrderRepository.Setup(r => r.FindById(1)).Returns(order);

        var exception = Assert.Throws<InvalidOperationException>(() => _service.Cancel(1));
        Assert.Equal("入荷済みの発注はキャンセルできません", exception.Message);
    }
}
