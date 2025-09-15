import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Sequelize } from "sequelize";
import config from "./config/config.default.js";
import userModelFactory from "./models/user.js";
import questionnaireModelFactory from "./models/questionnaire.js";
import questionModelFactory from "./models/question.js";
import answerModelFactory from "./models/answer.js";
import categoryModelFactory from "./models/category.js";
import favoriteModelFactory from "./models/favorite.js";
import achievementModelFactory from "./models/achievement.js";
import commentModelFactory from "./models/comment.js";
import reportModelFactory from "./models/report.js";

import apiRoutes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Sequelize init
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    logging: config.db.logging,
  }
);

// Models
const User = userModelFactory(sequelize);
const Questionnaire = questionnaireModelFactory(sequelize);
const Question = questionModelFactory(sequelize);
const Answer = answerModelFactory(sequelize);
const Category = categoryModelFactory(sequelize);
const Favorite = favoriteModelFactory(sequelize);
const Achievement = achievementModelFactory(sequelize);
const Comment = commentModelFactory(sequelize);
const Report = reportModelFactory(sequelize);

// Associations (minimal)
Questionnaire.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Question.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Answer.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Answer.belongsTo(User, { foreignKey: "userId" });
Category.hasMany(Questionnaire, { foreignKey: "categoryId" });
Questionnaire.belongsTo(Category, { foreignKey: "categoryId" });
Favorite.belongsTo(User, { foreignKey: "userId" });
Favorite.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Achievement.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Report.belongsTo(User, { foreignKey: "userId" });
Report.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });

// Inject models to request
app.use((req, _res, next) => {
  req.db = {
    sequelize,
    User,
    Questionnaire,
    Question,
    Answer,
    Category,
    Favorite,
    Achievement,
    Comment,
    Report,
  };
  next();
});

// Routes
app.use("/api", apiRoutes);

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

async function bootstrap() {
  await sequelize.sync();
  app.listen(config.port, () =>
    console.log(`Server on http://localhost:${config.port}`)
  );
}

bootstrap();

// error handler should be last
app.use(errorHandler);
