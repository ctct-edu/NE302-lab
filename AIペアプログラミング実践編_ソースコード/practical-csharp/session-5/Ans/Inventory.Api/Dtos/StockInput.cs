namespace Inventory.Api.Dtos;

public class StockInput
{
    public int Quantity { get; set; }
    public string Note { get; set; } = string.Empty;
}
