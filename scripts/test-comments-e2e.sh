#!/bin/bash

# NovaScribe 評論系統 E2E 測試執行腳本

set -e

echo "======================================"
echo "NovaScribe 評論系統 E2E 測試"
echo "======================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查環境
echo -e "${YELLOW}檢查測試環境...${NC}"

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安裝${NC}"
    exit 1
fi

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安裝${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node --version)${NC}"
echo -e "${GREEN}✓ npm 版本: $(npm --version)${NC}"
echo ""

# 檢查是否在 novascribe 目錄
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 請在 novascribe 目錄執行此腳本${NC}"
    exit 1
fi

# 檢查測試檔案是否存在
echo -e "${YELLOW}檢查測試檔案...${NC}"

TEST_FILES=(
    "tests/e2e/comments-submission.spec.ts"
    "tests/e2e/comments-display.spec.ts"
    "tests/e2e/comments-admin.spec.ts"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}❌ $file 不存在${NC}"
        exit 1
    fi
done

echo ""

# 選擇測試模式
echo "請選擇測試模式："
echo "  1) 執行所有評論測試 (57 個測試案例)"
echo "  2) 僅執行前台提交測試 (15 個測試案例)"
echo "  3) 僅執行前台顯示測試 (17 個測試案例)"
echo "  4) 僅執行後台管理測試 (25 個測試案例)"
echo "  5) 執行特定測試案例"
echo "  6) 生成 HTML 報告"
echo ""

read -p "請輸入選項 (1-6): " choice

case $choice in
    1)
        echo -e "${YELLOW}執行所有評論測試...${NC}"
        npm run test:e2e -- comments-*.spec.ts
        ;;
    2)
        echo -e "${YELLOW}執行前台提交測試...${NC}"
        npm run test:e2e -- comments-submission.spec.ts
        ;;
    3)
        echo -e "${YELLOW}執行前台顯示測試...${NC}"
        npm run test:e2e -- comments-display.spec.ts
        ;;
    4)
        echo -e "${YELLOW}執行後台管理測試...${NC}"
        npm run test:e2e -- comments-admin.spec.ts
        ;;
    5)
        read -p "請輸入測試案例編號 (例如: 12.1.10): " test_case
        echo -e "${YELLOW}執行測試案例 $test_case...${NC}"
        npm run test:e2e -- comments-*.spec.ts -g "$test_case"
        ;;
    6)
        echo -e "${YELLOW}執行所有評論測試並生成 HTML 報告...${NC}"
        npm run test:e2e -- comments-*.spec.ts --reporter=html
        echo ""
        echo -e "${GREEN}✓ 測試報告已生成${NC}"
        echo -e "${GREEN}  請開啟 playwright-report/index.html 查看報告${NC}"
        ;;
    *)
        echo -e "${RED}❌ 無效的選項${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}======================================"
echo "測試執行完成"
echo "======================================${NC}"
