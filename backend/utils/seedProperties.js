const Property = require('../models/Property');
const sampleProperties = require('./sampleProperties');

const seedSampleProperties = async () => {
  const operations = sampleProperties.map((property) => {
    const { isSample, title, location, ...fields } = property;

    return {
      updateOne: {
        filter: { title, location, isSample: true },
        update: {
          $setOnInsert: {
            ...fields,
            isSample: true,
            title,
            location,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Property.bulkWrite(operations);
  const inserted = result.upsertedCount;
  const skipped = sampleProperties.length - inserted;

  console.log(`Sample properties: ${inserted} inserted, ${skipped} skipped`);
  return { inserted, skipped };
};

module.exports = { seedSampleProperties };
