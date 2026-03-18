package com.example.inventory.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * バリデーション結果
 */
public class ValidationResult {
    private boolean valid;
    private List<String> errors;

    public ValidationResult() {
        this.valid = true;
        this.errors = new ArrayList<>();
    }

    public static ValidationResult success() {
        return new ValidationResult();
    }

    public static ValidationResult failure(List<String> errors) {
        ValidationResult result = new ValidationResult();
        result.valid = false;
        result.errors = errors;
        return result;
    }

    public void addError(String error) {
        this.valid = false;
        this.errors.add(error);
    }

    public boolean isValid() {
        return valid;
    }

    public List<String> getErrors() {
        return errors;
    }
}
