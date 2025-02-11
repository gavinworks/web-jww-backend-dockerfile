export default ({ action, services, exceptions }) => {
  const { ItemsService } = services;
  const { ServiceUnavailableException } = exceptions;
  const algoliasearch = require("algoliasearch");

  // Initialize the Algolia client
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
  const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

  // Helper function to transform property data for Algolia
  const transformPropertyForAlgolia = (property) => {
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

  // Add a custom endpoint for reindexing
  action("routes.custom.after", ({ router }) => {
    router.post("/algolia/reindex", async (req, res) => {
      try {
        const CHUNK_SIZE = 100; // Adjust this based on your needs
        const propertiesService = new ItemsService("properties", {
          schema: req.schema,
          accountability: req.accountability,
        });

        // First, clear the index
        await index.clearObjects();
        console.log("Cleared existing Algolia index");

        // Get total count
        const count = await propertiesService.readByQuery({
          limit: 0,
          aggregate: { count: ["id"] },
        });

        let offset = 0;
        const totalRecords = count[0].count;
        let processedRecords = 0;

        // Process in batches
        while (processedRecords < totalRecords) {
          // Fetch chunk of properties
          const properties = await propertiesService.readByQuery({
            fields: ["id", "code", "address", "bedrooms", "type", "featuredImageUrl", "marketingMode", "selling", "letting", "receptions", "bathrooms", "images", "video2Url", "officeIds"],
            limit: CHUNK_SIZE,
            offset: offset,
          });

          // Transform the chunk
          const records = properties.map(transformPropertyForAlgolia);

          // Send chunk to Algolia
          await index.saveObjects(records);

          processedRecords += properties.length;
          offset += CHUNK_SIZE;

          // Log progress
          console.log(`Processed ${processedRecords} of ${totalRecords} records`);
        }

        res.json({
          success: true,
          message: `Successfully reindexed ${processedRecords} properties`,
        });
      } catch (error) {
        console.error("Algolia reindex error:", error);
        throw new ServiceUnavailableException("Failed to update Algolia index");
      }
    });
  });

  // Optional: Add a hook to automatically update Algolia when items change
  action("items.update.after", async ({ payload, key, collection }) => {
    if (collection !== "properties") return;

    try {
      const propertiesService = new ItemsService("properties", {
        schema: req.schema,
        accountability: req.accountability,
      });

      const property = await propertiesService.readOne(key);
      const transformedProperty = transformPropertyForAlgolia(property);

      await index.saveObject(transformedProperty);
    } catch (error) {
      console.error("Algolia update error:", error);
    }
  });
};
