import algoliasearch from "algoliasearch";

export default {
  id: "algolia",
  handler: (router) => {
    router.get("/", (req, res) => res.send("Algolia endpoint is working"));
    router.get("/reindex", async (req, res) => {
      if (req.accountability?.user == null) {
        res.status(403);
        return res.send(`You don't have permission to access this.`);
      }

      try {
        const status = {
          steps: [],
          totalProcessed: 0,
          success: true,
        };

        status.steps.push("Starting reindex process");

        // Clear the index first
        status.steps.push("Clearing existing index");
        const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
        await index.clearObjects();
        status.steps.push("Index cleared successfully");

        const CHUNK_SIZE = 100;
        const propertiesService = new ItemsService("properties", {
          schema: req.schema,
        });

        let page = 0;
        let hasMore = true;

        while (hasMore) {
          const properties = await propertiesService.readByQuery({
            limit: CHUNK_SIZE,
            offset: page * CHUNK_SIZE,
          });

          if (properties.length === 0) {
            hasMore = false;
            continue;
          }

          const transformedProperties = properties.map(transformPropertyForAlgolia);
          await index.saveObjects(transformedProperties);

          status.totalProcessed += properties.length;
          page++;
          status.steps.push(`Processed batch ${page} (${status.totalProcessed} total properties)`);
        }

        status.steps.push("Reindex completed successfully");
        res.json(status);
      } catch (error) {
        throw new ServiceUnavailableException(error.message || "Failed to update Algolia index");
      }
    });
    router.post("/reindex", async (req, res) => {
      if (req.accountability?.user == null) {
        res.status(403);
        return res.send(`You don't have permission to access this.`);
      }

      try {
        const status = {
          steps: [],
          totalProcessed: 0,
          success: true,
        };

        status.steps.push("Starting reindex process");

        // Clear the index first
        status.steps.push("Clearing existing index");
        const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
        const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
        await index.clearObjects();
        status.steps.push("Index cleared successfully");

        const CHUNK_SIZE = 100;
        const propertiesService = new ItemsService("properties", {
          schema: req.schema,
        });

        let page = 0;
        let hasMore = true;

        while (hasMore) {
          const properties = await propertiesService.readByQuery({
            limit: CHUNK_SIZE,
            offset: page * CHUNK_SIZE,
          });

          if (properties.length === 0) {
            hasMore = false;
            continue;
          }

          const transformedProperties = properties.map(transformPropertyForAlgolia);
          await index.saveObjects(transformedProperties);

          status.totalProcessed += properties.length;
          page++;
          status.steps.push(`Processed batch ${page} (${status.totalProcessed} total properties)`);
        }

        status.steps.push("Reindex completed successfully");
        res.json(status);
      } catch (error) {
        throw new ServiceUnavailableException(error.message || "Failed to update Algolia index");
      }
    });
  },
};
