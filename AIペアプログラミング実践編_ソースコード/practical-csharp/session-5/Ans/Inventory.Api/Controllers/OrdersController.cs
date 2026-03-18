namespace Inventory.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public ActionResult<Order> Create([FromBody] OrderInput input)
    {
        var order = _orderService.Create(input);
        return Ok(order);
    }

    [HttpGet]
    public ActionResult<List<Order>> FindAll([FromQuery] OrderStatus? status)
    {
        if (status.HasValue)
        {
            return _orderService.FindByStatus(status.Value);
        }
        return _orderService.FindAll();
    }

    [HttpPost("{id}/order")]
    public ActionResult<Order> Order(int id)
    {
        try
        {
            var order = _orderService.Order(id);
            return Ok(order);
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { error = e.Message });
        }
    }

    [HttpPost("{id}/receive")]
    public ActionResult<Order> Receive(int id)
    {
        try
        {
            var order = _orderService.Receive(id);
            return Ok(order);
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { error = e.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    public ActionResult<Order> Cancel(int id)
    {
        try
        {
            var order = _orderService.Cancel(id);
            return Ok(order);
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { error = e.Message });
        }
    }
}
