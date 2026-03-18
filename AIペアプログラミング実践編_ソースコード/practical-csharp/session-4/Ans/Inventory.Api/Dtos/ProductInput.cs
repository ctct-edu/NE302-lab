namespace Inventory.Api.Dtos;

using Inventory.Api.Entities;

public class ProductInput
{
    public string Name { get; set; } = string.Empty;
    public ProductCategory Category { get; set; }
    public int Price { get; set; }
}
