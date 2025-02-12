import algoliasearch from "algoliasearch";

export default {
  id: "algolia",
  handler: ({ services, exceptions }) => {
    const { ItemsService } = services;
    const { ServiceUnavailableException } = exceptions;
    const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);
    const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

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

    return {
      handler: (router) => {
        router.post("/algolia/reindex", async (req, res) => {
          try {
            const status = {
              steps: [],
              totalProcessed: 0,
              success: true,
            };

            status.steps.push("Starting reindex process");

            // Clear the index first
            status.steps.push("Clearing existing index");
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
  },
};
