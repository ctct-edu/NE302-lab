package com.example.inventory.dto;

import com.example.inventory.entity.ProductCategory;

/**
 * 商品登録時の入力データ
 */
public class ProductInput {
    private String name;
    private ProductCategory category;
    private Integer price;

    public ProductInput() {
    }

    public ProductInput(String name, ProductCategory category, Integer price) {
        this.name = name;
        this.category = category;
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }
}
