// @ts-check
const {
  AzureNamedKeyCredential,
  TableClient,
  odata,
} = require("@azure/data-tables");
const debug = require("debug")("shopifydata:subscriptionmodel");

class ShopSubscription {
  /**
   * @param {string} sasUrl
   * @param {string} tableName
   */
  constructor(sasUrl, tableName) {
    this.tableClient = new TableClient(sasUrl, tableName);
  }

  /**
   * @param {string} shopName
   * @param {string} accessToken
   * @param {string} appName
   */
  async createShop(shopName, accessToken, appName) {
    const shop = {
      partitionKey: appName,
      rowKey: shopName,
      name: shopName,
      app: appName,
      token: accessToken,
      createdDate: new Date(new Date().toUTCString()),
    };

    try {
      await this.tableClient.createEntity(shop);
      debug(`${shopName} created successfully`);
    } catch (err) {
      debug(`Errored out creating a shop : ${err}`);
    }
  }

  /**
   * @param {string} shopName
   * @param {string} appName
   */
  async getShop(shopName, appName) {
    debug(`Querying ${shopName} which installed ${appName}`);
    const results = this.tableClient.listEntities({
      queryOptions: {
        filter: odata`PartitionKey eq ${appName} and RowKey eq ${shopName}`,
      },
    });

    for await (const shop of results) {
      debug(`Found Shop ${shop.name}`);
      return shop;
    }

    debug(`No shop found`);
    return null;
  }

  /**
   * @param {string} shopName
   * @param {string} appName
   */
  async deleteShop(shopName, appName) {
    debug(`Deleting ${shopName} which installed ${appName}`);
    try {
      await this.tableClient.deleteEntity(appName, shopName);
      debug(`Deleted ${shopName} which installed ${appName}`);
    } catch (err) {
      if (err.name === "RestError" && err.statusCode === 404) {
        debug(`Already deleted or doesn't exist`);
      } else {
        throw err;
      }
    }
  }
}

module.exports = ShopSubscription;
