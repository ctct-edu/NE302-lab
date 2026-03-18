# Session 5: 機能拡張と総合演習

## 前提

- Session 4 で商品登録・検索機能が完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                                                 |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| チャット       | 既存コードの理解、影響範囲の分析       | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L`                              |
| インライン補完 | テスト・実装コードの入力               | Tab で受け入れ、Esc で拒否                                                           |

チャットでのコンテキスト参照：

| 記法           | 説明                                       | ツール         |
| -------------- | ------------------------------------------ | -------------- |
| `@workspace`   | プロジェクト全体を参照                     | GitHub Copilot |
| `@ファイル名`  | 特定のファイルを参照                       | 両方           |

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 4 までの完成物が含まれています：

| ファイル/フォルダ                           | 内容                                   |
| ------------------------------------------- | -------------------------------------- |
| `docs/*.md`                                 | 要件定義書・設計書                     |
| `Inventory.Api/Entities/*.cs`               | エンティティ（Product など）           |
| `Inventory.Api/Services/*.cs`               | Service 層（実装済み）                 |
| `Inventory.Api/Repositories/*.cs`           | Repository 層（実装済み）              |
| `Inventory.Api/Controllers/*.cs`            | REST Controller（実装済み）            |
| `Inventory.Api/Program.cs`                  | アプリケーションエントリポイント       |
| `Inventory.Tests/Services/*Test.cs`         | テストファイル                         |
| `Inventory.sln`                             | ソリューションファイル                 |

---

## 演習 1: 在庫アラート機能の追加（10 分）

この演習では、既存のコードに新機能を追加します。

### ステップ 1: AI に既存コードを理解させる

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**GitHub Copilot の場合：**

```
@workspace 現在のプロジェクト構成を説明してください。
特に、商品と在庫の関係、データの流れを教えてください。
```

**Cursor の場合：**

```
@ProductService.cs @InventoryService.cs
この 2 つの Service の関係を説明してください。
在庫アラート機能を追加する場合、どちらに実装すべきですか？
```

- **@workspace**: プロジェクト全体を参照する（GitHub Copilot）
- **@ファイル名**: 特定のファイルを参照する

### ステップ 2: TDD で実装する

使用する AI 機能: **インライン補完**

TDD の Red-Green-Refactor サイクルで実装を進めます。

**テストを書く（Red）**

```csharp
// Inventory.Tests/Services/InventoryServiceTest.cs に追加
public class InventoryServiceTest
{
    private readonly Mock<IInventoryRepository> _mockRepository;
    private readonly InventoryService _service;

    public InventoryServiceTest()
    {
        _mockRepository = new Mock<IInventoryRepository>();
        _service = new InventoryService(_mockRepository.Object);
    }

    [Fact]
    public void GetAlertProducts_ReturnsProductsBelowThreshold()
    {
        // Arrange
        var inventories = new List<InventoryItem>
        {
            CreateInventory(1, 5, 10),   // アラート対象（5 <= 10）
            CreateInventory(2, 15, 10),  // 対象外（15 > 10）
            CreateInventory(3, 10, 10)   // 境界値（10 <= 10）アラート対象
        };
        _mockRepository.Setup(r => r.FindAll()).Returns(inventories);

        // Act
        var alerts = _service.GetAlertProducts();

        // Assert
        Assert.Equal(2, alerts.Count);
        Assert.Contains(alerts, i => i.ProductId == 1);
        Assert.Contains(alerts, i => i.ProductId == 3);
    }

    [Fact]
    public void GetAlertProducts_ReturnsEmptyList_WhenNoAlerts()
    {
        // Arrange
        var inventories = new List<InventoryItem>
        {
            CreateInventory(1, 20, 10)  // 対象外（20 > 10）
        };
        _mockRepository.Setup(r => r.FindAll()).Returns(inventories);

        // Act
        var alerts = _service.GetAlertProducts();

        // Assert
        Assert.Empty(alerts);
    }

    private static InventoryItem CreateInventory(int productId, int quantity, int threshold)
    {
        return new InventoryItem
        {
            ProductId = productId,
            Quantity = quantity,
            Threshold = threshold
        };
    }
}
```

- 境界値（threshold と同じ値）もテストに含める
- 空リストのケースもテストする

**実装する（Green）**

```csharp
// Inventory.Api/Services/InventoryService.cs に追加
public List<InventoryItem> GetAlertProducts()
{
    return _repository.FindAll()
        .Where(inv => inv.Quantity <= inv.Threshold)
        .ToList();
}
```

**リファクタリングする（Refactor）**

必要に応じてコードを整理します。

---

## 演習 2: 発注管理機能の実装（30 分）

これまで学んだことを活かして、発注管理機能を実装します。

> **注意**: Order エンティティは Session 2 で既に定義済みです。

### ステップ 1: 要件を確認する

発注管理機能の要件：

| 機能 | 説明 |
| ---- | ---- |
| 発注作成 | 商品と数量を指定して発注を作成 |
| 発注一覧 | 発注の一覧を表示（ステータス別） |
| ステータス更新 | Pending → Ordered → Received の順で遷移 |
| 発注キャンセル | 発注をキャンセル |

ステータスの遷移：

```
Pending（発注中）
    ├─→ Ordered（発注済み）→ Received（入荷済み）→ 在庫を増やす
    └─→ Cancelled（キャンセル）
```

### ステップ 2: テストを書く

使用する AI 機能: **インライン補完**

TDD で実装を進めます。まずテストを書きます。

```csharp
// Inventory.Tests/Services/OrderServiceTest.cs
namespace Inventory.Tests.Services;

using Moq;
using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;
using Inventory.Api.Repositories;

public class OrderServiceTest
{
    private readonly Mock<IOrderRepository> _mockOrderRepository;
    private readonly Mock<InventoryService> _mockInventoryService;
    private readonly OrderService _service;

    public OrderServiceTest()
    {
        _mockOrderRepository = new Mock<IOrderRepository>();
        _mockInventoryService = new Mock<InventoryService>();
        _service = new OrderService(_mockOrderRepository.Object, _mockInventoryService.Object);
    }

    [Fact]
    public void Create_CreatesOrder()
    {
        // Arrange
        var input = new OrderInput { ProductId = 1, Quantity = 10 };
        var savedOrder = new Order
        {
            Id = 1,
            ProductId = 1,
            Quantity = 10,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.Now
        };

        _mockOrderRepository
            .Setup(r => r.Save(It.IsAny<Order>()))
            .Returns(savedOrder);

        // Act
        var order = _service.Create(input);

        // Assert
        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.Equal(1, order.ProductId);
        Assert.Equal(10, order.Quantity);
    }

    [Fact]
    public void Receive_UpdatesInventory()
    {
        // Arrange
        var order = new Order
        {
            Id = 1,
            ProductId = 1,
            Quantity = 10,
            Status = OrderStatus.Ordered
        };

        _mockOrderRepository
            .Setup(r => r.FindById(1))
            .Returns(order);
        _mockOrderRepository
            .Setup(r => r.Save(It.IsAny<Order>()))
            .Returns<Order>(o => o);

        // Act
        var result = _service.Receive(1);

        // Assert
        Assert.Equal(OrderStatus.Received, result.Status);
        Assert.NotNull(result.ReceivedAt);
        _mockInventoryService.Verify(s => s.UpdateQuantity(1, TransactionType.In, 10), Times.Once());
    }

    [Fact]
    public void Receive_ThrowsException_WhenStatusIsNotOrdered()
    {
        // Arrange
        var order = new Order
        {
            Id = 1,
            Status = OrderStatus.Pending
        };

        _mockOrderRepository
            .Setup(r => r.FindById(1))
            .Returns(order);

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() => _service.Receive(1));
        Assert.Equal("発注済みの発注のみ入荷処理できます", exception.Message);
    }
}
```

### ステップ 3: Service を実装する

使用する AI 機能: **インライン補完**

テストが通るように実装を進めます。

```csharp
// Inventory.Api/Services/OrderService.cs
namespace Inventory.Api.Services;

using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Repositories;

public class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly InventoryService _inventoryService;

    public OrderService(IOrderRepository orderRepository, InventoryService inventoryService)
    {
        _orderRepository = orderRepository;
        _inventoryService = inventoryService;
    }

    public Order Create(OrderInput input)
    {
        var order = new Order
        {
            ProductId = input.ProductId,
            Quantity = input.Quantity,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.Now
        };
        return _orderRepository.Save(order);
    }

    public Order Order(int orderId)
    {
        var order = _orderRepository.FindById(orderId)
            ?? throw new ArgumentException("発注が見つかりません");

        if (order.Status != OrderStatus.Pending)
        {
            throw new InvalidOperationException("発注中の発注のみ発注済みにできます");
        }

        order.Status = OrderStatus.Ordered;
        order.OrderedAt = DateTime.Now;
        return _orderRepository.Save(order);
    }

    public Order Receive(int orderId)
    {
        var order = _orderRepository.FindById(orderId)
            ?? throw new ArgumentException("発注が見つかりません");

        if (order.Status != OrderStatus.Ordered)
        {
            throw new InvalidOperationException("発注済みの発注のみ入荷処理できます");
        }

        // 在庫を更新
        _inventoryService.UpdateQuantity(order.ProductId, TransactionType.In, order.Quantity);

        order.Status = OrderStatus.Received;
        order.ReceivedAt = DateTime.Now;
        return _orderRepository.Save(order);
    }

    public Order Cancel(int orderId)
    {
        var order = _orderRepository.FindById(orderId)
            ?? throw new ArgumentException("発注が見つかりません");

        if (order.Status == OrderStatus.Received)
        {
            throw new InvalidOperationException("入荷済みの発注はキャンセルできません");
        }

        order.Status = OrderStatus.Cancelled;
        return _orderRepository.Save(order);
    }

    public List<Order> FindAll()
    {
        return _orderRepository.FindAll();
    }

    public List<Order> FindByStatus(OrderStatus status)
    {
        return _orderRepository.FindByStatus(status);
    }
}
```

### ステップ 4: API を実装する

使用する AI 機能: **Chat** または **インライン補完**

Controller を追加して API を完成させます。

```csharp
// Inventory.Api/Controllers/OrdersController.cs
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
```

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。

---

## チャレンジ: 時間に余裕がある場合（20 分）

以下の機能など、あったら便利そうな機能を考えて実装してみましょう。

- **在庫レポート**: 全商品の在庫状況をまとめて表示
- **発注の自動提案**: アラート対象の商品に対して発注を自動提案
- **履歴のエクスポート**: 入出庫履歴を CSV で出力
- **商品の編集・削除**: CRUD の残り機能
