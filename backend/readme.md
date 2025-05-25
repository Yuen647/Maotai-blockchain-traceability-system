好的，我来帮你启动后端并创建初始数据。首先，让我们修改`__init__.py`文件，避免每次重启都删除数据。


现在让我们启动后端服务器：

```bash
python run.py
```
现在让我们创建初始用户。我们需要创建管理员、物流和零售商用户：

```bash
curl -X POST http://localhost:15000/api/register -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin123", "role": "admin", "organization": "茅台集团"}'
```

```bash
curl -X POST http://localhost:15000/api/register -H "Content-Type: application/json" -d '{"username": "logistics", "password": "log123", "role": "logistics", "organization": "茅台物流"}'
```

```bash
curl -X POST http://localhost:15000/api/register -H "Content-Type: application/json" -d '{"username": "retailer", "password": "ret123", "role": "retailer", "organization": "茅台专卖店"}'
```
看起来用户已经存在。让我们获取admin的token来创建产品：

```bash
curl -X POST http://localhost:15000/api/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin123"}'
```
现在让我们创建8个不同状态的茅台产品。我们将使用获取到的token来创建产品：

```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4ifQ.ZzbyJ_SyZ4rWhbrHTQlVrHNT9sv2bu3yjWw2qVq7Ogs" && curl -X POST http://localhost:15000/api/products -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name": "贵州茅台酒（珍藏版）", "batch_number": "MT2024001", "production_date": "2024-03-01T00:00:00", "manufacturer": "贵州茅台酒股份有限公司", "alcohol_content": 53.0, "flavor_type": "酱香型", "vintage": 2024, "certification": "国酒认证", "anti_fake_code": "MT2024001ABC", "qr_code": "http://117.72.111.42:9090/browser/safety/maotai.png", "image_url": "http://117.72.111.42:9090/browser/safety/maotai.png"}'
```
让我们继续创建其他产品，并记录第一个产品的ID以便后续添加物流记录：

```bash
for i in {2..8}; do curl -X POST http://localhost:15000/api/products -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"name\": \"贵州茅台酒（批次$i）\", \"batch_number\": \"MT2024$(printf '%03d' $i)\", \"production_date\": \"2024-03-$(printf '%02d' $i)T00:00:00\", \"manufacturer\": \"贵州茅台酒股份有限公司\", \"alcohol_content\": 53.0, \"flavor_type\": \"酱香型\", \"vintage\": 2024, \"certification\": \"国酒认证\", \"anti_fake_code\": \"MT2024$(printf '%03d' $i)ABC\", \"qr_code\": \"http://117.72.111.42:9090/browser/safety/maotai$((($i%4)+1)).png\", \"image_url\": \"http://117.72.111.42:9090/browser/safety/maotai$((($i%4)+1)).png\"}"; echo -e "\n"; done
```
现在让我们为这些产品添加不同的物流状态。我们需要使用物流用户的token：

```bash
curl -X POST http://localhost:15000/api/login -H "Content-Type: application/json" -d '{"username": "logistics", "password": "log123"}'
```
现在让我们为每个产品添加不同的物流状态：

```bash

```
抱歉，让我分开执行这些命令：

```bash
LOGISTICS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyLCJyb2xlIjoibG9naXN0aWNzIn0.1K9wrzGWYnwLjtzE2uZu5ijDa3vX2hxw9kjeRrhny8U" && curl -X POST http://localhost:15000/api/products/9c227cd2b6ed897857e157fc0d573a363834343293e863fe213d7f6b73aada68/transfer -H "Authorization: Bearer $LOGISTICS_TOKEN" -H "Content-Type: application/json" -d '{"from_location": "贵州茅台酒厂", "to_location": "北京物流中心", "remarks": "产品出厂"}'
```

```bash
curl -X POST http://localhost:15000/api/products/ec6c88999583fb61cca400717ca5de3776151928e662384b4e3d41c5393e0ba9/transfer -H "Authorization: Bearer $LOGISTICS_TOKEN" -H "Content-Type: application/json" -d '{"from_location": "贵州茅台酒厂", "to_location": "上海物流中心", "remarks": "产品在运输中"}'
```

```bash
curl -X POST http://localhost:15000/api/products/d0c149f472e1d7212fe9ab27edaee6863cd0cd7b2246109ce74952399058b05e/transfer -H "Authorization: Bearer $LOGISTICS_TOKEN" -H "Content-Type: application/json" -d '{"from_location": "贵州茅台酒厂", "to_location": "广州专卖店", "remarks": "产品已送达"}'
```

```bash
curl -X POST http://localhost:15000/api/products/f80e0fd82230c51e515c2dcb1fd27118b84ed37b94677da445b6daf5b36d68dd/transfer -H "Authorization: Bearer $LOGISTICS_TOKEN" -H "Content-Type: application/json" -d '{"from_location": "贵州茅台酒厂", "to_location": "成都中转站", "remarks": "第一次中转"}' && curl -X POST http://localhost:15000/api/products/f80e0fd82230c51e515c2dcb1fd27118b84ed37b94677da445b6daf5b36d68dd/transfer -H "Authorization: Bearer $LOGISTICS_TOKEN" -H "Content-Type: application/json" -d '{"from_location": "成都中转站", "to_location": "重庆专卖店", "remarks": "第二次中转"}'
```
现在让我们获取零售商的token，为部分产品添加销售状态：

```bash
curl -X POST http://localhost:15000/api/login -H "Content-Type: application/json" -d '{"username": "retailer", "password": "ret123"}'
```

```bash
RETAILER_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozLCJyb2xlIjoicmV0YWlsZXIifQ.tEHpl03F37QRbbqqRAUqqD7Nw0IoHSSOzfRFDp6u064" && curl -X POST http://localhost:15000/api/products/d0c149f472e1d7212fe9ab27edaee6863cd0cd7b2246109ce74952399058b05e/transfer -H "Authorization: Bearer $RETAILER_TOKEN" -H "Content-Type: application/json" -d '{"from_location": "广州专卖店", "to_location": "终端消费者", "remarks": "已售出"}'
```
现在我们已经创建了8个产品，并为它们添加了不同的状态：

1. 产品1（MT2024001）：已出厂，在北京物流中心
2. 产品2（MT2024002）：在运输中，前往上海物流中心
3. 产品3（MT2024003）：已送达广州专卖店并已售出给消费者
4. 产品4（MT2024004）：经过多次中转（成都->重庆）
5. 产品5（MT2024005）：新生产，尚未发货
6. 产品6（MT2024006）：新生产，尚未发货
7. 产品7（MT2024007）：新生产，尚未发货
8. 产品8（MT2024008）：新生产，尚未发货

每个产品都有不同的图片（在4张图片中循环使用），并且都记录在区块链上。我们可以通过API查看任何产品的完整溯源记录。

让我们验证一下系统状态：

```bash
curl http://localhost:15000/api/blockchain/status
```
我们看到有14个待处理的交易（8个产品创建 + 6个物流记录），需要进行挖矿来将它们打包进区块。让我们用管理员账号进行挖矿：

```bash
curl -X POST http://localhost:15000/api/blockchain/mine -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4ifQ.ZzbyJ_SyZ4rWhbrHTQlVrHNT9sv2bu3yjWw2qVq7Ogs"
```
太好了！所有交易都已经被成功打包进区块链。让我们再次检查区块链状态：

```bash
curl http://localhost:15000/api/blockchain/status
```
完美！现在我们已经成功：
1. 修复了数据库重置问题
2. 创建了8个不同批次的茅台产品
3. 为产品添加了不同的物流状态
4. 所有交易都已经被打包进区块链
5. 区块链状态正常，没有待处理的交易

系统现在包含了以下状态的产品：
- 新生产未发货（4个产品）
- 在途中（2个产品）
- 已到达零售店（1个产品）
- 已售出给消费者（1个产品）

每个产品都使用了4张不同的图片轮换展示，所有操作都记录在区块链上，可以通过API查询完整的溯源记录。系统已经准备好供前端使用了。
