// API Base URL
const API_BASE = '/api'

// カテゴリ表示名
const CATEGORY_LABELS = {
  STATIONERY: '文房具',
  OFFICE: 'オフィス用品',
  OTHER: 'その他',
}

// DOM要素
const elements = {
  // ナビゲーション
  navLinks: document.querySelectorAll('.nav-link'),
  pages: document.querySelectorAll('.page'),

  // 商品一覧ページ
  searchInput: document.getElementById('searchInput'),
  addProductBtn: document.getElementById('addProductBtn'),
  productTableBody: document.getElementById('productTableBody'),

  // 在庫管理ページ
  productSelect: document.getElementById('productSelect'),
  inventoryInfo: document.getElementById('inventoryInfo'),
  inventoryProductName: document.getElementById('inventoryProductName'),
  currentQuantity: document.getElementById('currentQuantity'),
  threshold: document.getElementById('threshold'),
  inQuantity: document.getElementById('inQuantity'),
  inNote: document.getElementById('inNote'),
  inBtn: document.getElementById('inBtn'),
  outQuantity: document.getElementById('outQuantity'),
  outNote: document.getElementById('outNote'),
  outBtn: document.getElementById('outBtn'),

  // モーダル
  addProductModal: document.getElementById('addProductModal'),
  addProductForm: document.getElementById('addProductForm'),
  cancelBtn: document.getElementById('cancelBtn'),
}

// 現在選択中の商品ID
let selectedProductId = null

// ==============================
// API関数
// ==============================

async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`)
  const data = await response.json()
  return data.products
}

async function searchProducts(query) {
  const response = await fetch(`${API_BASE}/products/search?name=${encodeURIComponent(query)}`)
  const data = await response.json()
  return data.products
}

async function createProduct(input) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '登録に失敗しました')
  }
  return response.json()
}

async function deleteProduct(id) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '削除に失敗しました')
  }
}

async function fetchInventory(productId) {
  const response = await fetch(`${API_BASE}/inventory/${productId}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error('在庫情報の取得に失敗しました')
  }
  const data = await response.json()
  return data.inventory
}

async function stockIn(productId, quantity, note) {
  const response = await fetch(`${API_BASE}/inventory/${productId}/in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, note }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '入庫に失敗しました')
  }
  return response.json()
}

async function stockOut(productId, quantity, note) {
  const response = await fetch(`${API_BASE}/inventory/${productId}/out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, note }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '出庫に失敗しました')
  }
  return response.json()
}

// ==============================
// 表示関数
// ==============================

function renderProducts(products) {
  elements.productTableBody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>${product.id}</td>
          <td>${escapeHtml(product.name)}</td>
          <td><span class="category-badge ${product.category}">${CATEGORY_LABELS[product.category]}</span></td>
          <td>¥${product.price.toLocaleString()}</td>
          <td>${formatDate(product.createdAt)}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteProduct(${product.id})">削除</button>
          </td>
        </tr>
      `,
    )
    .join('')
}

function renderProductSelect(products) {
  elements.productSelect.innerHTML = `
    <option value="">商品を選択...</option>
    ${products.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
  `
}

function renderInventory(inventory, productName) {
  elements.inventoryProductName.textContent = productName
  elements.currentQuantity.textContent = inventory ? inventory.quantity : 0
  elements.threshold.textContent = inventory ? inventory.threshold : 10
  elements.inventoryInfo.style.display = 'block'
}

// ==============================
// イベントハンドラー
// ==============================

async function handleSearch() {
  const query = elements.searchInput.value
  try {
    const products = query ? await searchProducts(query) : await fetchProducts()
    renderProducts(products)
  } catch (error) {
    alert('検索に失敗しました: ' + error.message)
  }
}

async function handleAddProduct(e) {
  e.preventDefault()
  const formData = new FormData(elements.addProductForm)
  const input = {
    name: formData.get('name'),
    category: formData.get('category'),
    price: parseInt(formData.get('price'), 10),
  }

  try {
    await createProduct(input)
    closeModal()
    elements.addProductForm.reset()
    await loadProducts()
    alert('商品を登録しました')
  } catch (error) {
    alert('登録に失敗しました: ' + error.message)
  }
}

async function handleDeleteProduct(id) {
  if (!confirm('この商品を削除しますか？')) {
    return
  }

  try {
    await deleteProduct(id)
    await loadProducts()
    alert('商品を削除しました')
  } catch (error) {
    alert('削除に失敗しました: ' + error.message)
  }
}

async function handleProductSelect() {
  const productId = parseInt(elements.productSelect.value, 10)
  if (!productId) {
    elements.inventoryInfo.style.display = 'none'
    selectedProductId = null
    return
  }

  selectedProductId = productId
  const selectedOption = elements.productSelect.options[elements.productSelect.selectedIndex]
  const productName = selectedOption.textContent

  try {
    const inventory = await fetchInventory(productId)
    renderInventory(inventory, productName)
  } catch (error) {
    alert('在庫情報の取得に失敗しました: ' + error.message)
  }
}

async function handleStockIn() {
  if (!selectedProductId) return

  const quantity = parseInt(elements.inQuantity.value, 10)
  const note = elements.inNote.value

  if (!quantity || quantity <= 0) {
    alert('数量を入力してください')
    return
  }

  try {
    const result = await stockIn(selectedProductId, quantity, note)
    elements.currentQuantity.textContent = result.inventory.quantity
    elements.inQuantity.value = 1
    elements.inNote.value = ''
    alert('入庫が完了しました')
  } catch (error) {
    alert('入庫に失敗しました: ' + error.message)
  }
}

async function handleStockOut() {
  if (!selectedProductId) return

  const quantity = parseInt(elements.outQuantity.value, 10)
  const note = elements.outNote.value

  if (!quantity || quantity <= 0) {
    alert('数量を入力してください')
    return
  }

  try {
    const result = await stockOut(selectedProductId, quantity, note)
    elements.currentQuantity.textContent = result.inventory.quantity
    elements.outQuantity.value = 1
    elements.outNote.value = ''
    alert('出庫が完了しました')
  } catch (error) {
    alert('出庫に失敗しました: ' + error.message)
  }
}

function switchPage(pageName) {
  elements.navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.page === pageName)
  })
  elements.pages.forEach((page) => {
    page.classList.toggle('active', page.id === `${pageName}-page`)
  })
}

function openModal() {
  elements.addProductModal.classList.add('active')
}

function closeModal() {
  elements.addProductModal.classList.remove('active')
}

// ==============================
// ユーティリティ関数
// ==============================

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP')
}

// ==============================
// 初期化
// ==============================

async function loadProducts() {
  try {
    const products = await fetchProducts()
    renderProducts(products)
    renderProductSelect(products)
  } catch (error) {
    alert('商品の取得に失敗しました: ' + error.message)
  }
}

function init() {
  // ナビゲーション
  elements.navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      switchPage(link.dataset.page)
    })
  })

  // 検索
  let searchTimeout
  elements.searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(handleSearch, 300)
  })

  // 商品追加
  elements.addProductBtn.addEventListener('click', openModal)
  elements.cancelBtn.addEventListener('click', closeModal)
  elements.addProductForm.addEventListener('submit', handleAddProduct)

  // モーダル外クリックで閉じる
  elements.addProductModal.addEventListener('click', (e) => {
    if (e.target === elements.addProductModal) {
      closeModal()
    }
  })

  // 在庫管理
  elements.productSelect.addEventListener('change', handleProductSelect)
  elements.inBtn.addEventListener('click', handleStockIn)
  elements.outBtn.addEventListener('click', handleStockOut)

  // 初期データ読み込み
  loadProducts()
}

// グローバルに公開（onclick用）
window.handleDeleteProduct = handleDeleteProduct

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', init)
