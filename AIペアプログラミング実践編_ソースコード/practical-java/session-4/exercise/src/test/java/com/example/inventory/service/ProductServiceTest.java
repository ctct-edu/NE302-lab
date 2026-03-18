package com.example.inventory.service;

import com.example.inventory.dto.ProductInput;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.ProductCategory;
import com.example.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock
    private ProductRepository mockRepository;

    private ProductService service;

    @BeforeEach
    void setUp() {
        service = new ProductService(mockRepository);
    }

    @Test
    @DisplayName("商品を登録できる")
    void create_success() {
        // Arrange: モックの戻り値を設定
        Product savedProduct = new Product();
        savedProduct.setId(1L);
        savedProduct.setName("ボールペン");
        savedProduct.setCategory(ProductCategory.STATIONERY);
        savedProduct.setPrice(120);
        savedProduct.setCreatedAt(LocalDateTime.now());
        savedProduct.setUpdatedAt(LocalDateTime.now());

        when(mockRepository.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        ProductInput input = new ProductInput();
        input.setName("ボールペン");
        input.setCategory(ProductCategory.STATIONERY);
        input.setPrice(120);

        Product product = service.create(input);

        // Assert
        assertEquals(1L, product.getId());
        assertEquals("ボールペン", product.getName());
        verify(mockRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("バリデーションエラーの場合、例外を投げる")
    void create_validationError_throwsException() {
        // Arrange
        ProductInput invalidInput = new ProductInput();
        invalidInput.setName(""); // 空の商品名
        invalidInput.setCategory(ProductCategory.STATIONERY);
        invalidInput.setPrice(120);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            service.create(invalidInput);
        });
        verify(mockRepository, never()).save(any());
    }
}
