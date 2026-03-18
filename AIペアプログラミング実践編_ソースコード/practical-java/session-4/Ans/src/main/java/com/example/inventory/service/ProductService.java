package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.dto.ValidationResult;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.ProductCategory;
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

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("商品が見つかりません: " + id);
        }
        productRepository.deleteById(id);
    }

    public List<Product> search(String name, ProductCategory category,
                               Integer minPrice, Integer maxPrice) {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .filter(product -> {
                    // 商品名（部分一致）
                    if (name != null && !product.getName().contains(name)) {
                        return false;
                    }
                    // カテゴリ（完全一致）
                    if (category != null && product.getCategory() != category) {
                        return false;
                    }
                    // 価格帯
                    if (minPrice != null && product.getPrice() < minPrice) {
                        return false;
                    }
                    if (maxPrice != null && product.getPrice() > maxPrice) {
                        return false;
                    }
                    return true;
                })
                .toList();
    }
}
