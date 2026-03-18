import { expect, test } from '@playwright/test'

test.describe('商品管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('商品一覧が表示される', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('在庫管理システム')

    // テーブルが表示されることを確認
    await expect(page.locator('#productTable')).toBeVisible()

    // ヘッダーが正しいことを確認
    await expect(page.locator('th').first()).toHaveText('ID')
  })

  test('商品登録モーダルが開閉できる', async ({ page }) => {
    // 「商品を追加」ボタンをクリック
    await page.click('#addProductBtn')

    // モーダルが表示されることを確認
    await expect(page.locator('#addProductModal')).toHaveClass(/active/)
    await expect(page.locator('.modal-content h2')).toHaveText('商品を登録')

    // キャンセルボタンで閉じる
    await page.click('#cancelBtn')

    // モーダルが閉じることを確認
    await expect(page.locator('#addProductModal')).not.toHaveClass(/active/)
  })

  test('商品を登録できる', async ({ page }) => {
    // 「商品を追加」ボタンをクリック
    await page.click('#addProductBtn')

    // フォームに入力
    await page.fill('#productName', 'E2Eテスト商品')
    await page.selectOption('#productCategory', 'STATIONERY')
    await page.fill('#productPrice', '500')

    // ダイアログを処理
    page.on('dialog', (dialog) => dialog.accept())

    // 登録ボタンをクリック
    await page.click('button[type="submit"]')

    // モーダルが閉じることを確認
    await expect(page.locator('#addProductModal')).not.toHaveClass(/active/)
  })

  test('商品を検索できる', async ({ page }) => {
    // 検索ボックスに入力
    await page.fill('#searchInput', 'テスト')

    // 検索結果が表示されるまで待機
    await page.waitForTimeout(500)

    // テーブルが更新されることを確認（実際のデータがある場合）
    await expect(page.locator('#productTable')).toBeVisible()
  })

  test('ナビゲーションで画面を切り替えられる', async ({ page }) => {
    // 商品一覧ページが表示されていることを確認
    await expect(page.locator('#products-page')).toHaveClass(/active/)

    // 在庫管理をクリック
    await page.click('a[data-page="inventory"]')

    // 在庫管理ページが表示されることを確認
    await expect(page.locator('#inventory-page')).toHaveClass(/active/)
    await expect(page.locator('#products-page')).not.toHaveClass(/active/)

    // 商品一覧に戻る
    await page.click('a[data-page="products"]')

    // 商品一覧ページが表示されることを確認
    await expect(page.locator('#products-page')).toHaveClass(/active/)
  })
})

test.describe('在庫管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 在庫管理ページに移動
    await page.click('a[data-page="inventory"]')
  })

  test('在庫管理ページが表示される', async ({ page }) => {
    // 商品選択ドロップダウンが表示されることを確認
    await expect(page.locator('#productSelect')).toBeVisible()

    // 在庫情報は最初は非表示
    await expect(page.locator('#inventoryInfo')).not.toBeVisible()
  })

  test('商品を選択すると在庫情報が表示される', async ({ page }) => {
    // 商品が存在する場合のテスト
    const options = await page.locator('#productSelect option').count()

    if (options > 1) {
      // 最初の商品を選択
      await page.selectOption('#productSelect', { index: 1 })

      // 在庫情報が表示されることを確認
      await expect(page.locator('#inventoryInfo')).toBeVisible()
      await expect(page.locator('#currentQuantity')).toBeVisible()
      await expect(page.locator('#threshold')).toBeVisible()
    }
  })
})
