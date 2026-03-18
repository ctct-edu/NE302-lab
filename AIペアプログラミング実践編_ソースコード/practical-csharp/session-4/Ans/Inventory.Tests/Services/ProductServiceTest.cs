namespace Inventory.Tests.Services;

using Moq;
using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;
using Inventory.Api.Repositories;

public class ProductServiceTest
{
    private readonly Mock<IProductRepository> _mockRepository;
    private readonly ProductService _service;

    public ProductServiceTest()
    {
        _mockRepository = new Mock<IProductRepository>();
        _service = new ProductService(_mockRepository.Object);
    }

    [Fact]
    public void Create_Success()
    {
        var savedProduct = new Product
        {
            Id = 1,
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = 120,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        _mockRepository
            .Setup(r => r.Save(It.IsAny<Product>()))
            .Returns(savedProduct);

        var input = new ProductInput
        {
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = 120
        };

        var product = _service.Create(input);

        Assert.Equal(1, product.Id);
        Assert.Equal("ボールペン", product.Name);
        _mockRepository.Verify(r => r.Save(It.IsAny<Product>()), Times.Once());
    }

    [Fact]
    public void Create_ValidationError_ThrowsException()
    {
        var invalidInput = new ProductInput
        {
            Name = "",
            Category = ProductCategory.Stationery,
            Price = 120
        };

        Assert.Throws<ArgumentException>(() =>
        {
            _service.Create(invalidInput);
        });
        _mockRepository.Verify(r => r.Save(It.IsAny<Product>()), Times.Never());
    }
}
