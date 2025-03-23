import sequelize from "../server/db/baseDatabase";

// Reset database before tests
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset database
});

afterAll(async () => {
  await sequelize.close();
});
