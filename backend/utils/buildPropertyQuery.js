const PROPERTY_TYPES = ['Apartment', 'Villa', 'House', 'Flat', 'Plot'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getString = (value) =>
  typeof value === 'string' ? value.trim() : '';

const getNumber = (value) => {
  const stringValue = getString(value);
  if (!stringValue) {
    return null;
  }

  const number = Number(stringValue);
  return Number.isFinite(number) ? number : null;
};

const getPageValue = (value, defaultValue, maximum = Infinity) => {
  const number = getNumber(value);
  if (number === null) {
    return defaultValue;
  }

  return Math.min(maximum, Math.max(1, Math.floor(number)));
};

const buildPropertyQuery = (query = {}) => {
  const filter = {};
  const clauses = [];
  const search = getString(query.search) || getString(query.q);
  const city = getString(query.city);
  const location = getString(query.location);

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), 'i');
    clauses.push({
      $or: ['title', 'location', 'city', 'state', 'description'].map((field) => ({
        [field]: searchRegex,
      })),
    });
  }

  if (city) {
    const escapedCity = escapeRegex(city);
    clauses.push({
      $or: [
        { city: new RegExp(`^${escapedCity}$`, 'i') },
        { location: new RegExp(escapedCity, 'i') },
      ],
    });
  }

  if (location) {
    filter.location = new RegExp(escapeRegex(location), 'i');
  }

  let minPrice = getNumber(query.minPrice);
  let maxPrice = getNumber(query.maxPrice);
  if (minPrice !== null && minPrice < 0) minPrice = null;
  if (maxPrice !== null && maxPrice < 0) maxPrice = null;
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }
  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  const propertyTypes = getString(query.propertyType)
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter((type) => PROPERTY_TYPES.some((allowedType) => allowedType.toLowerCase() === type));
  if (propertyTypes.length > 0) {
    filter.propertyType = {
      $in: [...new Set(propertyTypes)].map((type) => new RegExp(`^${escapeRegex(type)}$`, 'i')),
    };
  }

  const listingType = getString(query.listingType);
  if (/^(sale|rent)$/i.test(listingType)) {
    filter.listingType = new RegExp(`^${listingType}$`, 'i');
  }

  for (const field of ['bedrooms', 'bathrooms']) {
    const minimum = getNumber(query[field]);
    if (minimum !== null && minimum >= 0 && minimum <= 10) {
      filter[field] = { $gte: minimum };
    }
  }

  if (clauses.length > 0) {
    filter.$and = clauses;
  }

  const sortOptions = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    price_asc: { price: 1, _id: 1 },
    price_desc: { price: -1, _id: -1 },
    area_desc: { area: -1, _id: -1 },
    area_asc: { area: 1, _id: 1 },
  };
  const sortName = getString(query.sort);
  const sort = sortOptions[sortName] || sortOptions.newest;
  const page = getPageValue(query.page, 1);
  const limit = getPageValue(query.limit, 9, 50);

  return {
    filter,
    sort,
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

module.exports = buildPropertyQuery;
