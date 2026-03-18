package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.dto.ValidationResult;
import com.example.inventory.entity.Product;
import com.example.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品サービス
 */
@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductValidator productValidator;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
        this.productValidator = new ProductValidator();
    }

    // テスト用コンストラクタ
    public ProductService(ProductRepository productRepository, ProductValidator productValidator) {
        this.productRepository = productRepository;
        this.productValidator = productValidator;
    }

    public Product create(ProductInput input) {
        // バリデーション
        ValidationResult validation = productValidator.validate(input);
        if (!validation.isValid()) {
            throw new IllegalArgumentException(String.join(", ", validation.getErrors()));
        }

        // エンティティの作成
        Product product = new Product();
        product.setName(input.getName());
        product.setCategory(input.getCategory());
        product.setPrice(input.getPrice());

        return productRepository.save(product);
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("商品が見つかりません: " + id));
    }

    public List<Product> search(String name) {
        return productRepository.findByNameContaining(name);
    }
}
