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

| ファイル/フォルダ                       | 内容                                |
| --------------------------------------- | ----------------------------------- |
| `docs/*.md`                             | 要件定義書・設計書                  |
| `src/main/java/.../entity/*.java`       | エンティティ                        |
| `src/main/java/.../service/*.java`      | Service 層（Session 3 作成）        |
| `src/test/java/.../service/*Test.java`  | テストファイル（Session 3 で作成）  |
| `pom.xml`                               | Maven 設定（Spring Boot 設定済み）  |

---

## 演習 1: Repository 層の実装（20 分）

この演習では、データの永続化を担う Repository 層を実装します。

### ステップ 1: Repository 層を確認する

使用する AI 機能: **Chat**

Spring Data JPA を使用しているため、Repository はインターフェースを定義するだけで基本的な CRUD 操作が提供されます。

```java
// src/main/java/com/example/inventory/repository/ProductRepository.java
package com.example.inventory.repository;

import com.example.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContaining(String name);
}
```

- **JpaRepository**: `save()`, `findById()`, `findAll()`, `delete()` などが自動で提供される
- **findByNameContaining**: メソッド名から自動でクエリが生成される

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
@ProductServiceTest.java

このテストが通るように実装してください。
```

期待される実装：

```java
// src/main/java/com/example/inventory/service/ProductService.java
package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.dto.ValidationResult;
import com.example.inventory.entity.Product;
import com.example.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductValidator productValidator;

    public ProductService(ProductRepository productRepository, ProductValidator productValidator) {
        this.productRepository = productRepository;
        this.productValidator = productValidator;
    }

    public Product create(ProductInput input) {
        // バリデーション
        ValidationResult validation = productValidator.validate(input);
        if (!validation.isValid()) {
            throw new IllegalArgumentException(String.join(", ", validation.getErrors()));
        }

        // エンティティの作成と保存
        Product product = new Product();
        product.setName(input.getName());
        product.setCategory(input.getCategory());
        product.setPrice(input.getPrice());

        return productRepository.save(product);
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("商品が見つかりません: " + id));
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }
}
```

- **依存性注入（DI）**: Spring がコンストラクタ経由で依存を注入
- テスト時は `@Mock` でモックを注入し、本番時は実際の Repository が注入される

### ステップ 2: テストを実行する（Green）

```sh
./mvnw test
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

GET /api/products/search?name=ボール&category=STATIONERY&minPrice=100&maxPrice=500

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

```java
// ProductService に追加
public List<Product> search(String name, ProductCategory category,
                           Integer minPrice, Integer maxPrice) {
    List<Product> products = productRepository.findAll();

    return products.stream()
            .filter(product -> {
                // 商品名（部分一致）
                if (name != null && !product.getName().contains(name)) {
                    return false;
                }
                // カテゴリ（完全一致）
                if (category != null && product.getCategory() != category) {
                    return false;
                }
                // 価格帯
                if (minPrice != null && product.getPrice() < minPrice) {
                    return false;
                }
                if (maxPrice != null && product.getPrice() > maxPrice) {
                    return false;
                }
                return true;
            })
            .toList();
}
```

### ステップ 5: テストを追加して確認する

使用する AI 機能: **インライン補完**

検索機能のテストを追加し、動作を確認します。

```java
@Test
@DisplayName("商品名で部分一致検索できる")
void search_byName() {
    // Arrange: テストデータを準備
    Product product1 = new Product();
    product1.setId(1L);
    product1.setName("ボールペン");
    product1.setCategory(ProductCategory.STATIONERY);
    product1.setPrice(120);

    Product product2 = new Product();
    product2.setId(2L);
    product2.setName("消しゴム");
    product2.setCategory(ProductCategory.STATIONERY);
    product2.setPrice(80);

    when(mockRepository.findAll()).thenReturn(List.of(product1, product2));

    // Act
    List<Product> result = service.search("ボール", null, null, null);

    // Assert
    assertEquals(1, result.size());
    assertEquals("ボールペン", result.get(0).getName());
}
```

---

## 演習 3: Controller 層の実装（20 分）

この演習では、Spring Boot Controller を使って REST API の Controller 層を実装します。

### ステップ 1: Controller を作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品の REST API を実装してください。Spring Boot を使用します。

【エンドポイント】
・POST /api/products - 商品登録
・GET /api/products - 商品一覧
・GET /api/products/{id} - 商品詳細
・GET /api/products/search - 商品検索
```

期待される実装：

```java
// src/main/java/com/example/inventory/controller/ProductController.java
package com.example.inventory.controller;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.ProductCategory;
import com.example.inventory.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // 商品登録
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody ProductInput input) {
        Product product = productService.create(input);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    // 商品一覧
    @GetMapping
    public List<Product> findAll() {
        return productService.findAll();
    }

    // 商品詳細
    @GetMapping("/{id}")
    public Product findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    // 商品検索
    @GetMapping("/search")
    public List<Product> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice) {
        return productService.search(name, category, minPrice, maxPrice);
    }

    // 例外ハンドリング
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    record ErrorResponse(String error) {}
}
```

- **@RestController**: JSON を返す Controller
- **@RequestBody**: POST リクエストのボディ
- **@PathVariable**: URL パラメータ（`{id}` など）
- **@RequestParam**: クエリパラメータ（`?name=xxx` など）

### ステップ 2: 動作確認する

サーバーを起動します。

```sh
./mvnw spring-boot:run
```

別のターミナルで curl コマンドを実行して動作確認します。

```sh
# 商品登録
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "ボールペン", "category": "STATIONERY", "price": 120}'

# 商品一覧
curl http://localhost:8080/api/products

# 商品検索
curl "http://localhost:8080/api/products/search?name=ボール"
```

### ステップ 3: エラーケースを確認する

バリデーションエラーが正しく返ることを確認します。

```sh
# 空の商品名でエラー
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "", "category": "STATIONERY", "price": 120}'
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

AI が生成した HTML / CSS / JavaScript を `src/main/resources/static/` フォルダに配置します。

```
src/main/resources/static/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

### ステップ 3: 動作確認する

サーバーを起動してブラウザで確認します。

```sh
./mvnw spring-boot:run
```

ブラウザで `http://localhost:8080` を開き、以下を確認します：

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
