# Session 4: 機能実装とリファクタリング

## 前提

- Session 3 でテストコードが完成していること
- `start/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                                                 |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| チャット       | 実装方針の相談、コードレビュー         | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L`                              |
| インライン補完 | 実装コードの入力                       | Tab で受け入れ、Esc で拒否                                                           |

> **Chat で生成されたコードの扱い方**：Chat が提案するコードはそのままコピーするのではなく、内容を理解した上で自分のコードに取り込みましょう。必要に応じて修正を加えることも重要です。

---

## start フォルダの内容

`start/` フォルダには、Session 3 までの完成物が含まれています：

| ファイル/フォルダ         | 内容                                  |
| ------------------------- | ------------------------------------- |
| `docs/*.md`               | 要件定義書・設計書                    |
| `src/models/*.ts`         | 型定義ファイル                        |
| `src/services/*.ts`       | Service 層のスタブ（Session 3 作成）  |
| `tests/services/*.test.ts`| テストファイル（Session 3 で作成）    |
| `package.json`            | プロジェクト設定（Express 設定済み）  |

---

## 演習 1: 商品登録機能の実装（25 分）

この演習では、Session 3 で作成したテストを通すように実装を進めます。

### ステップ 1: Service 層を実装する

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品登録機能を実装してください。

【仕様】
・ProductInput を受け取る
・バリデーションを行う
・Repository を通じて DB に保存
・保存した Product を返す

【既存のテスト】
@productService.test.ts

このテストが通るように実装してください。
```

期待される実装：

```typescript
// src/services/productService.ts
import { Product, ProductInput } from '../models/product';
import { validateProductInput } from './validation';

interface ProductRepository {
  save(input: ProductInput): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findAll(): Promise<Product[]>;
}

export class ProductService {
  constructor(private repository: ProductRepository) {}

  async create(input: ProductInput): Promise<Product> {
    // バリデーション
    const validation = validateProductInput(input);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]);
    }

    // 保存
    return this.repository.save(input);
  }

  async findById(id: number): Promise<Product | null> {
    return this.repository.findById(id);
  }

  async findAll(): Promise<Product[]> {
    return this.repository.findAll();
  }
}
```

- **依存性注入（DI）**: Repository をコンストラクタで受け取る設計
- テスト時はモックを注入し、本番時は実際の Repository を注入する

### ステップ 2: Repository 層を実装する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
ProductRepository を実装してください。

【メソッド】
・save(product: ProductInput): Promise<Product>
・findById(id: number): Promise<Product | null>
・findAll(): Promise<Product[]>
```

期待される実装：

```typescript
// src/repositories/productRepository.ts
import { Product, ProductInput } from '../models/product';

export class ProductRepository {
  private products: Product[] = [];
  private nextId = 1;

  async save(input: ProductInput): Promise<Product> {
    const product: Product = {
      id: this.nextId++,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);
    return product;
  }

  async findById(id: number): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null;
  }

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }
}
```

この実装はメモリ上にデータを保持する簡易版です。本番環境では MySQL などのデータベースに接続します。

### ステップ 3: テストを実行する（Green）

```sh
npm test
```

すべてのテストが通ることを確認します。

---

## 演習 2: 商品検索機能の実装（20 分）

この演習では、AI をナビゲーターとして活用します。

### ステップ 1: 検索仕様を決める

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品検索機能を作ります。
以下の検索条件で検索できるようにしたいです。

・商品名（部分一致）
・カテゴリ（完全一致）
・価格帯（min〜max）

この検索機能の設計について相談させてください。
クエリパラメータの形式はどうすべきですか？
```

期待される AI の回答例：

```
クエリパラメータの形式は以下のようにするのが一般的です：

GET /api/products/search?name=ボール&category=STATIONERY&minPrice=100&maxPrice=500

【パラメータ】
- name: 部分一致検索（省略可）
- category: 完全一致（省略可）
- minPrice: 最低価格（省略可、デフォルト 0）
- maxPrice: 最高価格（省略可、デフォルト制限なし）
```

### ステップ 2: 検索機能を実装する

使用する AI 機能: **インライン補完**

AI の提案を参考に、自分で実装を進めます。

期待される実装（Service 層）：

```typescript
// src/services/productService.ts に追加
interface SearchParams {
  name?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
}

async search(params: SearchParams): Promise<Product[]> {
  const products = await this.repository.findAll();

  return products.filter(product => {
    // 商品名（部分一致）
    if (params.name && !product.name.includes(params.name)) {
      return false;
    }
    // カテゴリ（完全一致）
    if (params.category && product.category !== params.category) {
      return false;
    }
    // 価格帯
    if (params.minPrice !== undefined && product.price < params.minPrice) {
      return false;
    }
    if (params.maxPrice !== undefined && product.price > params.maxPrice) {
      return false;
    }
    return true;
  });
}
```

### ステップ 3: テストを追加して確認する

使用する AI 機能: **インライン補完**

検索機能のテストを追加し、動作を確認します。

```typescript
describe('search', () => {
  it('商品名で部分一致検索できる', async () => {
    // テストデータを準備
    mockRepository.findAll.mockResolvedValue([
      { id: 1, name: 'ボールペン', category: 'STATIONERY', price: 120 },
      { id: 2, name: '消しゴム', category: 'STATIONERY', price: 80 },
    ]);

    const result = await service.search({ name: 'ボール' });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('ボールペン');
  });
});
```

---

## 演習 3: API エンドポイントの実装（20 分）

この演習では、Express を使って REST API を実装します。

### ステップ 1: Express ルートを作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品の REST API を実装してください。

【エンドポイント】
・POST /api/products - 商品登録
・GET /api/products - 商品一覧
・GET /api/products/:id - 商品詳細
・GET /api/products/search - 商品検索
```

期待される実装：

```typescript
// src/routes/productRoutes.ts
import express from 'express';
import { ProductService } from '../services/productService';
import { ProductRepository } from '../repositories/productRepository';

const router = express.Router();
const repository = new ProductRepository();
const service = new ProductService(repository);

// 商品登録
router.post('/', async (req, res) => {
  try {
    const product = await service.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 商品一覧
router.get('/', async (req, res) => {
  const products = await service.findAll();
  res.json(products);
});

// 商品詳細
router.get('/:id', async (req, res) => {
  const product = await service.findById(Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(product);
});

// 商品検索
router.get('/search', async (req, res) => {
  const products = await service.search({
    name: req.query.name as string,
    category: req.query.category as any,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
  });
  res.json(products);
});

export default router;
```

- **req.body**: POST リクエストのボディ
- **req.params**: URL パラメータ（`:id` など）
- **req.query**: クエリパラメータ（`?name=xxx` など）

### ステップ 2: 動作確認する

サーバーを起動します。

```sh
npm run dev
```

別のターミナルで curl コマンドを実行して動作確認します。

```sh
# 商品登録
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "ボールペン", "category": "STATIONERY", "price": 120}'

# 商品一覧
curl http://localhost:3000/api/products

# 商品検索
curl "http://localhost:3000/api/products/search?name=ボール"
```

### ステップ 3: エラーケースを確認する

バリデーションエラーが正しく返ることを確認します。

```sh
# 空の商品名でエラー
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "", "category": "STATIONERY", "price": 120}'
```

期待されるレスポンス：

```json
{ "error": "商品名は必須です" }
```

---

## 演習 4: フロントエンド UI の生成（30 分）

この演習では、AI に商品一覧・登録画面を生成させます。

### ステップ 1: 画面仕様を AI に伝える

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫管理システムのフロントエンド画面を作成してください。

【技術スタック】
・HTML / CSS / JavaScript（UI ライブラリは使用しない）
・fetch API で API サーバーと通信

【画面構成】
・ヘッダー：システム名、ナビゲーション
・メイン：商品一覧テーブル
・フッター：コピーライト

【機能】
・商品一覧の表示（テーブル形式）
・商品登録フォーム（モーダル）
・検索ボックス

【API エンドポイント】
・GET /api/products（商品一覧取得）
・POST /api/products（商品登録）
・GET /api/products/search?q=xxx（商品検索）
```

### ステップ 2: 生成されたコードを配置する

使用する AI 機能: **インライン補完**

AI が生成した HTML / CSS / JavaScript を `public/` フォルダに配置します。

```
public/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

### ステップ 3: 動作確認する

サーバーを起動してブラウザで確認します。

```sh
npm run dev
```

ブラウザで `http://localhost:3000` を開き、以下を確認します：

- 商品一覧が表示される
- 商品登録フォームが動作する
- 検索ボックスで絞り込める

---

## 演習 5: Playwright テストの作成（15 分）

この演習では、AI に E2E テストを生成させます。

### ステップ 1: テストケースを AI に依頼する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の画面操作に対する Playwright の E2E テストを作成してください。

【画面】
商品一覧画面

【テストケース】
1. 初期表示で商品一覧テーブルが表示される
2. 「商品を追加」ボタンで登録モーダルが開く
3. 商品を登録すると一覧に追加される
```

### ステップ 2: テストを実行する

```sh
npm run test:e2e
```

テストが通ることを確認します。

- Playwright はヘッドレスブラウザで実際の画面操作をシミュレートする
- `npm run test:e2e:ui` で UI モードを起動すると、テスト実行を視覚的に確認できる

---

## 演習 6: リファクタリング（10 分）

この演習では、AI にコードレビューを依頼し、指摘事項を修正します。

### ステップ 1: AI にコードレビューを依頼する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
@productService.ts @productRepository.ts

このコードをレビューしてください。
特に以下の観点で確認してください。

・重複コードがないか
・命名は適切か
・エラーハンドリングは十分か
```

### ステップ 2: 指摘事項を修正する

AI の提案を確認し、必要な修正を行います。

### ステップ 3: テストが通ることを確認する

```sh
npm test
```

リファクタリング後もテストが通ることを確認します。テストがあるので、動作が壊れていないことを確認できます。

完成したら、`goal/` フォルダの完成例と見比べて確認してください。
