namespace Inventory.Tests.Services;

using Moq;
using Inventory.Api.Entities;
using Inventory.Api.Services;
using Inventory.Api.Repositories;

public class InventoryServiceTest
{
    private readonly Mock<IInventoryRepository> _mockRepository;
    private readonly InventoryService _service;

    public InventoryServiceTest()
    {
        _mockRepository = new Mock<IInventoryRepository>();
        _service = new InventoryService(_mockRepository.Object);
    }

    [Fact]
    public void UpdateQuantity_In_IncreasesQuantity()
    {
        var inventory = new InventoryItem
        {
            ProductId = 1,
            Quantity = 10,
            Threshold = 5
        };

        _mockRepository
            .Setup(r => r.FindById(1))
            .Returns(inventory);
        _mockRepository
            .Setup(r => r.Save(It.IsAny<InventoryItem>()))
            .Returns<InventoryItem>(i => i);

        var result = _service.UpdateQuantity(1, TransactionType.In, 5);

        Assert.Equal(15, result.Quantity);
    }

    [Fact]
    public void UpdateQuantity_Out_DecreasesQuantity()
    {
        var inventory = new InventoryItem
        {
            ProductId = 1,
            Quantity = 10,
            Threshold = 5
        };

        _mockRepository
            .Setup(r => r.FindById(1))
            .Returns(inventory);
        _mockRepository
            .Setup(r => r.Save(It.IsAny<InventoryItem>()))
            .Returns<InventoryItem>(i => i);

        var result = _service.UpdateQuantity(1, TransactionType.Out, 5);

        Assert.Equal(5, result.Quantity);
    }

    [Fact]
    public void UpdateQuantity_Out_InsufficientStock_ThrowsException()
    {
        var inventory = new InventoryItem
        {
            ProductId = 1,
            Quantity = 5,
            Threshold = 5
        };

        _mockRepository
            .Setup(r => r.FindById(1))
            .Returns(inventory);

        var exception = Assert.Throws<InvalidOperationException>(() =>
        {
            _service.UpdateQuantity(1, TransactionType.Out, 6);
        });
        Assert.Equal("在庫が不足しています", exception.Message);
    }
}
