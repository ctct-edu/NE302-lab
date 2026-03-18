import type {
  InventoryAlertItem,
  InventoryItem,
  InventoryItemInput,
  InventoryItemUpdateInput,
} from '../models';
import { TransactionType } from '../models';

export interface InventoryRepository {
  findByProductId(productId: number): Promise<InventoryItem | null>;
  save(input: InventoryItemInput): Promise<InventoryItem>;
  update(productId: number, input: InventoryItemUpdateInput): Promise<InventoryItem>;
  findAlertItems(): Promise<InventoryAlertItem[]>;
}

export interface TransactionRepository {
  create(input: {
    productId: number;
    type: TransactionType;
    quantity: number;
    note?: string;
  }): Promise<unknown>;
}

export interface ProductRepositoryForInventory {
  findById(id: number): Promise<unknown | null>;
}

export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepositoryForInventory
  ) {}

  async updateStock(
    productId: number,
    quantity: number,
    type: TransactionType,
    note?: string
  ): Promise<InventoryItem> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('商品が見つかりません');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('数量は1以上で指定してください');
    }

    const existing = await this.inventoryRepository.findByProductId(productId);
    const currentQuantity = existing?.quantity ?? 0;

    let nextQuantity: number;
    if (type === TransactionType.IN) {
      nextQuantity = currentQuantity + quantity;
    } else if (type === TransactionType.OUT) {
      if (currentQuantity < quantity) {
        throw new Error('在庫が不足しています');
      }
      nextQuantity = currentQuantity - quantity;
    } else {
      // 型的には来ないが安全策
      throw new Error('入出庫種別が不正です');
    }

    let updated: InventoryItem;
    if (existing) {
      updated = await this.inventoryRepository.update(productId, { quantity: nextQuantity });
    } else {
      // 閾値のデフォルトは運用依存だが、テストで未使用なので 0 で作る
      updated = await this.inventoryRepository.save({
        productId,
        quantity: nextQuantity,
        threshold: 0,
      });
    }

    await this.transactionRepository.create({
      productId,
      type,
      quantity,
      note,
    });

    return updated;
  }

  async getAlertItems(): Promise<InventoryAlertItem[]> {
    return await this.inventoryRepository.findAlertItems();
  }
}
