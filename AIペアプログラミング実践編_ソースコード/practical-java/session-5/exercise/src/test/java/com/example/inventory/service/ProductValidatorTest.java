package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.dto.ValidationResult;
import com.example.inventory.entity.ProductCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class ProductValidatorTest {
    private ProductValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ProductValidator();
    }

    @Test
    @DisplayName("有効な入力の場合、バリデーションが成功する")
    void validInput_returnsSuccess() {
        // Arrange（準備）
        ProductInput input = new ProductInput();
        input.setName("ボールペン");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        // Act（実行）
        ValidationResult result = validator.validate(input);

        // Assert（検証）
        assertTrue(result.isValid());
    }

    @Test
    @DisplayName("name が空の場合、エラーを返す")
    void emptyName_returnsError() {
        ProductInput input = new ProductInput();
        input.setName("");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("商品名は必須です"));
    }

    @Test
    @DisplayName("name が null の場合、エラーを返す")
    void nullName_returnsError() {
        ProductInput input = new ProductInput();
        input.setName(null);
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("商品名は必須です"));
    }

    @Test
    @DisplayName("name が 100 文字を超える場合、エラーを返す")
    void nameTooLong_returnsError() {
        ProductInput input = new ProductInput();
        input.setName("a".repeat(101));
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("商品名は100文字以内で入力してください"));
    }

    @Test
    @DisplayName("price が負数の場合、エラーを返す")
    void negativePrice_returnsError() {
        ProductInput input = new ProductInput();
        input.setName("ボールペン");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(-100);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("価格は0以上で入力してください"));
    }

    @Test
    @DisplayName("category が null の場合、エラーを返す")
    void nullCategory_returnsError() {
        ProductInput input = new ProductInput();
        input.setName("ボールペン");
        input.setCategory(null);
        input.setPrice(120);

        ValidationResult result = validator.validate(input);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().contains("カテゴリは必須です"));
    }
}
