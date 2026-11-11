const mongoose = require('mongoose');
const Property = require('../models/Property');
const buildPropertyQuery = require('../utils/buildPropertyQuery');
const { validatePropertyInput } = require('../utils/propertyValidation');

const isOwnerOrAdmin = (property, user) =>
  user.role === 'admin' ||
  (property.owner && property.owner.toString() === user._id.toString());

const getAllProperties = async (req, res) => {
  try {
    const { filter, sort, page, limit, skip } = buildPropertyQuery(req.query);
    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(limit),
      Property.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyFilters = async (req, res) => {
  try {
    const [cities, propertyTypes, aggregateResults] = await Promise.all([
      Property.distinct('city', { city: { $exists: true, $nin: [null, ''] } }),
      Property.distinct('propertyType', { propertyType: { $exists: true, $nin: [null, ''] } }),
      Property.aggregate([
        {
          $group: {
            _id: { $toLower: { $ifNull: ['$listingType', ''] } },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            maxBedrooms: { $max: '$bedrooms' },
            maxBathrooms: { $max: '$bathrooms' },
          },
        },
      ]),
    ]);

    const saleRange = aggregateResults.find((result) => result._id === 'sale');
    const rentRange = aggregateResults.find((result) => result._id === 'rent');
    const maxBedrooms = aggregateResults.reduce(
      (maximum, result) => Math.max(maximum, result.maxBedrooms || 0),
      0
    );
    const maxBathrooms = aggregateResults.reduce(
      (maximum, result) => Math.max(maximum, result.maxBathrooms || 0),
      0
    );
    const nonEmptyStrings = (values) =>
      values.filter((value) => typeof value === 'string' && value.trim()).sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      cities: nonEmptyStrings(cities),
      propertyTypes: nonEmptyStrings(propertyTypes),
      priceRange: {
        Sale: { min: saleRange?.minPrice || 0, max: saleRange?.maxPrice || 0 },
        Rent: { min: rentRange?.minPrice || 0, max: rentRange?.maxPrice || 0 },
      },
      maxBedrooms,
      maxBathrooms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    validatePropertyInput(req.body);

    const property = new Property({
      ...req.body,
      owner: req.user._id,
    });
    const savedProperty = await property.save();

    res.status(201).json(savedProperty);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const existingProperty = await Property.findById(req.params.id);

    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!isOwnerOrAdmin(existingProperty, req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    validatePropertyInput(req.body);

    const updates = { ...req.body };
    delete updates.owner;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(property);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!isOwnerOrAdmin(property, req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllProperties,
  getPropertyFilters,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
