namespace Inventory.Api.Services;

using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Repositories;

public class ProductService
{
    private readonly IProductRepository _repository;
    private readonly ProductValidator _validator;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
        _validator = new ProductValidator();
    }

    public Product Create(ProductInput input)
    {
        var result = _validator.Validate(input);
        if (!result.IsValid)
        {
            throw new ArgumentException(string.Join(", ", result.Errors));
        }

        var product = new Product
        {
            Name = input.Name,
            Category = input.Category,
            Price = input.Price,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        return _repository.Save(product);
    }

    public List<Product> FindAll()
    {
        return _repository.FindAll();
    }

    public Product? FindById(int id)
    {
        return _repository.FindById(id);
    }

    public List<Product> Search(string? name, ProductCategory? category)
    {
        return _repository.Search(name, category);
    }
}
