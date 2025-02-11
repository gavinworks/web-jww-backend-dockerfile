module.exports = function registerHook({ filter, action }) {
  const algoliasearch = require("algoliasearch");
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
  const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

  // Example: Update Algolia when items are created/updated
  action("items.create", async ({ payload, collection }) => {
    if (collection !== "properties") return;
    // Your indexing logic here
  });
};
