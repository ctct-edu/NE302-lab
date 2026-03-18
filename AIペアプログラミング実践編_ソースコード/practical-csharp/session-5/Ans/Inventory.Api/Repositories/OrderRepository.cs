namespace Inventory.Api.Repositories;

using Inventory.Api.Data;
using Inventory.Api.Entities;

public class OrderRepository : IOrderRepository
{
    private readonly InventoryDbContext _context;

    public OrderRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public Order? FindById(int id)
    {
        return _context.Orders.Find(id);
    }

    public List<Order> FindAll()
    {
        return _context.Orders.ToList();
    }

    public List<Order> FindByStatus(OrderStatus status)
    {
        return _context.Orders.Where(o => o.Status == status).ToList();
    }

    public Order Save(Order order)
    {
        if (order.Id == 0)
        {
            _context.Orders.Add(order);
        }
        else
        {
            _context.Orders.Update(order);
        }
        _context.SaveChanges();
        return order;
    }
}
