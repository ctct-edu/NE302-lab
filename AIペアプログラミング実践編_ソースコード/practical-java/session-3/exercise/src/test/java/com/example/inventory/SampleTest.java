package com.example.inventory;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * サンプルテスト
 * テスト環境が正しく動作することを確認するためのテストです。
 */
class SampleTest {

    @Test
    @DisplayName("1 + 1 は 2 になる")
    void onePlusOneEqualsTwo() {
        assertEquals(2, 1 + 1);
    }

    @Test
    @DisplayName("文字列の連結が正しく動作する")
    void stringConcatenation() {
        String result = "Hello" + " " + "World";
        assertEquals("Hello World", result);
    }
}
