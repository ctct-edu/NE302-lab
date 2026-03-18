namespace Inventory.Api.Repositories;

using Inventory.Api.Entities;

public interface IOrderRepository
{
    Order? FindById(int id);
    List<Order> FindAll();
    List<Order> FindByStatus(OrderStatus status);
    Order Save(Order order);
}
