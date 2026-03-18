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

| ファイル/フォルダ                              | 内容                                |
| ---------------------------------------------- | ----------------------------------- |
| `docs/requirements.md`                         | 要件定義書（Session 1 で作成）      |
| `docs/design.md`                               | 設計書（Session 2 で作成）          |
| `src/main/java/.../entity/*.java`              | エンティティ（Session 2 で作成）    |
| `src/test/java/.../SampleTest.java`            | サンプルテストファイル              |
| `pom.xml`                                      | Maven 設定（JUnit 5 設定済み）      |

---

## 演習 1: テスト環境の確認（10 分）

この演習では、テスト環境が正しく動作することを確認します。

### ステップ 1: 依存パッケージをインストールする

ターミナルで以下のコマンドを実行します。

```sh
cd inventory-system
./mvnw clean install -DskipTests
```

### ステップ 2: テストを実行する

```sh
./mvnw test
```

サンプルテストが通ることを確認します。

- `./mvnw test` は Maven でテストを実行するコマンド
- IDE（IntelliJ IDEA や Eclipse）からも実行可能

### ステップ 3: テストファイルの構造を確認する

`src/test/java/` フォルダ内のサンプルテストを開いて構造を確認します。

```java
// src/test/java/com/example/inventory/SampleTest.java
package com.example.inventory;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SampleTest {
    @Test
    void onePlusOneEqualsTwo() {
        assertEquals(2, 1 + 1);
    }
}
```

| アノテーション/メソッド | 説明                                     |
| ----------------------- | ---------------------------------------- |
| `@Test`                 | テストメソッドであることを示す           |
| `assertEquals`          | 期待値と実際の値が等しいことを確認       |
| `assertTrue`            | 条件が true であることを確認             |
| `assertThrows`          | 例外がスローされることを確認             |

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
以下の仕様を満たすバリデーション関数のテストを JUnit 5 で作成してください。
実装はまだないので、テストだけ書いてください。

【クラス名】
ProductValidator

【メソッド】
ValidationResult validate(ProductInput input)

【仕様】
・name は必須、1〜100 文字
・category は STATIONERY, OFFICE, OTHER のいずれか
・price は 0 以上の整数

【テストケース】
・正常系：有効な入力
・異常系：name が空、name が 100 文字超、price が負数 など
```

### ステップ 2: テストファイルを作成する

使用する AI 機能: **インライン補完**

`src/test/java/com/example/inventory/service/ProductValidatorTest.java` を作成します。

期待されるテストコード：

```java
// src/test/java/com/example/inventory/service/ProductValidatorTest.java
package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.entity.ProductCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class ProductValidatorTest {
    private ProductValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ProductValidator();
    }

    @Test
    @DisplayName("有効な入力の場合、バリデーションが成功する")
    void validInput_returnsSuccess() {
        // Arrange（準備）
        ProductInput input = new ProductInput();
        input.setName("ボールペン");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        // Act（実行）
        ValidationResult result = validator.validate(input);

        // Assert（検証）
        assertTrue(result.isValid());
    }

    @Test
    @DisplayName("name が空の場合、エラーを返す")
    void emptyName_returnsError() {
        ProductInput input = new ProductInput();
        input.setName("");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("商品名は必須です"));
    }

    @Test
    @DisplayName("name が 100 文字を超える場合、エラーを返す")
    void nameTooLong_returnsError() {
        ProductInput input = new ProductInput();
        input.setName("a".repeat(101));
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("商品名は100文字以内で入力してください"));
    }

    @Test
    @DisplayName("price が負数の場合、エラーを返す")
    void negativePrice_returnsError() {
        ProductInput input = new ProductInput();
        input.setName("ボールペン");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(-100);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("価格は0以上で入力してください"));
    }
}
```

- **@DisplayName**: テスト名を日本語で表示
- **@BeforeEach**: 各テストの前に実行される処理

### ステップ 3: テストを実行する（Red）

```sh
./mvnw test
```

実装がないので失敗することを確認します。「テストが失敗する」ことを確認してから実装に進みます。

### ステップ 4: 実装を作成する（Green）

使用する AI 機能: **Chat** または **インライン補完**

`src/main/java/com/example/inventory/service/ProductValidator.java` を作成して、テストが通るように実装します。まずは「テストが通る最小限の実装」を目指します。

---

## 演習 3: Service 層のテスト（40 分）

この演習では、Repository をモックして Service のロジックだけをテストします。

### ステップ 1: モックの作成を学ぶ

**モック**とは「本物の代わりに使う偽物」です。データベースにアクセスせずに Service のロジックをテストできます。

Mockito の基本的な使い方：

```java
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.mockito.Mockito.*;

// モックの作成
@Mock
private ProductRepository mockRepository;

// 戻り値の設定
when(mockRepository.save(any())).thenReturn(savedProduct);

// 呼び出し回数の確認
verify(mockRepository, times(1)).save(any());

// 引数の確認
verify(mockRepository).save(argThat(product ->
    product.getName().equals("ボールペン")
));
```

### ステップ 2: ProductService のテストを作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
ProductService のテストを JUnit 5 + Mockito で書いてください。
ProductRepository はモックを使います。

【テスト対象】
ProductService.create(ProductInput input)

【モックの設定】
・mockRepository.save() は保存した Product を返す
```

期待されるテストコード：

```java
// src/test/java/com/example/inventory/service/ProductServiceTest.java
package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.ProductCategory;
import com.example.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock
    private ProductRepository mockRepository;

    private ProductService service;

    @BeforeEach
    void setUp() {
        service = new ProductService(mockRepository);
    }

    @Test
    @DisplayName("商品を登録できる")
    void create_success() {
        // Arrange: モックの戻り値を設定
        Product savedProduct = new Product();
        savedProduct.setId(1L);
        savedProduct.setName("ボールペン");
        savedProduct.setCategory(ProductCategory.STATIONERY);
        savedProduct.setPrice(120);
        savedProduct.setCreatedAt(LocalDateTime.now());
        savedProduct.setUpdatedAt(LocalDateTime.now());

        when(mockRepository.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        ProductInput input = new ProductInput();
        input.setName("ボールペン");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        Product product = service.create(input);

        // Assert
        assertEquals(1L, product.getId());
        assertEquals("ボールペン", product.getName());
        verify(mockRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("バリデーションエラーの場合、例外を投げる")
    void create_validationError_throwsException() {
        // Arrange
        ProductInput invalidInput = new ProductInput();
        invalidInput.setName(""); // 空の商品名
        invalidInput.setCategory(ProductCategory.STATIONERY);
        invalidInput.setPrice(120);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            service.create(invalidInput);
        });
        verify(mockRepository, never()).save(any());
    }
}
```

- **@ExtendWith(MockitoExtension.class)**: Mockito を JUnit 5 で使用
- **@Mock**: モックオブジェクトを自動生成
- **when().thenReturn()**: モックの戻り値を設定
- **verify()**: メソッドの呼び出しを検証

### ステップ 3: テストを実行する

```sh
./mvnw test
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

```java
// src/test/java/com/example/inventory/service/InventoryServiceTest.java
package com.example.inventory.service;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.TransactionType;
import com.example.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
    @Mock
    private InventoryRepository mockRepository;

    private InventoryService service;

    @BeforeEach
    void setUp() {
        service = new InventoryService(mockRepository);
    }

    @Test
    @DisplayName("入庫で在庫数が増える")
    void updateQuantity_in_increasesQuantity() {
        // Arrange
        Inventory inventory = new Inventory();
        inventory.setProductId(1L);
        inventory.setQuantity(10);
        inventory.setThreshold(5);

        when(mockRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(mockRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Inventory result = service.updateQuantity(1L, TransactionType.IN, 5);

        // Assert
        assertEquals(15, result.getQuantity());
    }

    @Test
    @DisplayName("出庫で在庫がマイナスになる場合、例外を投げる")
    void updateQuantity_out_insufficientStock_throwsException() {
        // Arrange
        Inventory inventory = new Inventory();
        inventory.setProductId(1L);
        inventory.setQuantity(5);
        inventory.setThreshold(5);

        when(mockRepository.findById(1L)).thenReturn(Optional.of(inventory));

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            service.updateQuantity(1L, TransactionType.OUT, 6);
        });
        assertEquals("在庫が不足しています", exception.getMessage());
    }
}
```

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
