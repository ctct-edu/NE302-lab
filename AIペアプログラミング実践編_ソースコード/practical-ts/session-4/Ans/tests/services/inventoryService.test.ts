import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type InventoryAlertItem, type InventoryItem, TransactionType } from '../../src/models'
import { InventoryService } from '../../src/services/inventoryService'

// モック用の型定義
interface MockInventoryRepository {
  findByProductId: ReturnType<typeof vi.fn>
  save: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  findAlertItems: ReturnType<typeof vi.fn>
}

interface MockTransactionRepository {
  create: ReturnType<typeof vi.fn>
}

interface MockProductRepository {
  findById: ReturnType<typeof vi.fn>
}

describe('InventoryService', () => {
  let service: InventoryService
  let mockInventoryRepo: MockInventoryRepository
  let mockTransactionRepo: MockTransactionRepository
  let mockProductRepo: MockProductRepository

  beforeEach(() => {
    mockInventoryRepo = {
      findByProductId: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      findAlertItems: vi.fn(),
    }
    mockTransactionRepo = {
      create: vi.fn(),
    }
    mockProductRepo = {
      findById: vi.fn(),
    }

    service = new InventoryService(mockInventoryRepo as any, mockTransactionRepo as any, mockProductRepo as any)
  })

  describe('updateStock', () => {
    describe('入庫処理', () => {
      it('入庫で在庫数が加算される', async () => {
        // Arrange
        const existingInventory: InventoryItem = {
          productId: 1,
          quantity: 100,
          threshold: 10,
          updatedAt: new Date(),
        }

        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })
        mockInventoryRepo.findByProductId.mockResolvedValue(existingInventory)
        mockInventoryRepo.update.mockResolvedValue({
          ...existingInventory,
          quantity: 150,
        })
        mockTransactionRepo.create.mockResolvedValue({})

        // Act
        const result = await service.updateStock(1, 50, TransactionType.IN)

        // Assert
        expect(result.quantity).toBe(150)
        expect(mockInventoryRepo.update).toHaveBeenCalledWith(1, { quantity: 150 })
        expect(mockTransactionRepo.create).toHaveBeenCalled()
      })
    })

    describe('出庫処理', () => {
      it('出庫で在庫数が減算される', async () => {
        const existingInventory: InventoryItem = {
          productId: 1,
          quantity: 100,
          threshold: 10,
          updatedAt: new Date(),
        }

        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })
        mockInventoryRepo.findByProductId.mockResolvedValue(existingInventory)
        mockInventoryRepo.update.mockResolvedValue({
          ...existingInventory,
          quantity: 70,
        })
        mockTransactionRepo.create.mockResolvedValue({})

        const result = await service.updateStock(1, 30, TransactionType.OUT)

        expect(result.quantity).toBe(70)
        expect(mockInventoryRepo.update).toHaveBeenCalledWith(1, { quantity: 70 })
      })

      it('全数出庫で在庫が0になる', async () => {
        const existingInventory: InventoryItem = {
          productId: 1,
          quantity: 100,
          threshold: 10,
          updatedAt: new Date(),
        }

        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })
        mockInventoryRepo.findByProductId.mockResolvedValue(existingInventory)
        mockInventoryRepo.update.mockResolvedValue({
          ...existingInventory,
          quantity: 0,
        })
        mockTransactionRepo.create.mockResolvedValue({})

        const result = await service.updateStock(1, 100, TransactionType.OUT)

        expect(result.quantity).toBe(0)
      })
    })

    describe('異常系', () => {
      it('存在しない商品IDの場合、エラーを投げる', async () => {
        mockProductRepo.findById.mockResolvedValue(null)

        await expect(service.updateStock(999, 10, TransactionType.IN)).rejects.toThrow('商品が見つかりません')
      })

      it('在庫不足での出庫はエラーを投げる', async () => {
        const existingInventory: InventoryItem = {
          productId: 1,
          quantity: 50,
          threshold: 10,
          updatedAt: new Date(),
        }

        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })
        mockInventoryRepo.findByProductId.mockResolvedValue(existingInventory)

        await expect(service.updateStock(1, 51, TransactionType.OUT)).rejects.toThrow('在庫が不足しています')
      })

      it('数量が0の場合、エラーを投げる', async () => {
        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })

        await expect(service.updateStock(1, 0, TransactionType.IN)).rejects.toThrow('数量は1以上で指定してください')
      })

      it('数量が負の値の場合、エラーを投げる', async () => {
        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })

        await expect(service.updateStock(1, -5, TransactionType.IN)).rejects.toThrow('数量は1以上で指定してください')
      })
    })

    describe('境界値', () => {
      it('出庫後の在庫が0になるケース（OK）', async () => {
        const existingInventory: InventoryItem = {
          productId: 1,
          quantity: 100,
          threshold: 10,
          updatedAt: new Date(),
        }

        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })
        mockInventoryRepo.findByProductId.mockResolvedValue(existingInventory)
        mockInventoryRepo.update.mockResolvedValue({
          ...existingInventory,
          quantity: 0,
        })
        mockTransactionRepo.create.mockResolvedValue({})

        // 100 - 100 = 0 はOK
        const result = await service.updateStock(1, 100, TransactionType.OUT)
        expect(result.quantity).toBe(0)
      })

      it('出庫後の在庫が-1になるケース（エラー）', async () => {
        const existingInventory: InventoryItem = {
          productId: 1,
          quantity: 100,
          threshold: 10,
          updatedAt: new Date(),
        }

        mockProductRepo.findById.mockResolvedValue({ id: 1, name: 'テスト商品' })
        mockInventoryRepo.findByProductId.mockResolvedValue(existingInventory)

        // 100 - 101 = -1 はエラー
        await expect(service.updateStock(1, 101, TransactionType.OUT)).rejects.toThrow('在庫が不足しています')
      })
    })
  })

  describe('getAlertItems', () => {
    it('閾値以下の在庫がある場合、アラート対象を返す', async () => {
      const alertItems: InventoryAlertItem[] = [
        { productId: 1, productName: 'ノート A5', quantity: 5, threshold: 10 },
        { productId: 3, productName: 'クリアファイル', quantity: 3, threshold: 20 },
      ]

      mockInventoryRepo.findAlertItems.mockResolvedValue(alertItems)

      const result = await service.getAlertItems()

      expect(result).toHaveLength(2)
      expect(result[0].productName).toBe('ノート A5')
      expect(result[0].quantity).toBe(5)
      expect(result[0].threshold).toBe(10)
    })

    it('閾値以下の在庫がない場合、空配列を返す', async () => {
      mockInventoryRepo.findAlertItems.mockResolvedValue([])

      const result = await service.getAlertItems()

      expect(result).toHaveLength(0)
    })
  })
})
