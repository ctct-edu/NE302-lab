package com.example.inventory.controller;

import com.example.inventory.dto.StockInput;
import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.TransactionType;
import com.example.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 在庫 REST API コントローラー
 */
@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    /**
     * 在庫情報取得
     */
    @GetMapping("/{productId}")
    public Map<String, Object> findByProductId(@PathVariable Long productId) {
        Inventory inventory = inventoryService.findByProductId(productId);
        return Map.of("inventory", toMap(inventory));
    }

    /**
     * 入庫処理
     */
    @PostMapping("/{productId}/in")
    public Map<String, Object> stockIn(@PathVariable Long productId, @RequestBody StockInput input) {
        Inventory inventory = inventoryService.updateQuantity(productId, TransactionType.IN, input.getQuantity());
        return Map.of("inventory", toMap(inventory));
    }

    /**
     * 出庫処理
     */
    @PostMapping("/{productId}/out")
    public Map<String, Object> stockOut(@PathVariable Long productId, @RequestBody StockInput input) {
        Inventory inventory = inventoryService.updateQuantity(productId, TransactionType.OUT, input.getQuantity());
        return Map.of("inventory", toMap(inventory));
    }

    /**
     * 在庫アラート一覧を取得
     */
    @GetMapping("/alerts")
    public List<Inventory> getAlerts() {
        return inventoryService.getAlertProducts();
    }

    /**
     * Inventory エンティティを camelCase キーの Map に変換
     */
    private Map<String, Object> toMap(Inventory inventory) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("productId", inventory.getProductId());
        map.put("quantity", inventory.getQuantity());
        map.put("threshold", inventory.getThreshold());
        map.put("updatedAt", inventory.getUpdatedAt());
        return map;
    }

    /**
     * バリデーションエラーのハンドリング
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleValidationError(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    /**
     * 在庫不足エラーのハンドリング
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleStateError(IllegalStateException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
