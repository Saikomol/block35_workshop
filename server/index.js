const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createUserProduct,
  fetchUserProducts,
  deleteUserProduct,
} = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/userProducts", async (req, res, next) => {
  try {
    res.send(await fetchUserProducts(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:userId/userProducts/:id", async (req, res, next) => {
  try {
    await deleteUserProduct({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/userProducts", async (req, res, next) => {
  try {
    res
      .status(201)
      .send(
        await createUserProduct({
          user_id: req.params.id,
          product_id: req.body.product_id,
        })
      );
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [
    Thomos,
    Percy,
    James,
    Gordon,
    BlueCar,
    RedCar,
    SteamEngine,
    GreenCar,
    CoalEngine,
    Diesel,
    Whistle,
    Bell,
  ] = await Promise.all([
    createUser({ username: "Thomos", password: "Thomos_pw" }),
    createUser({ username: "Percy", password: "Percy_pw" }),
    createUser({ username: "James", password: "James_pw" }),
    createUser({ username: "Gordon", password: "Gordon_pw" }),
    createProduct({ name: "BlueCar" }),
    createProduct({ name: "RedCar" }),
    createProduct({ name: "SteamEngine" }),
    createProduct({ name: "GreenCar" }),
    createProduct({ name: "CoalEngine" }),
    createProduct({ name: "Diesel" }),
    createProduct({ name: "Whistle" }),
    createProduct({ name: "Bell" }),
  ]);
  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const userProducts = await Promise.all([
    createUserProduct({ user_id: Thomos.id, product_id: BlueCar.id }),
    createUserProduct({ user_id: Thomos.id, product_id: Whistle.id }),
    createUserProduct({ user_id: Percy.id, product_id: GreenCar.id }),
    createUserProduct({ user_id: Percy.id, product_id: Bell.id }),
  ]);
  console.log(await fetchUserProducts(Thomos.id));
  await deleteUserProduct({ user_id: Thomos.id, id: userProducts[0].id });
  console.log(await fetchUserProducts(Thomos.id));

  console.log(`curl localhost:3000/api/users/${Percy.id}/userProducts`);

  console.log(
    `curl -X POST localhost:3000/api/users/${Percy.id}/userProducts -d '{"product_id": "${Whistle.id}"}' -H 'Content-Type:application/json'`
  );
  console.log(
    `curl -X DELETE localhost:3000/api/users/${Percy.id}/userProducts/${userProducts[3].id}`
  );

  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
