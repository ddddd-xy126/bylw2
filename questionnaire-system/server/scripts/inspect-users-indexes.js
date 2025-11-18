const sequelize = require("../config/database");

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    const [columns] = await sequelize.query("SHOW FULL COLUMNS FROM `users`");
    console.log("\n=== SHOW FULL COLUMNS FROM `users` ===");
    console.log(columns);

    const [indexes] = await sequelize.query("SHOW INDEX FROM `users`");
    console.log("\n=== SHOW INDEX FROM `users` ===");
    console.log(indexes);

    // Also count distinct index names
    const indexNames = Array.from(new Set(indexes.map((i) => i.Key_name)));
    console.log("\nIndex names (" + indexNames.length + "):", indexNames);

    process.exit(0);
  } catch (err) {
    console.error("❌ Inspect failed:", err);
    process.exit(1);
  }
}

inspect();
