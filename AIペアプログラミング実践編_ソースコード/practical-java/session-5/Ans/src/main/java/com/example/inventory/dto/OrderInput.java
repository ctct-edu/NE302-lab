package com.example.inventory.dto;

/**
 * 発注作成時の入力データ
 */
public class OrderInput {
    private Long productId;
    private Integer quantity;

    public OrderInput() {
    }

    public OrderInput(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
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
}
