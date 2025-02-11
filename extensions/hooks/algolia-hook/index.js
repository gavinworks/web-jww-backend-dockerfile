module.exports = function registerHook({ filter, action, init }) {
  const algoliasearch = require("algoliasearch");
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
  const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

  // Register the endpoint at root level
  init("routes.before", ({ router }) => {
    console.log("Registering Algolia reindex endpoint...");

    router.post("/custom/algolia/reindex", async (req, res) => {
      try {
        console.log("Reindex endpoint called");

        // 1. Clear the existing index
        await index.clearObjects();
        console.log("Cleared existing Algolia index");

        // 2. Get all properties from database
        const properties = await req.services.database.select("*").from("properties");
        console.log(`Found ${properties.length} properties to index`);

        // Rest of your code...
        // Transform and upload to Algolia

        res.json({
          success: true,
          message: `Successfully indexed ${properties.length} properties to Algolia`,
          indexName: process.env.ALGOLIA_INDEX_NAME,
        });
      } catch (error) {
        console.error("Error indexing to Algolia:", error);
        res.status(500).json({
          success: false,
          message: "Failed to index properties",
          error: error.message,
        });
      }
    });
  });
};
