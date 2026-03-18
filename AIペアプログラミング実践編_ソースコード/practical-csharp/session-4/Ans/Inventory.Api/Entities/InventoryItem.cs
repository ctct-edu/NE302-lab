namespace Inventory.Api.Entities;

public class InventoryItem
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 0;
    public int Threshold { get; set; } = 10;
    public DateTime UpdatedAt { get; set; }
}
