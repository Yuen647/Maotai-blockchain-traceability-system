import json
import time
import hashlib
from typing import List, Dict, Any
from .block import Block

class SmartContract:
    def __init__(self):
        self.rules = {
            'product_creation': self.validate_product_creation,
            'product_transfer': self.validate_product_transfer,
            'product_sale': self.validate_product_sale
        }

    def validate_product_creation(self, transaction: Dict[str, Any]) -> bool:
        required_fields = ['product_id', 'name', 'batch_number', 'production_date', 'manufacturer']
        return all(field in transaction for field in required_fields)

    def validate_product_transfer(self, transaction: Dict[str, Any]) -> bool:
        required_fields = ['product_id', 'from_location', 'to_location', 'operator']
        return all(field in transaction for field in required_fields)

    def validate_product_sale(self, transaction: Dict[str, Any]) -> bool:
        required_fields = ['product_id', 'to_location', 'operator', 'price']
        return all(field in transaction for field in required_fields)

class Blockchain:
    def __init__(self, difficulty: int = 4):
        self.chain: List[Block] = []
        self.difficulty = difficulty
        self.pending_transactions = []
        self.smart_contract = SmartContract()
        self.mining_reward = 10  # 挖矿奖励
        self.create_genesis_block()

    def create_genesis_block(self) -> None:
        """
        创建创世区块
        """
        genesis_block = Block(0, [], time.time(), "0")
        genesis_block.mine_block(self.difficulty)
        self.chain.append(genesis_block)

    def get_latest_block(self) -> Block:
        """
        获取最新的区块
        """
        return self.chain[-1]

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

    def add_transaction(self, transaction: Dict[str, Any]) -> int:
        """
        添加新的交易到待处理交易池，并进行智能合约验证
        """
        # 根据交易类型选择相应的验证规则
        transaction_type = transaction.get('type')
        if transaction_type in self.smart_contract.rules:
            if not self.smart_contract.rules[transaction_type](transaction):
                raise ValueError(f"Transaction validation failed for type: {transaction_type}")

        self.pending_transactions.append(transaction)
        return self.get_latest_block().index + 1

    def get_chain(self) -> List[Dict[str, Any]]:
        """
        获取整个区块链
        """
        return [block.to_dict() for block in self.chain]

    def is_chain_valid(self) -> bool:
        """
        验证区块链是否有效
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]

            if current_block.hash != current_block.calculate_hash():
                return False

            if current_block.previous_hash != previous_block.hash:
                return False

            # 验证区块中的交易
            for transaction in current_block.transactions:
                transaction_type = transaction.get('type')
                if transaction_type in self.smart_contract.rules:
                    if not self.smart_contract.rules[transaction_type](transaction):
                        return False

        return True

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

    def get_block_by_hash(self, block_hash: str) -> Dict[str, Any]:
        """
        通过区块哈希获取区块信息
        """
        for block in self.chain:
            if block.hash == block_hash:
                return block.to_dict()
        return None

    def get_transaction_by_hash(self, transaction_hash: str) -> Dict[str, Any]:
        """
        通过交易哈希获取交易信息
        """
        for block in self.chain:
            for transaction in block.transactions:
                if hashlib.sha256(json.dumps(transaction).encode()).hexdigest() == transaction_hash:
                    return {
                        'transaction': transaction,
                        'block_index': block.index,
                        'block_timestamp': block.timestamp,
                        'block_hash': block.hash
                    }
        return None 