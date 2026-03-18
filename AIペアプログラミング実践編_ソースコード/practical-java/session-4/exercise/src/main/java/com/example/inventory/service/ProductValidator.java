package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.dto.ValidationResult;
import org.springframework.stereotype.Component;

/**
 * 商品バリデーター
 */
@Component
public class ProductValidator {

    public ValidationResult validate(ProductInput input) {
        ValidationResult result = new ValidationResult();

        // 商品名のバリデーション
        if (input.getName() == null || input.getName().isEmpty()) {
            result.addError("商品名は必須です");
        } else if (input.getName().length() > 100) {
            result.addError("商品名は100文字以内で入力してください");
        }

        // カテゴリのバリデーション
        if (input.getCategory() == null) {
            result.addError("カテゴリは必須です");
        }

        // 価格のバリデーション
        if (input.getPrice() == null) {
            result.addError("価格は必須です");
        } else if (input.getPrice() < 0) {
            result.addError("価格は0以上で入力してください");
        }

        return result;
    }
}
