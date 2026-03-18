import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Product, ProductCategory, type ProductInput } from '../../src/models'
import { ProductService } from '../../src/services/productService'

// モック用の型定義
interface MockProductRepository {
  findAll: ReturnType<typeof vi.fn>
  findById: ReturnType<typeof vi.fn>
  save: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  search: ReturnType<typeof vi.fn>
}

describe('ProductService', () => {
  let service: ProductService
  let mockRepository: MockProductRepository

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    }
    service = new ProductService(mockRepository as any)
  })

  describe('create', () => {
    it('有効な入力で商品を登録できる', async () => {
      // Arrange
      const input: ProductInput = {
        name: 'ボールペン',
        category: ProductCategory.STATIONERY,
        price: 120,
      }

      const savedProduct: Product = {
        id: 1,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRepository.save.mockResolvedValue(savedProduct)

      // Act
      const result = await service.create(input)

      // Assert
      expect(result.id).toBe(1)
      expect(result.name).toBe('ボールペン')
      expect(result.price).toBe(120)
      expect(mockRepository.save).toHaveBeenCalledWith(input)
    })

    it('商品名が空の場合、エラーを投げる', async () => {
      const input: ProductInput = {
        name: '',
        category: ProductCategory.STATIONERY,
        price: 100,
      }

      await expect(service.create(input)).rejects.toThrow('商品名は必須です')
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('価格が負の場合、エラーを投げる', async () => {
      const input: ProductInput = {
        name: 'テスト商品',
        category: ProductCategory.STATIONERY,
        price: -1,
      }

      await expect(service.create(input)).rejects.toThrow('価格は0以上にしてください')
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('全商品を取得できる', async () => {
      // Arrange
      const products: Product[] = [
        {
          id: 1,
          name: 'ボールペン',
          category: ProductCategory.STATIONERY,
          price: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'クリアファイル',
          category: ProductCategory.OFFICE,
          price: 80,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockRepository.findAll.mockResolvedValue(products)

      // Act
      const result = await service.findAll()

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('ボールペン')
      expect(result[1].name).toBe('クリアファイル')
    })

    it('商品がない場合、空配列を返す', async () => {
      mockRepository.findAll.mockResolvedValue([])

      const result = await service.findAll()

      expect(result).toHaveLength(0)
    })
  })

  describe('findById', () => {
    it('指定したIDの商品を取得できる', async () => {
      const product: Product = {
        id: 1,
        name: 'ボールペン',
        category: ProductCategory.STATIONERY,
        price: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRepository.findById.mockResolvedValue(product)

      const result = await service.findById(1)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(1)
      expect(result?.name).toBe('ボールペン')
      expect(mockRepository.findById).toHaveBeenCalledWith(1)
    })

    it('存在しないIDの場合、nullを返す', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.findById(999)

      expect(result).toBeNull()
    })
  })

  describe('search', () => {
    it('商品名で検索できる', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'ボールペン（黒）',
          category: ProductCategory.STATIONERY,
          price: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'ボールペン（赤）',
          category: ProductCategory.STATIONERY,
          price: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockRepository.search.mockResolvedValue(products)

      const result = await service.search('ボールペン')

      expect(result).toHaveLength(2)
      expect(mockRepository.search).toHaveBeenCalledWith('ボールペン')
    })

    it('該当商品がない場合、空配列を返す', async () => {
      mockRepository.search.mockResolvedValue([])

      const result = await service.search('存在しない商品')

      expect(result).toHaveLength(0)
    })

    it('空文字で検索した場合、全件を返す', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'ボールペン',
          category: ProductCategory.STATIONERY,
          price: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockRepository.findAll.mockResolvedValue(products)

      const result = await service.search('')

      expect(mockRepository.findAll).toHaveBeenCalled()
    })
  })
})
