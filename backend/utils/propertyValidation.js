const validatePropertyInput = (data = {}) => {
  const requiredFields = [
    'title',
    'description',
    'price',
    'location',
    'propertyType',
    'listingType',
    'bedrooms',
    'bathrooms',
    'area',
  ];

  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (typeof data.price !== 'number' || data.price <= 0) {
    const error = new Error('Price must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  if (typeof data.bedrooms !== 'number' || data.bedrooms < 0) {
    const error = new Error('Bedrooms must be a number greater than or equal to 0');
    error.statusCode = 400;
    throw error;
  }

  if (typeof data.bathrooms !== 'number' || data.bathrooms < 0) {
    const error = new Error('Bathrooms must be a number greater than or equal to 0');
    error.statusCode = 400;
    throw error;
  }

  if (typeof data.area !== 'number' || data.area <= 0) {
    const error = new Error('Area must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  if (Array.isArray(data.images)) {
    for (const image of data.images) {
      if (typeof image === 'string' && image.trim()) {
        try {
          new URL(image);
        } catch {
          const validationError = new Error('Each image must be a valid URL');
          validationError.statusCode = 400;
          throw validationError;
        }
      }
    }
  }

  if (data.image !== undefined && data.image !== null && data.image !== '') {
    try {
      new URL(data.image);
    } catch (error) {
      const validationError = new Error('Image must be a valid URL');
      validationError.statusCode = 400;
      throw validationError;
    }
  }
};

module.exports = { validatePropertyInput };
