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

| ファイル/フォルダ                                  | 内容                                   |
| -------------------------------------------------- | -------------------------------------- |
| `docs/*.md`                                        | 要件定義書・設計書                     |
| `src/main/java/.../entity/*.java`                  | エンティティ（Product など）           |
| `src/main/java/.../service/*.java`                 | Service 層（実装済み）                 |
| `src/main/java/.../repository/*.java`              | Repository 層（実装済み）              |
| `src/main/java/.../controller/*.java`              | REST Controller（実装済み）            |
| `src/main/java/.../InventoryApplication.java`      | アプリケーションエントリポイント       |
| `src/test/java/.../*Test.java`                     | テストファイル                         |
| `pom.xml`                                          | Maven プロジェクト設定                 |

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
@ProductService.java @InventoryService.java
この 2 つの Service の関係を説明してください。
在庫アラート機能を追加する場合、どちらに実装すべきですか？
```

- **@workspace**: プロジェクト全体を参照する（GitHub Copilot）
- **@ファイル名**: 特定のファイルを参照する

### ステップ 2: TDD で実装する

使用する AI 機能: **インライン補完**

TDD の Red-Green-Refactor サイクルで実装を進めます。

**テストを書く（Red）**

```java
// src/test/java/com/example/inventory/service/InventoryServiceTest.java に追加
@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    @DisplayName("閾値以下の在庫をアラート対象として返す")
    void getAlertProducts_returnsProductsBelowThreshold() {
        // Arrange
        List<Inventory> inventories = List.of(
            createInventory(1L, 5, 10),   // アラート対象（5 <= 10）
            createInventory(2L, 15, 10),  // 対象外（15 > 10）
            createInventory(3L, 10, 10)   // 境界値（10 <= 10）アラート対象
        );
        when(inventoryRepository.findAll()).thenReturn(inventories);

        // Act
        List<Inventory> alerts = inventoryService.getAlertProducts();

        // Assert
        assertEquals(2, alerts.size());
        assertTrue(alerts.stream().anyMatch(i -> i.getProductId().equals(1L)));
        assertTrue(alerts.stream().anyMatch(i -> i.getProductId().equals(3L)));
    }

    @Test
    @DisplayName("アラート対象がない場合、空リストを返す")
    void getAlertProducts_returnsEmptyList_whenNoAlerts() {
        // Arrange
        List<Inventory> inventories = List.of(
            createInventory(1L, 20, 10)  // 対象外（20 > 10）
        );
        when(inventoryRepository.findAll()).thenReturn(inventories);

        // Act
        List<Inventory> alerts = inventoryService.getAlertProducts();

        // Assert
        assertTrue(alerts.isEmpty());
    }

    private Inventory createInventory(Long productId, int quantity, int threshold) {
        Inventory inventory = new Inventory();
        inventory.setProductId(productId);
        inventory.setQuantity(quantity);
        inventory.setThreshold(threshold);
        return inventory;
    }
}
```

- 境界値（threshold と同じ値）もテストに含める
- 空リストのケースもテストする

**実装する（Green）**

```java
// src/main/java/com/example/inventory/service/InventoryService.java に追加
public List<Inventory> getAlertProducts() {
    return inventoryRepository.findAll().stream()
            .filter(inv -> inv.getQuantity() <= inv.getThreshold())
            .toList();
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
| ステータス更新 | PENDING → ORDERED → RECEIVED の順で遷移 |
| 発注キャンセル | 発注をキャンセル |

ステータスの遷移：

```
PENDING（発注中）
    ├─→ ORDERED（発注済み）→ RECEIVED（入荷済み）→ 在庫を増やす
    └─→ CANCELLED（キャンセル）
```

### ステップ 2: テストを書く

使用する AI 機能: **インライン補完**

TDD で実装を進めます。まずテストを書きます。

```java
// src/test/java/com/example/inventory/service/OrderServiceTest.java
package com.example.inventory.service;

import com.example.inventory.dto.OrderInput;
import com.example.inventory.entity.Order;
import com.example.inventory.entity.OrderStatus;
import com.example.inventory.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private InventoryService inventoryService;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, inventoryService);
    }

    @Test
    @DisplayName("発注を作成できる")
    void create_createsOrder() {
        // Arrange
        OrderInput input = new OrderInput(1L, 10);
        Order savedOrder = new Order();
        savedOrder.setId(1L);
        savedOrder.setProductId(1L);
        savedOrder.setQuantity(10);
        savedOrder.setStatus(OrderStatus.PENDING);
        savedOrder.setCreatedAt(LocalDateTime.now());

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        // Act
        Order order = orderService.create(input);

        // Assert
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(1L, order.getProductId());
        assertEquals(10, order.getQuantity());
    }

    @Test
    @DisplayName("入荷処理で在庫が増える")
    void receive_updatesInventory() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setProductId(1L);
        order.setQuantity(10);
        order.setStatus(OrderStatus.ORDERED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.receive(1L);

        // Assert
        assertEquals(OrderStatus.RECEIVED, result.getStatus());
        assertNotNull(result.getReceivedAt());
        verify(inventoryService).updateQuantity(1L, "IN", 10);
    }

    @Test
    @DisplayName("ORDERED 以外の発注は入荷処理できない")
    void receive_throwsException_whenStatusIsNotOrdered() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> orderService.receive(1L)
        );
        assertEquals("発注済みの発注のみ入荷処理できます", exception.getMessage());
    }
}
```

### ステップ 3: Service を実装する

使用する AI 機能: **インライン補完**

テストが通るように実装を進めます。

```java
// src/main/java/com/example/inventory/service/OrderService.java
package com.example.inventory.service;

import com.example.inventory.dto.OrderInput;
import com.example.inventory.entity.Order;
import com.example.inventory.entity.OrderStatus;
import com.example.inventory.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository, InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
    }

    public Order create(OrderInput input) {
        Order order = new Order();
        order.setProductId(input.getProductId());
        order.setQuantity(input.getQuantity());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order order(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("発注が見つかりません"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("発注中の発注のみ発注済みにできます");
        }

        order.setStatus(OrderStatus.ORDERED);
        order.setOrderedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order receive(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("発注が見つかりません"));

        if (order.getStatus() != OrderStatus.ORDERED) {
            throw new IllegalStateException("発注済みの発注のみ入荷処理できます");
        }

        // 在庫を更新
        inventoryService.updateQuantity(order.getProductId(), "IN", order.getQuantity());

        order.setStatus(OrderStatus.RECEIVED);
        order.setReceivedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order cancel(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("発注が見つかりません"));

        if (order.getStatus() == OrderStatus.RECEIVED) {
            throw new IllegalStateException("入荷済みの発注はキャンセルできません");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
}
```

### ステップ 4: API を実装する

使用する AI 機能: **Chat** または **インライン補完**

Controller を追加して API を完成させます。

```java
// src/main/java/com/example/inventory/controller/OrderController.java
package com.example.inventory.controller;

import com.example.inventory.dto.OrderInput;
import com.example.inventory.entity.Order;
import com.example.inventory.entity.OrderStatus;
import com.example.inventory.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody OrderInput input) {
        Order order = orderService.create(input);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public List<Order> findAll(@RequestParam(required = false) OrderStatus status) {
        if (status != null) {
            return orderService.findByStatus(status);
        }
        return orderService.findAll();
    }

    @PostMapping("/{id}/order")
    public ResponseEntity<Order> order(@PathVariable Long id) {
        Order order = orderService.order(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<Order> receive(@PathVariable Long id) {
        Order order = orderService.receive(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancel(@PathVariable Long id) {
        Order order = orderService.cancel(id);
        return ResponseEntity.ok(order);
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
