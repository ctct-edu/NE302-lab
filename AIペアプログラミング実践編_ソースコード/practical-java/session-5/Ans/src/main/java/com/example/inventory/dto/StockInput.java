package com.example.inventory.dto;

/**
 * 入庫・出庫リクエストの入力データ
 */
public class StockInput {
    private Integer quantity;
    private String note;

    public StockInput() {
    }

    public StockInput(Integer quantity, String note) {
        this.quantity = quantity;
        this.note = note;
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
}
