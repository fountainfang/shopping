#!/bin/bash

# --- 配置区 ---
DEST="my-oracle-vps" 
TARGET_DIR="/home/ubuntu/shopping-app"
# --------------

echo "🚀 开始本地编译..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 编译失败，请检查代码！"
    exit 1
fi

echo "📦 准备同步文件到 VPS..."
ssh $DEST "mkdir -p $TARGET_DIR"

# 同步核心 standalone 文件
rsync -avzP --delete .next/standalone/ $DEST:$TARGET_DIR/
# 同步静态资源
rsync -avzP --delete .next/static/ $DEST:$TARGET_DIR/.next/static/
rsync -avzP --delete public/ $DEST:$TARGET_DIR/public/
# 同步环境变量
rsync -avzP .env $DEST:$TARGET_DIR/.env

echo "🔄 正在 VPS 上重启服务..."
ssh $DEST "cd $TARGET_DIR && (pm2 restart shopping-app --update-env || PORT=3000 pm2 start server.js --name shopping-app)"

echo "✅ 部署完成！"