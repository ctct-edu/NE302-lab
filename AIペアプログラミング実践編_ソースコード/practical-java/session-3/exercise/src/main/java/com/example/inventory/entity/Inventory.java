package com.example.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 在庫情報
 */
@Entity
@Table(name = "inventories")
public class Inventory {
    /** 商品ID */
    @Id
    @Column(name = "product_id")
    private Long productId;

    /** 現在の在庫数 */
    @Column(nullable = false)
    private Integer quantity = 0;

    /** 発注閾値 */
    @Column(nullable = false)
    private Integer threshold = 10;

    /** 最終更新日時 */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // デフォルトコンストラクタ（JPA用）
    public Inventory() {
    }

    // Getter / Setter
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getThreshold() {
        return threshold;
    }

    public void setThreshold(Integer threshold) {
        this.threshold = threshold;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
