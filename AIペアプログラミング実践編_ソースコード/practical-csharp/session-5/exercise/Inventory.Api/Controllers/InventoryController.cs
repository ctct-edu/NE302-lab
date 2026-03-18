namespace Inventory.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryService _inventoryService;

    public InventoryController(InventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet("{productId}")]
    public IActionResult FindByProductId(int productId)
    {
        var item = _inventoryService.FindByProductId(productId);
        if (item == null)
        {
            return NotFound(new { error = "在庫情報が見つかりません" });
        }
        return Ok(new
        {
            inventory = new
            {
                productId = item.ProductId,
                quantity = item.Quantity,
                threshold = item.Threshold,
                updatedAt = item.UpdatedAt
            }
        });
    }

    [HttpPost("{productId}/in")]
    public IActionResult StockIn(int productId, [FromBody] StockInput input)
    {
        try
        {
            var item = _inventoryService.UpdateQuantity(productId, TransactionType.In, input.Quantity);
            return Ok(new
            {
                inventory = new
                {
                    productId = item.ProductId,
                    quantity = item.Quantity,
                    threshold = item.Threshold,
                    updatedAt = item.UpdatedAt
                }
            });
        }
        catch (ArgumentException e)
        {
            return BadRequest(new { error = e.Message });
        }
    }

    [HttpPost("{productId}/out")]
    public IActionResult StockOut(int productId, [FromBody] StockInput input)
    {
        try
        {
            var item = _inventoryService.UpdateQuantity(productId, TransactionType.Out, input.Quantity);
            return Ok(new
            {
                inventory = new
                {
                    productId = item.ProductId,
                    quantity = item.Quantity,
                    threshold = item.Threshold,
                    updatedAt = item.UpdatedAt
                }
            });
        }
        catch (ArgumentException e)
        {
            return BadRequest(new { error = e.Message });
        }
        catch (InvalidOperationException e)
        {
            return BadRequest(new { error = e.Message });
        }
    }
}
