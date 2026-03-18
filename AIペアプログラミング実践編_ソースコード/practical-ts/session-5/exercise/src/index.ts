import express from 'express'
import path from 'path'
import inventoryRoutes from './routes/inventoryRoutes'
import productRoutes from './routes/productRoutes'
import { testConnection } from './utils/database'

const app = express()
const PORT = process.env.PORT || 3000

// ミドルウェア
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静的ファイル配信
app.use(express.static(path.join(__dirname, '../public')))

// APIルート
app.use('/api/products', productRoutes)
app.use('/api/inventory', inventoryRoutes)

// ヘルスチェック
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection()
  res.json({
    status: dbConnected ? 'ok' : 'error',
    database: dbConnected ? 'connected' : 'disconnected',
  })
})

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// エラーハンドラー
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

export default app
