const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

// 同步数据库并启动服务器
async function start() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log("✅ 数据库连接成功");

    // 同步模型：改为不自动执行 `ALTER`，避免在表结构复杂/索引接近上限时触发错误
    // 如果需要执行迁移，请使用手动迁移脚本或专门的迁移工具（例如 Sequelize CLI 或直接运行 SQL）。
    await sequelize.sync();
    console.log("✅ 数据库模型已同步（未执行 ALTER）");

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📝 环境: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 数据库: ${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error("❌ 启动失败:", error);
    process.exit(1);
  }
}

// 优雅退出
process.on("SIGTERM", async () => {
  console.log("收到 SIGTERM 信号，准备关闭服务器...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n收到 SIGINT 信号，准备关闭服务器...");
  await sequelize.close();
  process.exit(0);
});

start();
