namespace Inventory.Api.Repositories;

using Inventory.Api.Data;
using Inventory.Api.Entities;

public class ProductRepository : IProductRepository
{
    private readonly InventoryDbContext _context;

    public ProductRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public Product? FindById(int id)
    {
        return _context.Products.Find(id);
    }

    public List<Product> FindAll()
    {
        return _context.Products.ToList();
    }

    public Product Save(Product product)
    {
        if (product.Id == 0)
        {
            _context.Products.Add(product);
        }
        else
        {
            _context.Products.Update(product);
        }
        _context.SaveChanges();
        return product;
    }

    public void Delete(int id)
    {
        var product = _context.Products.Find(id);
        if (product != null)
        {
            _context.Products.Remove(product);
            _context.SaveChanges();
        }
    }

    public List<Product> Search(string? name)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrEmpty(name))
        {
            query = query.Where(p => p.Name.Contains(name));
        }

        return query.ToList();
    }
}
