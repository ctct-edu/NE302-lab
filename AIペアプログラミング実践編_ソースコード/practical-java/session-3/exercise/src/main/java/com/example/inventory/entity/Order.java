package com.example.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 発注情報
 */
@Entity
@Table(name = "orders")
public class Order {
    /** 発注ID（自動採番） */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 商品ID */
    @Column(name = "product_id", nullable = false)
    private Long productId;

    /** 発注数量 */
    @Column(nullable = false)
    private Integer quantity;

    /** ステータス */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    /** 発注日 */
    @Column(name = "ordered_at")
    private LocalDateTime orderedAt;

    /** 入荷日 */
    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    /** 作成日時 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // デフォルトコンストラクタ（JPA用）
    public Order() {
    }

    // Getter / Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public void setOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
