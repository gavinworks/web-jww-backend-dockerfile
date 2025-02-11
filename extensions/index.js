module.exports = function registerHook({ filter, action, init }) {
  const algoliasearch = require("algoliasearch");
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
  const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

  // Register the endpoint
  init("routes.custom.before", ({ router }) => {
    router.post("/algolia/reindex", async (req, res) => {
      try {
        // 1. Clear the existing index
        await index.clearObjects();
        console.log("Cleared existing Algolia index");

        // 2. Get all properties from database
        const properties = await req.services.database.select("*").from("properties");
        console.log(`Found ${properties.length} properties to index`);

        // 3. Transform the data
        const algoliaObjects = properties.map((p) => {
          const officeIdsArray = typeof p.officeIds === "string" ? JSON.parse(p.officeIds) : p.officeIds;

          return {
            objectID: p.code,
            code: p.code,
            image: p.featuredImageUrl,
            imagecount: p.images?.filter((item) => item.type === "photograph").length || 0,
            address2: p.address.line2,
            address3: p.address.line3,
            postcode: p.address.postcode,
            _geoloc: {
              lat: p.address.geolocation?.latitude || 0,
              lng: p.address.geolocation?.longitude || 0,
            },
            bedrooms: p.bedrooms,
            receptions: p.receptions,
            bathrooms: p.bathrooms,
            videourl: p.video2Url,
            type: p.type,
            sellingprice: p.selling?.price,
            lettingprice: p.letting?.rent,
            qualifier: p.selling?.qualifier,
            officeid: officeIdsArray?.[0] || null,
            mode: p.marketingMode,
          };
        });

        // 4. Send to Algolia in chunks
        const chunkSize = 1000;
        for (let i = 0; i < algoliaObjects.length; i += chunkSize) {
          const chunk = algoliaObjects.slice(i, i + chunkSize);
          await index.saveObjects(chunk);
          console.log(`Indexed chunk ${i / chunkSize + 1}`);
        }

        res.json({
          success: true,
          message: `Successfully indexed ${algoliaObjects.length} properties to Algolia`,
          indexName: process.env.ALGOLIA_INDEX_NAME,
          algoliaObjects: algoliaObjects,
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
