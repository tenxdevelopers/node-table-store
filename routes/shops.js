const express = require("express");
const router = express.Router();
const shopSub = require("../models/shopSubscription");

const { SHOP_DATA_URL, SHOP_DATA_TABLE } = process.env;

const shopData = new shopSub(SHOP_DATA_URL, SHOP_DATA_TABLE);

const APP_NAME = "OneBar";

router.post("/", async (req, res) => {
  const shop = req.body;
  await shopData.createShop(shop.name, shop.accesstoken, APP_NAME);
  res.sendStatus(201);
});

router.get("/:shopname", async (req, res) => {
  const shopName = req.params.shopname;
  const shop = await shopData.getShop(shopName, APP_NAME);
  if (!shop) {
    res.sendStatus(404);
    res.end();
  } else {
    res.send(shop);
  }
});

router.delete("/:shopname", async (req, res) => {
  const shopName = req.params.shopname;
  await shopData.deleteShop(shopName, APP_NAME);
  res.sendStatus(200);
  res.end();
});

module.exports = router;
