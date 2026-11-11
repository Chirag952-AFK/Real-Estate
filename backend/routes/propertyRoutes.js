const express = require('express');
const {
  getAllProperties,
  getPropertyFilters,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllProperties);
router.get('/filters', getPropertyFilters);
router.get('/:id', getPropertyById);
router.post('/', protect, authorize('agent', 'admin'), createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;
