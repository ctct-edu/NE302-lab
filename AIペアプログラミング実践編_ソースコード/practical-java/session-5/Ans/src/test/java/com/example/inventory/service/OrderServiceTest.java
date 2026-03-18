package com.example.inventory.service;

import com.example.inventory.dto.OrderInput;
import com.example.inventory.entity.Order;
import com.example.inventory.entity.OrderStatus;
import com.example.inventory.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private InventoryService inventoryService;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, inventoryService);
    }

    @Test
    @DisplayName("発注を作成できる")
    void create_createsOrder() {
        // Arrange
        OrderInput input = new OrderInput(1L, 10);
        Order savedOrder = new Order();
        savedOrder.setId(1L);
        savedOrder.setProductId(1L);
        savedOrder.setQuantity(10);
        savedOrder.setStatus(OrderStatus.PENDING);
        savedOrder.setCreatedAt(LocalDateTime.now());

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        // Act
        Order order = orderService.create(input);

        // Assert
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(1L, order.getProductId());
        assertEquals(10, order.getQuantity());
    }

    @Test
    @DisplayName("発注を発注済みに更新できる")
    void order_updatesStatusToOrdered() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setProductId(1L);
        order.setQuantity(10);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.order(1L);

        // Assert
        assertEquals(OrderStatus.ORDERED, result.getStatus());
        assertNotNull(result.getOrderedAt());
    }

    @Test
    @DisplayName("PENDING 以外の発注は発注済みにできない")
    void order_throwsException_whenStatusIsNotPending() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setStatus(OrderStatus.ORDERED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> orderService.order(1L)
        );
        assertEquals("発注中の発注のみ発注済みにできます", exception.getMessage());
    }

    @Test
    @DisplayName("入荷処理で在庫が増える")
    void receive_updatesInventory() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setProductId(1L);
        order.setQuantity(10);
        order.setStatus(OrderStatus.ORDERED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.receive(1L);

        // Assert
        assertEquals(OrderStatus.RECEIVED, result.getStatus());
        assertNotNull(result.getReceivedAt());
        verify(inventoryService).updateQuantity(1L, "IN", 10);
    }

    @Test
    @DisplayName("ORDERED 以外の発注は入荷処理できない")
    void receive_throwsException_whenStatusIsNotOrdered() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> orderService.receive(1L)
        );
        assertEquals("発注済みの発注のみ入荷処理できます", exception.getMessage());
    }

    @Test
    @DisplayName("発注をキャンセルできる")
    void cancel_cancelsPendingOrder() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Order result = orderService.cancel(1L);

        // Assert
        assertEquals(OrderStatus.CANCELLED, result.getStatus());
    }

    @Test
    @DisplayName("入荷済みの発注はキャンセルできない")
    void cancel_throwsException_whenStatusIsReceived() {
        // Arrange
        Order order = new Order();
        order.setId(1L);
        order.setStatus(OrderStatus.RECEIVED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> orderService.cancel(1L)
        );
        assertEquals("入荷済みの発注はキャンセルできません", exception.getMessage());
    }
}
