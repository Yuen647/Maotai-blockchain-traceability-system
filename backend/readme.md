## 设计思路

本系统以"可追溯、防篡改、透明公开"为目标，结合轻量级区块链技术，实现茅台酒全生命周期溯源。核心设计如下：

1. 溯源目标与关键需求
   - 全生命周期：从生产、物流、中转、零售到销售，每一环节均需记录并上链。
   - 防篡改：链式哈希和工作量证明确保数据不可逆篡改。
   - 可验证：凭借产品防伪码或二维码，任何角色均可查询完整链上溯源记录。
   - 性能与扩展：保证中小规模部署下的实时响应，并支持多节点网络。

2. 区块链模块设计
   - 数据结构
     - 交易(Transaction)：包含产品 ID、操作类型（创建/转移）、时间戳、源/目的地、备注等字段。
     - 区块(Block)：包含前一区块哈希、时间戳、交易列表、随机数(nonce)、当前区块哈希、默克尔根(Merkle root)。
   - 共识算法
     - 采用工作量证明 (PoW) 机制，通过调整难度值 (Difficulty) 控制出块速率。
     - 管理员节点负责发起挖矿，保证交易及时打包入链。
   - 交易池与打包流程
     - 交易提交后先存入内存交易池 (Mempool)。
     - 挖矿时，从交易池中选取所有未确认交易，生成新区块并存入数据库。
   - 数据存储
     - 采用 SQLite 存储链上完整数据，Block 和 Transaction 分表存储。
     - 同时保留内存链结构加速查询。

3. 产品与上链流程
   - 产品创建
     - 管理员通过 POST /api/products 创建产品，生成唯一 anti_fake_code。
     - 生成包含产品元信息（批次、生产日期、酒精度、认证信息、二维码 URL 等）的交易，上链记录初始状态。
   - 物流/零售流转
     - 物流、零售商角色调用 POST /api/products/{product_id}/transfer，填写源地址、目标地址及备注。
     - 每次流转作为单笔交易上链，保证节点共识后生效。
   - 防篡改验证
     - 前端或第三方通过 GET /api/products/{product_id} 拉取该产品全部上链交易，按区块和交易顺序展示溯源路径。
     - 可校验区块哈希和交易哈希，确保证据链完整。

4. 安全与可扩展性
   - 权限控制
     - 基于 JWT 的角色鉴权，不同角色权限最小化。
   - 多节点拓展
     - 虽然当前仅单节点运行，可通过网络通信模块扩展到多节点，保持区块同步和分布式共识。
   - 性能优化
     - Merkle 树加速大规模交易验证。
     - 缓存热点数据（如常查产品的链记录）提升查询效率。

这样，通过区块链技术，系统能够为每一瓶茅台酒提供可信的、防篡改的全流程可追溯记录。

### 核心模块代码示例

#### 1. 区块结构与挖矿
```python
15:36:backend/blockchain/block.py
class Block:
    def calculate_hash(self) -> str:
        """
        计算区块的哈希值
        """
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def mine_block(self, difficulty: int) -> None:
        """
        挖矿过程
        """
        target = "0" * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
```

#### 2. 交易提交流程
```python
74:86:backend/blockchain/blockchain.py
def add_transaction(self, transaction: Dict[str, Any]) -> int:
    """
    添加新的交易到待处理交易池，并进行智能合约验证
    """
    transaction_type = transaction.get('type')
    if transaction_type in self.smart_contract.rules:
        if not self.smart_contract.rules[transaction_type](transaction):
            raise ValueError(f"Transaction validation failed for type: {transaction_type}")

    self.pending_transactions.append(transaction)
    return self.get_latest_block().index + 1
```

#### 3. 挖矿与区块打包
```python
50:67:backend/blockchain/blockchain.py
def mine_pending_transactions(self, miner_address: str) -> Block:
    """
    挖矿，将待处理的交易打包成区块
    """
    # 添加挖矿奖励交易
    reward_transaction = {
        'type': 'mining_reward',
        'to': miner_address,
        'amount': self.mining_reward,
        'timestamp': time.time()
    }
    self.pending_transactions.append(reward_transaction)

    block = Block(
        len(self.chain),
        self.pending_transactions,
        time.time(),
        self.get_latest_block().hash
    )
    block.mine_block(self.difficulty)
    self.chain.append(block)
    self.pending_transactions = []
    return block
```

#### 4. API 与上链集成示例
```python
78:90:backend/app/routes.py
@main.route('/api/products', methods=['POST'])
@token_required
def create_product(current_user):
    # 构建产品交易
    transaction = {
        'type': 'product_creation',
        'product_id': product_id,
        'name': data['name'],
        'batch_number': data['batch_number'],
        'production_date': data['production_date'],
        'manufacturer': data['manufacturer'],
        'operator': current_user.username,
        'timestamp': datetime.now().isoformat()
    }
    # 提交到区块链交易池
    block_index = blockchain.add_transaction(transaction)
```

#### 5. 历史查询接口示例
```python
116:124:backend/blockchain/blockchain.py
def get_product_history(self, product_id: str) -> List[Dict[str, Any]]:
    """
    获取产品的历史记录
    """
    history = []
    for block in self.chain:
        for transaction in block.transactions:
            if transaction.get('product_id') == product_id:
                history.append({
                    'transaction': transaction,
                    'block_index': block.index,
                    'block_timestamp': block.timestamp,
                    'block_hash': block.hash
                })
    return history
```

## 程序界面说明

该系统主要通过 RESTful API 提供后端服务，前端或其他系统可通过以下接口与系统交互：

- 用户管理
  - POST /api/register：注册新用户，需要 username、password、role、organization。
  - POST /api/login：用户登录，返回 JWT Token。

- 产品管理
  - GET /api/products：获取所有产品列表。
  - GET /api/products/<product_id>：获取指定产品的详细信息及完整溯源记录。
  - POST /api/products：创建新产品（管理员权限），需要 product 信息。

- 物流流转
  - POST /api/products/<product_id>/transfer：提交流转交易，需要 from_location、to_location、remarks。

- 区块链操作
  - GET /api/blockchain/status：查询区块链当前状态（未打包交易数、区块高度等）。
  - POST /api/blockchain/mine：发起挖矿（管理员权限），将待处理交易打包进新区块。

前端界面可根据以上接口自行实现产品列表、详情页、溯源图谱展示等功能。
