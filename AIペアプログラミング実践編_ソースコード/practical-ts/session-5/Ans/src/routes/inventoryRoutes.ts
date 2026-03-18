import { type Request, type Response, Router } from 'express';
import { TransactionType } from '../models';
import { InventoryRepository } from '../repositories/inventoryRepository';
import { ProductRepository } from '../repositories/productRepository';
import { TransactionRepository } from '../repositories/transactionRepository';
import { InventoryService } from '../services/inventoryService';

const router = Router();
const inventoryRepository = new InventoryRepository();
const transactionRepository = new TransactionRepository();
const productRepository = new ProductRepository();
const inventoryService = new InventoryService(
  inventoryRepository,
  transactionRepository,
  productRepository
);

/**
 * 在庫情報取得
 * GET /api/inventory/:productId
 */
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: '商品IDが不正です' });
    }

    const inventory = await inventoryService.findByProductId(productId);
    if (!inventory) {
      return res.status(404).json({ error: '在庫情報が見つかりません' });
    }

    res.json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

/**
 * 入庫処理
 * POST /api/inventory/:productId/in
 */
router.post('/:productId/in', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: '商品IDが不正です' });
    }

    const { quantity, note } = req.body;
    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ error: '数量は必須です' });
    }

    const inventory = await inventoryService.updateStock(
      productId,
      quantity,
      TransactionType.IN,
      note
    );

    res.json({ inventory });
  } catch (error) {
    console.error('Error processing stock in:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
});

/**
 * 出庫処理
 * POST /api/inventory/:productId/out
 */
router.post('/:productId/out', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: '商品IDが不正です' });
    }

    const { quantity, note } = req.body;
    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ error: '数量は必須です' });
    }

    const inventory = await inventoryService.updateStock(
      productId,
      quantity,
      TransactionType.OUT,
      note
    );

    res.json({ inventory });
  } catch (error) {
    console.error('Error processing stock out:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
});

/**
 * 閾値更新
 * PUT /api/inventory/:productId/threshold
 */
router.put('/:productId/threshold', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: '商品IDが不正です' });
    }

    const { threshold } = req.body;
    if (threshold === undefined || typeof threshold !== 'number') {
      return res.status(400).json({ error: '閾値は必須です' });
    }

    const inventory = await inventoryService.updateThreshold(productId, threshold);

    res.json({ inventory });
  } catch (error) {
    console.error('Error updating threshold:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
});

export default router;
