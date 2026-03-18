package com.example.inventory.service;

import com.example.inventory.dto.OrderInput;
import com.example.inventory.entity.Order;
import com.example.inventory.entity.OrderStatus;
import com.example.inventory.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 発注サービス
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository, InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
    }

    /**
     * 発注を作成
     */
    public Order create(OrderInput input) {
        Order order = new Order();
        order.setProductId(input.getProductId());
        order.setQuantity(input.getQuantity());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    /**
     * 発注を発注済みに更新
     */
    public Order order(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("発注が見つかりません"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("発注中の発注のみ発注済みにできます");
        }

        order.setStatus(OrderStatus.ORDERED);
        order.setOrderedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    /**
     * 入荷処理
     */
    public Order receive(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("発注が見つかりません"));

        if (order.getStatus() != OrderStatus.ORDERED) {
            throw new IllegalStateException("発注済みの発注のみ入荷処理できます");
        }

        // 在庫を更新
        inventoryService.updateQuantity(order.getProductId(), "IN", order.getQuantity());

        order.setStatus(OrderStatus.RECEIVED);
        order.setReceivedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    /**
     * 発注をキャンセル
     */
    public Order cancel(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("発注が見つかりません"));

        if (order.getStatus() == OrderStatus.RECEIVED) {
            throw new IllegalStateException("入荷済みの発注はキャンセルできません");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /**
     * 全発注を取得
     */
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    /**
     * ステータスで絞り込んで発注を取得
     */
    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
}
