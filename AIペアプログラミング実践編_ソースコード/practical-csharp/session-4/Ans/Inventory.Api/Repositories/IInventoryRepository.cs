namespace Inventory.Api.Repositories;

using Inventory.Api.Entities;

public interface IInventoryRepository
{
    InventoryItem? FindById(int productId);
    List<InventoryItem> FindAll();
    InventoryItem Save(InventoryItem inventory);
}
