namespace Inventory.Tests.Services;

using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;

public class ProductValidatorTest
{
    private readonly ProductValidator _validator;

    public ProductValidatorTest()
    {
        _validator = new ProductValidator();
    }

    [Fact]
    public void ValidInput_ReturnsSuccess()
    {
        var input = new ProductInput
        {
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = 120
        };

        var result = _validator.Validate(input);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void EmptyName_ReturnsError()
    {
        var input = new ProductInput
        {
            Name = "",
            Category = ProductCategory.Stationery,
            Price = 120
        };

        var result = _validator.Validate(input);

        Assert.False(result.IsValid);
        Assert.Contains("商品名は必須です", result.Errors);
    }

    [Fact]
    public void NameTooLong_ReturnsError()
    {
        var input = new ProductInput
        {
            Name = new string('a', 101),
            Category = ProductCategory.Stationery,
            Price = 120
        };

        var result = _validator.Validate(input);

        Assert.False(result.IsValid);
        Assert.Contains("商品名は100文字以内で入力してください", result.Errors);
    }

    [Fact]
    public void NegativePrice_ReturnsError()
    {
        var input = new ProductInput
        {
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = -100
        };

        var result = _validator.Validate(input);

        Assert.False(result.IsValid);
        Assert.Contains("価格は0以上で入力してください", result.Errors);
    }
}
