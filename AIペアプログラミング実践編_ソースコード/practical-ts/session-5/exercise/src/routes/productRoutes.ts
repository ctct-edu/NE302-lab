import { type Request, type Response, Router } from 'express'
import type { ProductInput, ProductUpdateInput } from '../models'
import { ProductRepository } from '../repositories/productRepository'
import { ProductService } from '../services/productService'

const router = Router()
const productRepository = new ProductRepository()
const productService = new ProductService(productRepository)

/**
 * 商品一覧取得
 * GET /api/products
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await productService.findAll()
    res.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

/**
 * 商品検索
 * GET /api/products/search?name=xxx
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.name as string) || ''
    const products = await productService.search(query)
    res.json({ products })
  } catch (error) {
    console.error('Error searching products:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

/**
 * 商品詳細取得
 * GET /api/products/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'IDが不正です' })
    }

    const product = await productService.findById(id)
    if (!product) {
      return res.status(404).json({ error: '商品が見つかりません' })
    }

    res.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'サーバーエラーが発生しました' })
  }
})

/**
 * 商品登録
 * POST /api/products
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const input: ProductInput = req.body
    const product = await productService.create(input)
    res.status(201).json({ product })
  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' })
    }
  }
})

/**
 * 商品更新
 * PUT /api/products/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'IDが不正です' })
    }

    const input: ProductUpdateInput = req.body
    const product = await productService.update(id, input)
    res.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    if (error instanceof Error) {
      if (error.message === '商品が見つかりません') {
        return res.status(404).json({ error: error.message })
      }
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' })
    }
  }
})

/**
 * 商品削除
 * DELETE /api/products/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'IDが不正です' })
    }

    await productService.delete(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting product:', error)
    if (error instanceof Error) {
      if (error.message === '商品が見つかりません') {
        return res.status(404).json({ error: error.message })
      }
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' })
    }
  }
})

export default router
