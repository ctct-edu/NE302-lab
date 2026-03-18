package com.example.inventory.controller;

import com.example.inventory.dto.OrderInput;
import com.example.inventory.entity.Order;
import com.example.inventory.entity.OrderStatus;
import com.example.inventory.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 発注 API コントローラー
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * 発注を作成
     */
    @PostMapping
    public ResponseEntity<Order> create(@RequestBody OrderInput input) {
        Order order = orderService.create(input);
        return ResponseEntity.ok(order);
    }

    /**
     * 発注一覧を取得
     */
    @GetMapping
    public List<Order> findAll(@RequestParam(required = false) OrderStatus status) {
        if (status != null) {
            return orderService.findByStatus(status);
        }
        return orderService.findAll();
    }

    /**
     * 発注を発注済みに更新
     */
    @PostMapping("/{id}/order")
    public ResponseEntity<Order> order(@PathVariable Long id) {
        Order order = orderService.order(id);
        return ResponseEntity.ok(order);
    }

    /**
     * 入荷処理
     */
    @PostMapping("/{id}/receive")
    public ResponseEntity<Order> receive(@PathVariable Long id) {
        Order order = orderService.receive(id);
        return ResponseEntity.ok(order);
    }

    /**
     * 発注をキャンセル
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Order> cancel(@PathVariable Long id) {
        Order order = orderService.cancel(id);
        return ResponseEntity.ok(order);
    }
}
