namespace Inventory.Api.Repositories;

using Inventory.Api.Entities;

public interface IProductRepository
{
    Product? FindById(int id);
    List<Product> FindAll();
    Product Save(Product product);
    List<Product> Search(string? name, ProductCategory? category);
}
