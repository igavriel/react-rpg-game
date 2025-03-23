import { Sequelize } from "sequelize";
import { constants } from "../../utilities/constants";

const isTest = process.env.NODE_ENV === "test";

const baseDatabase = new Sequelize({
  dialect: "sqlite",
  storage: isTest ? ":memory:" : `${constants.DB_DIR}/db.sqlite`,
  logging: isTest ? console.log : false,
});

export default baseDatabase;
