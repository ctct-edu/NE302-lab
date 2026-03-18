package com.example.inventory.service;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.TransactionType;
import com.example.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
    @Mock
    private InventoryRepository mockRepository;

    private InventoryService service;

    @BeforeEach
    void setUp() {
        service = new InventoryService(mockRepository);
    }

    @Test
    @DisplayName("入庫で在庫数が増える")
    void updateQuantity_in_increasesQuantity() {
        // Arrange
        Inventory inventory = new Inventory();
        inventory.setProductId(1L);
        inventory.setQuantity(10);
        inventory.setThreshold(5);

        when(mockRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(mockRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Inventory result = service.updateQuantity(1L, TransactionType.IN, 5);

        // Assert
        assertEquals(15, result.getQuantity());
    }

    @Test
    @DisplayName("出庫で在庫数が減る")
    void updateQuantity_out_decreasesQuantity() {
        // Arrange
        Inventory inventory = new Inventory();
        inventory.setProductId(1L);
        inventory.setQuantity(10);
        inventory.setThreshold(5);

        when(mockRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(mockRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Inventory result = service.updateQuantity(1L, TransactionType.OUT, 5);

        // Assert
        assertEquals(5, result.getQuantity());
    }

    @Test
    @DisplayName("出庫で在庫がマイナスになる場合、例外を投げる")
    void updateQuantity_out_insufficientStock_throwsException() {
        // Arrange
        Inventory inventory = new Inventory();
        inventory.setProductId(1L);
        inventory.setQuantity(5);
        inventory.setThreshold(5);

        when(mockRepository.findById(1L)).thenReturn(Optional.of(inventory));

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            service.updateQuantity(1L, TransactionType.OUT, 6);
        });
        assertEquals("在庫が不足しています", exception.getMessage());
    }

    @Test
    @DisplayName("存在しない商品IDの場合、例外を投げる")
    void updateQuantity_productNotFound_throwsException() {
        // Arrange
        when(mockRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            service.updateQuantity(999L, TransactionType.IN, 5);
        });
    }

    @Test
    @DisplayName("数量が0以下の場合、例外を投げる")
    void updateQuantity_zeroQuantity_throwsException() {
        // Arrange
        Inventory inventory = new Inventory();
        inventory.setProductId(1L);
        inventory.setQuantity(10);

        when(mockRepository.findById(1L)).thenReturn(Optional.of(inventory));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            service.updateQuantity(1L, TransactionType.IN, 0);
        });
    }
}
