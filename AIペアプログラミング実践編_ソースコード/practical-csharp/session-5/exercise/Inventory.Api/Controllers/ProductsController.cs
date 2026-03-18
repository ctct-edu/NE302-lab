namespace Inventory.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;

    public ProductsController(ProductService productService)
    {
        _productService = productService;
    }

    [HttpPost]
    public IActionResult Create([FromBody] ProductInput input)
    {
        try
        {
            var product = _productService.Create(input);
            return CreatedAtAction(nameof(FindById), new { id = product.Id }, new { product });
        }
        catch (ArgumentException e)
        {
            return BadRequest(new { error = e.Message });
        }
    }

    [HttpGet]
    public IActionResult FindAll()
    {
        var products = _productService.FindAll();
        return Ok(new { products });
    }

    [HttpGet("{id}")]
    public IActionResult FindById(int id)
    {
        var product = _productService.FindById(id);
        if (product == null)
        {
            return NotFound(new { error = "商品が見つかりません" });
        }
        return Ok(new { product });
    }

    [HttpGet("search")]
    public IActionResult Search([FromQuery] string? name)
    {
        var products = _productService.Search(name);
        return Ok(new { products });
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var product = _productService.FindById(id);
        if (product == null)
        {
            return NotFound(new { error = "商品が見つかりません" });
        }
        _productService.Delete(id);
        return NoContent();
    }
}
