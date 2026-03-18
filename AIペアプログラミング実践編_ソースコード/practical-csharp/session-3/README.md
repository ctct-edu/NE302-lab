# Session 3: テストコード実装

## 前提

- Session 2 でクラス設計・データベース設計が完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                    |
| -------------- | -------------------------------------- | ------------------------------------------------------- |
| チャット       | テストケースの洗い出し、設計相談       | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L` |
| インライン補完 | テストコード・実装コードの入力         | Tab で受け入れ、Esc で拒否                              |

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 2 までの完成物が含まれています：

| ファイル/フォルダ                  | 内容                                |
| ---------------------------------- | ----------------------------------- |
| `docs/requirements.md`             | 要件定義書（Session 1 で作成）      |
| `docs/design.md`                   | 設計書（Session 2 で作成）          |
| `Inventory.Api/Entities/*.cs`      | エンティティ（Session 2 で作成）    |
| `Inventory.Tests/SampleTest.cs`    | サンプルテストファイル              |
| `Inventory.sln`                    | ソリューションファイル              |

---

## 演習 1: テスト環境の確認（10 分）

この演習では、テスト環境が正しく動作することを確認します。

### ステップ 1: 依存パッケージを復元する

ターミナルで以下のコマンドを実行します。

```sh
cd inventory-system
dotnet restore
```

### ステップ 2: テストを実行する

```sh
dotnet test
```

サンプルテストが通ることを確認します。

- `dotnet test` は .NET でテストを実行するコマンド
- IDE（Visual Studio や VS Code）からも実行可能

### ステップ 3: テストファイルの構造を確認する

`Inventory.Tests/` フォルダ内のサンプルテストを開いて構造を確認します。

```csharp
// Inventory.Tests/SampleTest.cs
namespace Inventory.Tests;

public class SampleTest
{
    [Fact]
    public void OnePlusOneEqualsTwo()
    {
        Assert.Equal(2, 1 + 1);
    }
}
```

| 属性/メソッド        | 説明                                     |
| -------------------- | ---------------------------------------- |
| `[Fact]`             | テストメソッドであることを示す           |
| `Assert.Equal`       | 期待値と実際の値が等しいことを確認       |
| `Assert.True`        | 条件が true であることを確認             |
| `Assert.Throws<T>`   | 例外がスローされることを確認             |

---

## 演習 2: バリデーション関数のテスト（30 分）

この演習では、TDD（テスト駆動開発）の Red-Green-Refactor サイクルを体験します。

### TDD の Red-Green-Refactor サイクル

TDD では、以下の 3 つのステップを繰り返して開発を進めます：

| ステップ     | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| **Red**      | まず失敗するテストを書く（テストが赤くなる）           |
| **Green**    | テストが通る最小限の実装を書く（テストが緑になる）     |
| **Refactor** | コードを整理する（テストが緑のまま）                   |

この演習では、ステップ 1-2 で Red、ステップ 4 で Green を体験します。

### ステップ 1: 仕様からテストを生成する

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の仕様を満たすバリデーション関数のテストを xUnit で作成してください。
実装はまだないので、テストだけ書いてください。

【クラス名】
ProductValidator

【メソッド】
ValidationResult Validate(ProductInput input)

【仕様】
・Name は必須、1〜100 文字
・Category は Food, Drink, Stationery, Other のいずれか
・Price は 0 以上の整数

【テストケース】
・正常系：有効な入力
・異常系：Name が空、Name が 100 文字超、Price が負数 など
```

### ステップ 2: テストファイルを作成する

使用する AI 機能: **インライン補完**

`Inventory.Tests/Services/ProductValidatorTest.cs` を作成します。

期待されるテストコード：

```csharp
// Inventory.Tests/Services/ProductValidatorTest.cs
namespace Inventory.Tests.Services;

using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;

public class ProductValidatorTest
{
    private readonly ProductValidator _validator;

    public ProductValidatorTest()
    {
        _validator = new ProductValidator();
    }

    [Fact]
    public void ValidInput_ReturnsSuccess()
    {
        // Arrange（準備）
        var input = new ProductInput
        {
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = 120
        };

        // Act（実行）
        var result = _validator.Validate(input);

        // Assert（検証）
        Assert.True(result.IsValid);
    }

    [Fact]
    public void EmptyName_ReturnsError()
    {
        var input = new ProductInput
        {
            Name = "",
            Category = ProductCategory.Stationery,
            Price = 120
        };

        var result = _validator.Validate(input);

        Assert.False(result.IsValid);
        Assert.Contains("商品名は必須です", result.Errors);
    }

    [Fact]
    public void NameTooLong_ReturnsError()
    {
        var input = new ProductInput
        {
            Name = new string('a', 101),
            Category = ProductCategory.Stationery,
            Price = 120
        };

        var result = _validator.Validate(input);

        Assert.False(result.IsValid);
        Assert.Contains("商品名は100文字以内で入力してください", result.Errors);
    }

    [Fact]
    public void NegativePrice_ReturnsError()
    {
        var input = new ProductInput
        {
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = -100
        };

        var result = _validator.Validate(input);

        Assert.False(result.IsValid);
        Assert.Contains("価格は0以上で入力してください", result.Errors);
    }
}
```

- **[Fact]**: テストメソッドであることを示す属性
- **コンストラクタ**: 各テストの前に実行される（xUnit ではコンストラクタを使用）

### ステップ 3: テストを実行する（Red）

```sh
dotnet test
```

実装がないので失敗することを確認します。「テストが失敗する」ことを確認してから実装に進みます。

### ステップ 4: 実装を作成する（Green）

使用する AI 機能: **Chat** または **インライン補完**

`Inventory.Api/Services/ProductValidator.cs` を作成して、テストが通るように実装します。まずは「テストが通る最小限の実装」を目指します。

---

## 演習 3: Service 層のテスト（40 分）

この演習では、Repository をモックして Service のロジックだけをテストします。

### ステップ 1: モックの作成を学ぶ

**モック**とは「本物の代わりに使う偽物」です。データベースにアクセスせずに Service のロジックをテストできます。

Moq の基本的な使い方：

```csharp
using Moq;

// モックの作成
var mockRepository = new Mock<IProductRepository>();

// 戻り値の設定
mockRepository
    .Setup(r => r.Save(It.IsAny<Product>()))
    .Returns(savedProduct);

// 呼び出し回数の確認
mockRepository.Verify(r => r.Save(It.IsAny<Product>()), Times.Once());

// 引数の確認
mockRepository.Verify(r => r.Save(It.Is<Product>(p =>
    p.Name == "ボールペン"
)));
```

### ステップ 2: ProductService のテストを作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
ProductService のテストを xUnit + Moq で書いてください。
IProductRepository はモックを使います。

【テスト対象】
ProductService.Create(ProductInput input)

【モックの設定】
・mockRepository.Save() は保存した Product を返す
```

期待されるテストコード：

```csharp
// Inventory.Tests/Services/ProductServiceTest.cs
namespace Inventory.Tests.Services;

using Moq;
using Inventory.Api.Dtos;
using Inventory.Api.Entities;
using Inventory.Api.Services;
using Inventory.Api.Repositories;

public class ProductServiceTest
{
    private readonly Mock<IProductRepository> _mockRepository;
    private readonly ProductService _service;

    public ProductServiceTest()
    {
        _mockRepository = new Mock<IProductRepository>();
        _service = new ProductService(_mockRepository.Object);
    }

    [Fact]
    public void Create_Success()
    {
        // Arrange: モックの戻り値を設定
        var savedProduct = new Product
        {
            Id = 1,
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = 120,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        _mockRepository
            .Setup(r => r.Save(It.IsAny<Product>()))
            .Returns(savedProduct);

        // Act
        var input = new ProductInput
        {
            Name = "ボールペン",
            Category = ProductCategory.Stationery,
            Price = 120
        };

        var product = _service.Create(input);

        // Assert
        Assert.Equal(1, product.Id);
        Assert.Equal("ボールペン", product.Name);
        _mockRepository.Verify(r => r.Save(It.IsAny<Product>()), Times.Once());
    }

    [Fact]
    public void Create_ValidationError_ThrowsException()
    {
        // Arrange
        var invalidInput = new ProductInput
        {
            Name = "", // 空の商品名
            Category = ProductCategory.Stationery,
            Price = 120
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
        {
            _service.Create(invalidInput);
        });
        _mockRepository.Verify(r => r.Save(It.IsAny<Product>()), Times.Never());
    }
}
```

- **Mock<T>**: モックオブジェクトを作成
- **Setup().Returns()**: モックの戻り値を設定
- **Verify()**: メソッドの呼び出しを検証
- **It.IsAny<T>()**: 任意の引数にマッチ

### ステップ 3: テストを実行する

```sh
dotnet test
```

テストが通ることを確認します。

---

## 演習 4: 在庫更新ロジックなど、残りの機能のテスト（40 分）

この演習では、在庫更新（入庫・出庫）のテストを作成します。

### ステップ 1: エッジケースを洗い出す

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫更新（入庫・出庫）のテストケースを洗い出してください。

【仕様】
・入庫: 在庫数を増やす
・出庫: 在庫数を減らす
・在庫数がマイナスになる場合はエラー

【特に確認したい】
・境界値（在庫 0 からの出庫など）
・異常系（存在しない商品の更新など）
```

期待される出力：

```
【正常系】
・入庫: 在庫 10 → 入庫 5 → 在庫 15
・出庫: 在庫 10 → 出庫 5 → 在庫 5

【境界値】
・在庫 0 から入庫 → 成功
・在庫 5 から出庫 5 → 在庫 0（成功）
・在庫 5 から出庫 6 → エラー（マイナスになる）

【異常系】
・存在しない商品 ID の更新 → エラー
・数量が 0 以下 → エラー
```

### ステップ 2: テストを作成して実行する

使用する AI 機能: **インライン補完**

洗い出したテストケースを元にテストを作成します。

```csharp
// Inventory.Tests/Services/InventoryServiceTest.cs
namespace Inventory.Tests.Services;

using Moq;
using Inventory.Api.Entities;
using Inventory.Api.Services;
using Inventory.Api.Repositories;

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
    public void UpdateQuantity_In_IncreasesQuantity()
    {
        // Arrange
        var inventory = new InventoryItem
        {
            ProductId = 1,
            Quantity = 10,
            Threshold = 5
        };

        _mockRepository
            .Setup(r => r.FindById(1))
            .Returns(inventory);
        _mockRepository
            .Setup(r => r.Save(It.IsAny<InventoryItem>()))
            .Returns<InventoryItem>(i => i);

        // Act
        var result = _service.UpdateQuantity(1, TransactionType.In, 5);

        // Assert
        Assert.Equal(15, result.Quantity);
    }

    [Fact]
    public void UpdateQuantity_Out_InsufficientStock_ThrowsException()
    {
        // Arrange
        var inventory = new InventoryItem
        {
            ProductId = 1,
            Quantity = 5,
            Threshold = 5
        };

        _mockRepository
            .Setup(r => r.FindById(1))
            .Returns(inventory);

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() =>
        {
            _service.UpdateQuantity(1, TransactionType.Out, 6);
        });
        Assert.Equal("在庫が不足しています", exception.Message);
    }
}
```

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
