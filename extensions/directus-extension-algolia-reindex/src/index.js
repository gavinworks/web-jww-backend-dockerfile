import algoliasearch from "algoliasearch";

export default {
  id: "algolia",
  handler: (router, { services }) => {
    console.log("Algolia reindex extension is loading...");

    try {
      const { ItemsService } = services;
      console.log("ItemsService loaded successfully");

      const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
      const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);
      console.log("Algolia client initialized with index:", process.env.ALGOLIA_INDEX_NAME);

      const transformPropertyForAlgolia = (property) => {
        console.log("Transforming property:", property.code);
        const officeIdsArray = typeof property.officeIds === "string" ? JSON.parse(property.officeIds) : property.officeIds;

        return {
          objectID: property.code,
          code: property.code,
          image: property.featuredImageUrl,
          imagecount: property.images?.length || 0,
          address2: property.address?.line2,
          address3: property.address?.line3,
          postcode: property.address?.postcode,
          _geoloc: property.address?.geolocation
            ? {
                lat: property.address.geolocation.latitude,
                lng: property.address.geolocation.longitude,
              }
            : null,
          bedrooms: property.bedrooms,
          receptions: property.receptions,
          bathrooms: property.bathrooms,
          videourl: property.video2Url,
          type: Array.isArray(property.type) ? property.type.toString() : property.type,
          sellingprice: property.selling?.price,
          lettingprice: property.letting?.rent,
          qualifier: property.selling?.qualifier ? property.selling.qualifier.replace(/([A-Z])/g, " $1").trim() : null,
          officeid: officeIdsArray?.[0] || null,
          mode: property.marketingMode,
        };
      };

      // Test route
      router.get("/", (req, res) => {
        console.log("GET / route hit");
        res.send("Algolia reindex endpoint is working");
      });

      // Reindex route - POST only
      router.post("/reindex", async (req, res) => {
        console.log("POST /reindex route hit");

        if (req.accountability?.user == null) {
          console.log("Unauthorized access attempt");
          return res.json({
            message: "Unauthorized access attempt",
            success: false,
          });
        }

        try {
          let totalProcessed = 0;
          let lastStep = "";

          // Clear the index first
          console.log("Clearing existing index");
          await index.clearObjects();
          lastStep = "Index cleared";

          const CHUNK_SIZE = 100;
          const propertiesService = new ItemsService("properties", {
            schema: req.schema,
          });

          let page = 0;
          let hasMore = true;

          while (hasMore) {
            console.log(`Processing page ${page}`);
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

            totalProcessed += properties.length;
            page++;
            lastStep = `Processed ${totalProcessed} properties`;
          }

          console.log("Reindex completed successfully");

          // Simplified response format
          return res.json({
            message: `Reindex completed successfully. Processed ${totalProcessed} properties.`,
            success: true,
            total: totalProcessed,
            lastStep,
          });
        } catch (error) {
          console.error("Reindex error:", error);
          return res.json({
            message: error.message || "Failed to update Algolia index",
            success: false,
            error: true,
          });
        }
      });

      console.log("Algolia reindex extension routes registered successfully");
    } catch (error) {
      console.error("Error initializing Algolia reindex extension:", error);
      throw error;
    }
  },
};
