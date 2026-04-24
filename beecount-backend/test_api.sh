#!/bin/bash

# 蜜蜂记账 API 测试脚本

BASE_URL="http://localhost:8080/api/v1"
echo "=== 蜜蜂记账 API 测试 ==="
echo "Base URL: $BASE_URL"
echo ""

# 1. 测试获取所有账本
echo "1. 测试获取所有账本 (GET /ledgers)"
curl -s "$BASE_URL/ledgers" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

# 2. 测试获取所有账户
echo "2. 测试获取所有账户 (GET /accounts)"
curl -s "$BASE_URL/accounts" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

# 3. 测试获取所有分类
echo "3. 测试获取所有分类 (GET /categories)"
curl -s "$BASE_URL/categories" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

# 4. 测试获取所有交易
echo "4. 测试获取所有交易 (GET /transactions)"
curl -s "$BASE_URL/transactions" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

# 5. 测试获取所有标签
echo "5. 测试获取所有标签 (GET /tags)"
curl -s "$BASE_URL/tags" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

# 6. 测试获取所有预算
echo "6. 测试获取所有预算 (GET /budgets)"
curl -s "$BASE_URL/budgets" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

# 7. 测试创建新分类
echo "7. 测试创建新分类 (POST /categories)"
NEW_CATEGORY='{"name":"测试分类","kind":"expense","icon":"test","sort_order":99}'
curl -s -X POST -H "Content-Type: application/json" -d "$NEW_CATEGORY" "$BASE_URL/categories" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

# 8. 测试创建新交易
echo "8. 测试创建新交易 (POST /transactions)"
NEW_TRANSACTION='{"ledger_id":1,"type":"expense","amount":99.99,"category_id":1,"account_id":1,"note":"测试交易","happened_at":"2026-04-21T08:30:00Z"}'
curl -s -X POST -H "Content-Type: application/json" -d "$NEW_TRANSACTION" "$BASE_URL/transactions" | python3 -m json.tool || echo "❌ 失败"
echo "-----------------------------------"
echo ""

echo "=== API 测试完成 ==="
