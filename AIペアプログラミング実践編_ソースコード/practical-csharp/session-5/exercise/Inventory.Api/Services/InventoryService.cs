namespace Inventory.Api.Services;

using Inventory.Api.Entities;
using Inventory.Api.Repositories;

public class InventoryService
{
    private readonly IInventoryRepository _repository;

    public InventoryService(IInventoryRepository repository)
    {
        _repository = repository;
    }

    public InventoryItem? FindByProductId(int productId)
    {
        return _repository.FindById(productId);
    }

    public InventoryItem UpdateQuantity(int productId, TransactionType type, int quantity)
    {
        var inventory = _repository.FindById(productId);
        if (inventory == null)
        {
            throw new ArgumentException($"在庫情報が見つかりません: {productId}");
        }

        if (quantity <= 0)
        {
            throw new ArgumentException("数量は1以上で入力してください");
        }

        if (type == TransactionType.In)
        {
            inventory.Quantity += quantity;
        }
        else
        {
            var newQuantity = inventory.Quantity - quantity;
            if (newQuantity < 0)
            {
                throw new InvalidOperationException("在庫が不足しています");
            }
            inventory.Quantity = newQuantity;
        }

        return _repository.Save(inventory);
    }

    public List<InventoryItem> GetAlertProducts()
    {
        var inventories = _repository.FindAll();
        return inventories.Where(i => i.Quantity <= i.Threshold).ToList();
    }
}
