# Intelligent Trading Analyst | 智能交易分析师

AI-powered trading dashboard with market intelligence, behavior detection, and social content generation.

AI驱动的交易仪表板，集成市场分析、行为检测和社交内容生成。

---

## Features | 功能特性

| Feature | 功能 | Description | 描述 |
|---------|------|-------------|------|
| Market Intelligence | 市场分析 | Real-time RSI, ATR, volume + AI explanations | 实时RSI、ATR、成交量 + AI解读 |
| Behavior Engine | 行为引擎 | Detects loss streaks, revenge trading, oversizing | 检测连续亏损、报复性交易、超额持仓 |
| Content Generator | 内容生成 | 3 persona voices for LinkedIn/Twitter | 3种人设风格，适配LinkedIn/Twitter |
| Price Chart | 价格图表 | Interactive chart with drop simulation | 交互式图表，支持模拟下跌 |
| Dark Mode | 深色模式 | Toggle light/dark theme | 切换明/暗主题 |
| CSV Upload | CSV上传 | Upload custom trade history | 上传自定义交易记录 |

---

## Quick Start | 快速开始

### 1. Backend | 后端

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

**Configure API Key | 配置API密钥:**
```bash
# Edit .env file | 编辑 .env 文件
OPENAI_API_KEY=your-api-key-here
```

**Start Server | 启动服务:**
```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend | 前端

```bash
cd frontend
npm install
npm run dev
```

### 3. Open Browser | 打开浏览器

```
http://localhost:3000
```

---

## Usage | 使用方法

### Demo Flow | 演示流程

1. **Select Symbol | 选择交易对**
   - EUR/USD, GBP/USD, BTC/USD, ETH/USD

2. **Click "Simulate 3% Drop" | 点击"模拟3%下跌"**
   - Triggers market analysis | 触发市场分析
   - Analyzes behavior patterns | 分析行为模式
   - Generates social posts | 生成社交帖子

3. **View Results | 查看结果**
   - Price chart shows the drop | 价格图表显示下跌
   - Market card explains why | 市场卡片解释原因
   - Behavior card shows patterns | 行为卡片显示模式
   - Content card has 3 personas | 内容卡片有3种人设

4. **Copy & Share | 复制分享**
   - Switch LinkedIn/Twitter | 切换LinkedIn/Twitter
   - Click "Copy" button | 点击"复制"按钮

### Upload Custom Trades | 上传自定义交易

CSV format | CSV格式:
```csv
id,symbol,side,size,entry_price,exit_price,pnl,timestamp,closed_at
t001,BTCUSDT,buy,0.5,42150.00,42580.00,215.00,2024-02-01T09:15:00,2024-02-01T09:45:00
```

Required fields | 必填字段: `id, symbol, side, size, entry_price, timestamp`

---

## API Endpoints | API接口

| Endpoint | Method | Description | 描述 |
|----------|--------|-------------|------|
| `/api/v1/market` | GET | Market data + AI explanation | 市场数据 + AI解读 |
| `/api/v1/market/chart` | GET | Price chart data | 价格图表数据 |
| `/api/v1/behavior` | POST | Trade pattern analysis | 交易模式分析 |
| `/api/v1/content` | POST | Generate persona posts | 生成人设帖子 |

### Parameters | 参数

**GET /market:**
- `symbol` - Trading pair | 交易对 (default: EURUSD=X)
- `simulate_drop` - Simulate 3% drop | 模拟下跌 (true/false)

**POST /content:**
```json
{
  "market_context": "BTC dropped 3%...",
  "persona": "calm_analyst | data_nerd | trading_coach",
  "platform": "linkedin | twitter"
}
```

---

## Tech Stack | 技术栈

| Layer | 层级 | Technology | 技术 |
|-------|------|------------|------|
| Backend | 后端 | FastAPI, yfinance, OpenAI | FastAPI, yfinance, OpenAI |
| Frontend | 前端 | Next.js, TypeScript, Tailwind | Next.js, TypeScript, Tailwind |
| Charts | 图表 | Recharts | Recharts |
| Animation | 动画 | Framer Motion | Framer Motion |

---

## Project Structure | 项目结构

```
deriv-ai-talent-sprint/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry | 入口
│   │   ├── api/v1/              # API endpoints | 接口
│   │   ├── services/            # Business logic | 业务逻辑
│   │   └── data/trades.csv      # Sample data | 示例数据
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/dashboard/       # Dashboard page | 仪表板页面
│   │   ├── components/          # UI components | UI组件
│   │   └── lib/api.ts           # API client | API客户端
│   └── package.json
│
└── README.md
```

---

## Troubleshooting | 故障排除

| Issue | 问题 | Solution | 解决方案 |
|-------|------|----------|----------|
| CORS error | 跨域错误 | Ensure backend runs on port 8000 | 确保后端运行在8000端口 |
| No market data | 无市场数据 | Check internet connection | 检查网络连接 |
| API error | API错误 | Verify OPENAI_API_KEY in .env | 检查.env中的API密钥 |
| Build error | 构建错误 | Run `npm install` again | 重新运行 `npm install` |

---

## License | 许可证

MIT
