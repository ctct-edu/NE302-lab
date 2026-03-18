namespace Inventory.Api.Entities;

public class Transaction
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public TransactionType Type { get; set; }
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
}
