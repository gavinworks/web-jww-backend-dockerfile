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

      const formatAreaName = (areaName) => {
        if (!areaName) return null;

        // Special case mappings with exact matches
        const specialCases = {
          "Central/North/East": "Central, North, East",
          "Durham Moor /Fram/Pity me": "Durham Moor, Fram, Pity Me",
          "Broompark /Ushaw Moor": "Broompark, Ushaw Moor",
          "Farewell Hall/Merryoaks": "Farewell Hall, Merryoaks",
          "Newton Hall/Brasside": "Newton Hall, Brasside",
          "Croxdale/Tudhoe": "Croxdale, Tudhoe",
        };

        // Check for special cases first and return immediately if found
        if (specialCases[areaName]) {
          return specialCases[areaName];
        }

        // Only reach this code if it's not a special case
        return areaName
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      const transformPropertyForAlgolia = (property) => {
        console.log("Transforming property:", property.code);

        // Parse offices JSON if it's a string
        let officesArray;
        try {
          officesArray = typeof property.offices === "string" ? JSON.parse(property.offices) : property.offices;
        } catch (error) {
          console.error("Error parsing offices for property:", property.code, error);
          officesArray = [];
        }

        // Get the first office ID
        const officeId = officesArray?.[0]?.id || null;

        // Office ID to parent name mapping
        const officeToParent = {
          DAL: "Darlington",
          CNL: "Consett",
          CLL: "Chester-le-Street",
          BAL: "Bishop Auckland",
          LET: "Durham",
          DUR: "Durham",
          BAO: "Bishop Auckland",
          CLS: "Chester-le-Street",
          CNS: "Consett",
          DAR: "Darlington",
          DUS: "Durham",
        };

        // Get parent name from mapping or null for unknown IDs
        const parent = officeToParent[officeId] || null;

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
          type: property.type,
          style: property.style,
          situation: property.situation,
          parking: property.parking,
          age: property.age,
          price: property.selling?.price || property.letting?.rent || null,
          qualifier: property.selling?.qualifier ? property.selling.qualifier.replace(/([A-Z])/g, " $1").trim() : null,
          officeid: officeId,
          mode: property.marketingMode,
          sellingstatus: property.selling?.status || null,
          lettingstatus: property.letting?.status || null,
          parent: parent,
          area: formatAreaName(property.area?.name), // Format area name with special cases
        };
      };

      // Configure replica index
      const configureReplicaIndex = async () => {
        console.log("Configuring replica index for locations...");

        try {
          // Set up the replica
          await index.setSettings({
            replicas: [`${process.env.ALGOLIA_INDEX_NAME}_locations`],
          });

          // Get the replica index
          const locationIndex = client.initIndex(`${process.env.ALGOLIA_INDEX_NAME}_locations`);

          // Configure the replica index
          await locationIndex.setSettings({
            searchableAttributes: ["parent", "area"],
            attributesToRetrieve: ["parent", "area"],
            customRanking: ["asc(parent)", "asc(area)"],
            attributesForFaceting: ["parent", "area"],
            attributeForDistinct: "area",
            distinct: false,
          });

          console.log("Replica index configured successfully");
          return true;
        } catch (error) {
          console.error("Error configuring replica index:", error);
          throw error;
        }
      };

      // Test route
      router.get("/", (req, res) => {
        console.log("GET / route hit");
        res.send("Algolia reindex endpoint is working");
      });

      // Reindex route
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

          // Configure replica index after main reindex
          console.log("Configuring location replica index...");
          await configureReplicaIndex();
          lastStep = `Processed ${totalProcessed} properties and configured location replica`;

          console.log("Reindex and replica configuration completed successfully");

          return res.json({
            message: `Reindex completed successfully. Processed ${totalProcessed} properties and configured location replica.`,
            success: true,
            total: totalProcessed,
            lastStep,
          });
        } catch (error) {
          console.error("Reindex error:", error);
          return res.json({
            message: error.message || "Failed to update Algolia indexes",
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
