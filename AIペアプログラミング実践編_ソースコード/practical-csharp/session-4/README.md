# Session 4: 機能実装とリファクタリング

## 前提

- Session 3 でテストコードが完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                    |
| -------------- | -------------------------------------- | ------------------------------------------------------- |
| チャット       | 実装方針の相談、コードレビュー         | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L` |
| インライン補完 | 実装コードの入力                       | Tab で受け入れ、Esc で拒否                              |

> **Chat で生成されたコードの扱い方**：Chat が提案するコードはそのままコピーするのではなく、内容を理解した上で自分のコードに取り込みましょう。必要に応じて修正を加えることも重要です。

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 3 までの完成物が含まれています：

| ファイル/フォルダ                      | 内容                                |
| -------------------------------------- | ----------------------------------- |
| `docs/*.md`                            | 要件定義書・設計書                  |
| `Inventory.Api/Entities/*.cs`          | エンティティ                        |
| `Inventory.Api/Services/*.cs`          | Service 層（Session 3 作成）        |
| `Inventory.Tests/Services/*Test.cs`    | テストファイル（Session 3 で作成）  |
| `Inventory.sln`                        | ソリューションファイル              |

---

## 演習 1: Repository 層の実装（20 分）

この演習では、データの永続化を担う Repository 層を実装します。

### ステップ 1: Repository 層を確認する

使用する AI 機能: **Chat**

Entity Framework Core を使用しているため、Repository はインターフェースを実装します。

```csharp
// Inventory.Api/Repositories/ProductRepository.cs
namespace Inventory.Api.Repositories;

using Inventory.Api.Data;
using Inventory.Api.Entities;
using Microsoft.EntityFrameworkCore;

public class ProductRepository : IProductRepository
{
    private readonly InventoryDbContext _context;

    public ProductRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public Product? FindById(int id)
    {
        return _context.Products.Find(id);
    }

    public List<Product> FindAll()
    {
        return _context.Products.ToList();
    }

    public Product Save(Product product)
    {
        if (product.Id == 0)
        {
            _context.Products.Add(product);
        }
        else
        {
            _context.Products.Update(product);
        }
        _context.SaveChanges();
        return product;
    }

    public List<Product> Search(string? name, ProductCategory? category)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrEmpty(name))
        {
            query = query.Where(p => p.Name.Contains(name));
        }
        if (category.HasValue)
        {
            query = query.Where(p => p.Category == category.Value);
        }

        return query.ToList();
    }
}
```

- **DbContext**: Entity Framework Core のデータベースコンテキスト
- **AsQueryable()**: LINQ クエリを構築

---

## 演習 2: Service 層の実装（30 分）

この演習では、ビジネスロジックを含む Service 層を実装し、検索機能も追加します。

### ステップ 1: Service 層を実装する

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品登録機能を実装してください。

【仕様】
・ProductInput を受け取る
・バリデーションを行う
・Repository を通じて DB に保存
・保存した Product を返す

【既存のテスト】
@ProductServiceTest.cs

このテストが通るように実装してください。
```

期待される実装：

```csharp
// Inventory.Api/Services/ProductService.cs
namespace Inventory.Api.Services;

using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Repositories;

public class ProductService
{
    private readonly IProductRepository _repository;
    private readonly ProductValidator _validator;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
        _validator = new ProductValidator();
    }

    public Product Create(ProductInput input)
    {
        var result = _validator.Validate(input);
        if (!result.IsValid)
        {
            throw new ArgumentException(string.Join(", ", result.Errors));
        }

        var product = new Product
        {
            Name = input.Name,
            Category = input.Category,
            Price = input.Price,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        return _repository.Save(product);
    }

    public Product? FindById(int id)
    {
        return _repository.FindById(id);
    }

    public List<Product> FindAll()
    {
        return _repository.FindAll();
    }
}
```

- **依存性注入（DI）**: コンストラクタ経由で依存を注入
- テスト時は `Mock<T>` でモックを注入し、本番時は実際の Repository が注入される

### ステップ 2: テストを実行する（Green）

```sh
dotnet test
```

すべてのテストが通ることを確認します。

### ステップ 3: 検索仕様を決める

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品検索機能を作ります。
以下の検索条件で検索できるようにしたいです。

・商品名（部分一致）
・カテゴリ（完全一致）
・価格帯（min〜max）

この検索機能の設計について相談させてください。
クエリパラメータの形式はどうすべきですか？
```

期待される AI の回答例：

```
クエリパラメータの形式は以下のようにするのが一般的です：

GET /api/products/search?name=ボール&category=Stationery&minPrice=100&maxPrice=500

【パラメータ】
- name: 部分一致検索（省略可）
- category: 完全一致（省略可）
- minPrice: 最低価格（省略可、デフォルト 0）
- maxPrice: 最高価格（省略可、デフォルト制限なし）
```

### ステップ 4: 検索機能を実装する

使用する AI 機能: **インライン補完**

AI の提案を参考に、自分で実装を進めます。

期待される実装（Service 層）：

```csharp
// ProductService に追加
public List<Product> Search(string? name, ProductCategory? category,
                           int? minPrice, int? maxPrice)
{
    var products = _repository.FindAll();

    return products
        .Where(product =>
        {
            if (name != null && !product.Name.Contains(name))
                return false;
            if (category.HasValue && product.Category != category.Value)
                return false;
            if (minPrice.HasValue && product.Price < minPrice.Value)
                return false;
            if (maxPrice.HasValue && product.Price > maxPrice.Value)
                return false;
            return true;
        })
        .ToList();
}
```

### ステップ 5: テストを追加して確認する

使用する AI 機能: **インライン補完**

検索機能のテストを追加し、動作を確認します。

```csharp
[Fact]
public void Search_ByName()
{
    // Arrange: テストデータを準備
    var product1 = new Product
    {
        Id = 1,
        Name = "ボールペン",
        Category = ProductCategory.Stationery,
        Price = 120
    };
    var product2 = new Product
    {
        Id = 2,
        Name = "消しゴム",
        Category = ProductCategory.Stationery,
        Price = 80
    };

    _mockRepository
        .Setup(r => r.FindAll())
        .Returns(new List<Product> { product1, product2 });

    // Act
    var result = _service.Search("ボール", null, null, null);

    // Assert
    Assert.Single(result);
    Assert.Equal("ボールペン", result[0].Name);
}
```

---

## 演習 3: Controller 層の実装（20 分）

この演習では、ASP.NET Core Controller を使って REST API の Controller 層を実装します。

### ステップ 1: Controller を作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品の REST API を実装してください。ASP.NET Core を使用します。

【エンドポイント】
・POST /api/products - 商品登録
・GET /api/products - 商品一覧
・GET /api/products/{id} - 商品詳細
・GET /api/products/search - 商品検索
```

期待される実装：

```csharp
// Inventory.Api/Controllers/ProductsController.cs
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

    // 商品登録
    [HttpPost]
    public ActionResult<Product> Create([FromBody] ProductInput input)
    {
        try
        {
            var product = _productService.Create(input);
            return CreatedAtAction(nameof(FindById), new { id = product.Id }, product);
        }
        catch (ArgumentException e)
        {
            return BadRequest(new { error = e.Message });
        }
    }

    // 商品一覧
    [HttpGet]
    public ActionResult<List<Product>> FindAll()
    {
        return _productService.FindAll();
    }

    // 商品詳細
    [HttpGet("{id}")]
    public ActionResult<Product> FindById(int id)
    {
        var product = _productService.FindById(id);
        if (product == null)
        {
            return NotFound(new { error = "商品が見つかりません" });
        }
        return product;
    }

    // 商品検索
    [HttpGet("search")]
    public ActionResult<List<Product>> Search(
        [FromQuery] string? name,
        [FromQuery] ProductCategory? category,
        [FromQuery] int? minPrice,
        [FromQuery] int? maxPrice)
    {
        return _productService.Search(name, category, minPrice, maxPrice);
    }
}
```

- **[ApiController]**: JSON を返す Controller
- **[FromBody]**: POST リクエストのボディ
- **{id}**: ルートパラメータ
- **[FromQuery]**: クエリパラメータ（`?name=xxx` など）

### ステップ 2: 動作確認する

サーバーを起動します。

```sh
dotnet run --project Inventory.Api
```

別のターミナルで curl コマンドを実行して動作確認します。

```sh
# 商品登録
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "ボールペン", "category": "Stationery", "price": 120}'

# 商品一覧
curl http://localhost:5000/api/products

# 商品検索
curl "http://localhost:5000/api/products/search?name=ボール"
```

### ステップ 3: エラーケースを確認する

バリデーションエラーが正しく返ることを確認します。

```sh
# 空の商品名でエラー
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "", "category": "Stationery", "price": 120}'
```

期待されるレスポンス：

```json
{ "error": "商品名は必須です" }
```

---

## 演習 4: フロントエンド UI の生成（30 分）

この演習では、AI に商品一覧・登録画面を生成させます。

### ステップ 1: 画面仕様を AI に伝える

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫管理システムのフロントエンド画面を作成してください。

【技術スタック】
・HTML / CSS / JavaScript（UI ライブラリは使用しない）
・fetch API で API サーバーと通信

【画面構成】
・ヘッダー：システム名、ナビゲーション
・メイン：商品一覧テーブル
・フッター：コピーライト

【機能】
・商品一覧の表示（テーブル形式）
・商品登録フォーム（モーダル）
・検索ボックス

【API エンドポイント】
・GET /api/products（商品一覧取得）
・POST /api/products（商品登録）
・GET /api/products/search?name=xxx（商品検索）
```

### ステップ 2: 生成されたコードを配置する

使用する AI 機能: **インライン補完**

AI が生成した HTML / CSS / JavaScript を `Inventory.Api/wwwroot/` フォルダに配置します。

```
Inventory.Api/wwwroot/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

### ステップ 3: 動作確認する

サーバーを起動してブラウザで確認します。

```sh
dotnet run --project Inventory.Api
```

ブラウザで `http://localhost:5000` を開き、以下を確認します：

- 商品一覧が表示される
- 商品登録フォームが動作する
- 検索ボックスで絞り込める

---

## 演習 5: Playwright テストの作成（20 分）

この演習では、AI に E2E テストを生成させます。

### ステップ 1: テストケースを AI に依頼する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の画面操作に対する Playwright の E2E テストを作成してください。

【画面】
商品一覧画面

【テストケース】
1. 初期表示で商品一覧テーブルが表示される
2. 「商品を追加」ボタンで登録モーダルが開く
3. 商品を登録すると一覧に追加される
```

### ステップ 2: テストを実行する

```sh
npx playwright test
```

テストが通ることを確認します。

- Playwright はヘッドレスブラウザで実際の画面操作をシミュレートする
- `npx playwright test --ui` で UI モードを起動すると、テスト実行を視覚的に確認できる

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
