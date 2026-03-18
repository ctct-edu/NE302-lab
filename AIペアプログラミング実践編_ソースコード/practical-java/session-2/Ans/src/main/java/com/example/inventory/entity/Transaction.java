package com.example.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 入出庫履歴
 */
@Entity
@Table(name = "transactions")
public class Transaction {
    /** 履歴ID（自動採番） */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 商品ID */
    @Column(name = "product_id", nullable = false)
    private Long productId;

    /** 入庫/出庫 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    /** 数量 */
    @Column(nullable = false)
    private Integer quantity;

    /** 備考 */
    @Column(length = 500)
    private String note;

    /** 登録日時 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // デフォルトコンストラクタ（JPA用）
    public Transaction() {
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

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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
