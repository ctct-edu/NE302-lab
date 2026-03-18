package com.example.inventory.service;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.TransactionType;
import com.example.inventory.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 在庫サービス
 */
@Service
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public Inventory findByProductId(Long productId) {
        return inventoryRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("在庫情報が見つかりません: " + productId));
    }

    public Inventory updateQuantity(Long productId, TransactionType type, int quantity) {
        // 在庫を取得
        Inventory inventory = inventoryRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("在庫情報が見つかりません: " + productId));

        // 数量の検証
        if (quantity <= 0) {
            throw new IllegalArgumentException("数量は1以上で入力してください");
        }

        // 在庫の更新
        int newQuantity;
        if (type == TransactionType.IN) {
            newQuantity = inventory.getQuantity() + quantity;
        } else {
            newQuantity = inventory.getQuantity() - quantity;
            if (newQuantity < 0) {
                throw new IllegalStateException("在庫が不足しています");
            }
        }

        inventory.setQuantity(newQuantity);
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> findAlertItems() {
        return inventoryRepository.findAlertItems();
    }

    /**
     * アラート対象の在庫を取得（閾値以下の在庫）
     */
    public List<Inventory> getAlertProducts() {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getQuantity() <= inv.getThreshold())
                .toList();
    }

    /**
     * 在庫数量を更新（String型のtypeを受け取るオーバーロード）
     */
    public Inventory updateQuantity(Long productId, String type, int quantity) {
        TransactionType transactionType = "IN".equals(type) ? TransactionType.IN : TransactionType.OUT;
        return updateQuantity(productId, transactionType, quantity);
    }
}
