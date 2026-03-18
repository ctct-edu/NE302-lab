package com.example.inventory.entity;

/**
 * 発注ステータス
 */
public enum OrderStatus {
    /** 作成中 */
    PENDING,
    /** 発注済み */
    ORDERED,
    /** 入荷済み */
    RECEIVED,
    /** キャンセル */
    CANCELLED
}
