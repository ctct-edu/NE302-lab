namespace Inventory.Api.Repositories;

using Inventory.Api.Data;
using Inventory.Api.Entities;

public class InventoryRepository : IInventoryRepository
{
    private readonly InventoryDbContext _context;

    public InventoryRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public InventoryItem? FindById(int productId)
    {
        return _context.InventoryItems.Find(productId);
    }

    public List<InventoryItem> FindAll()
    {
        return _context.InventoryItems.ToList();
    }

    public InventoryItem Save(InventoryItem inventory)
    {
        inventory.UpdatedAt = DateTime.Now;

        var existing = _context.InventoryItems.Find(inventory.ProductId);
        if (existing == null)
        {
            _context.InventoryItems.Add(inventory);
        }
        else
        {
            _context.Entry(existing).CurrentValues.SetValues(inventory);
        }
        _context.SaveChanges();
        return inventory;
    }
}
