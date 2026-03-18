package com.example.inventory.controller;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.ProductCategory;
import com.example.inventory.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 商品 REST API コントローラー
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * 商品登録
     */
    @PostMapping
    public ResponseEntity<Map<String, Product>> create(@RequestBody ProductInput input) {
        Product product = productService.create(input);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("product", product));
    }

    /**
     * 商品一覧
     */
    @GetMapping
    public Map<String, List<Product>> findAll() {
        return Map.of("products", productService.findAll());
    }

    /**
     * 商品詳細
     */
    @GetMapping("/{id}")
    public Map<String, Product> findById(@PathVariable Long id) {
        return Map.of("product", productService.findById(id));
    }

    /**
     * 商品検索
     */
    @GetMapping("/search")
    public Map<String, List<Product>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice) {
        return Map.of("products", productService.search(name, category, minPrice, maxPrice));
    }

    /**
     * 商品削除
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * バリデーションエラーのハンドリング
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    /**
     * エラーレスポンス
     */
    record ErrorResponse(String error) {}
}
