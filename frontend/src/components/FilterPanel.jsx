import { useState } from 'react';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'House', 'Flat', 'Plot'];
const BEDROOM_OPTIONS = ['', '1', '2', '3', '4', '5'];
const BATHROOM_OPTIONS = ['', '1', '2', '3', '4'];
const formatRupees = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const getPricePresets = (listingType) => (
  String(listingType).toLowerCase() === 'rent'
    ? [
        { label: 'Under ₹15K', minPrice: '', maxPrice: 15000 },
        { label: '₹15K-₹30K', minPrice: 15000, maxPrice: 30000 },
        { label: '₹30K-₹60K', minPrice: 30000, maxPrice: 60000 },
        { label: 'Above ₹60K', minPrice: 60000, maxPrice: '' },
      ]
    : [
        { label: 'Under ₹50L', minPrice: '', maxPrice: 5000000 },
        { label: '₹50L-₹1Cr', minPrice: 5000000, maxPrice: 10000000 },
        { label: '₹1Cr-₹3Cr', minPrice: 10000000, maxPrice: 30000000 },
        { label: 'Above ₹3Cr', minPrice: 30000000, maxPrice: '' },
      ]
);

function FilterPanel({ filters, setFilter, setFilters, resetFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTypes = filters.propertyType ? filters.propertyType.split(',').filter(Boolean) : [];
  const activeFilterCount = [
    filters.search,
    filters.city,
    filters.minPrice || filters.maxPrice,
    filters.listingType,
    filters.bedrooms,
    filters.bathrooms,
  ].filter(Boolean).length + selectedTypes.length;
  const pricePresets = getPricePresets(filters.listingType);

  const togglePropertyType = (type) => {
    const nextTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((selectedType) => selectedType !== type)
      : [...selectedTypes, type];
    setFilter('propertyType', nextTypes.join(','));
  };

  const selectPreset = ({ minPrice, maxPrice }) => {
    setFilters({ minPrice, maxPrice });
  };

  const isPresetSelected = (preset) =>
    String(filters.minPrice) === String(preset.minPrice) &&
    String(filters.maxPrice) === String(preset.maxPrice);

  return (
    <aside className={`filter-panel${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="filter-panel-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>Filters</span>
        <span className="filter-count">{activeFilterCount}</span>
        <span className="filter-toggle-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>

      <div className="filter-panel-content">
        <div className="filter-panel-heading">
          <h3>Filters</h3>
          <span className="filter-count">{activeFilterCount} active</span>
        </div>

        <section className="filter-group" aria-labelledby="price-filter-heading">
          <h4 id="price-filter-heading">Price range</h4>
          <div className="price-inputs">
            <label>
              <span>Min</span>
              <span className="rupee-input">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) => setFilter('minPrice', event.target.value)}
                  aria-label="Minimum price"
                />
              </span>
            </label>
            <label>
              <span>Max</span>
              <span className="rupee-input">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => setFilter('maxPrice', event.target.value)}
                  aria-label="Maximum price"
                />
              </span>
            </label>
          </div>
          <div className="price-presets">
            {pricePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={isPresetSelected(preset) ? 'selected' : ''}
                aria-pressed={isPresetSelected(preset)}
                onClick={() => selectPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group" aria-labelledby="listing-filter-heading">
          <h4 id="listing-filter-heading">Listing type</h4>
          <div className="filter-pill-row">
            {[
              { label: 'Sale', value: 'Sale' },
              { label: 'Rent', value: 'Rent' },
              { label: 'All', value: '' },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                className={String(filters.listingType || '').toLowerCase() === value.toLowerCase() ? 'selected' : ''}
                aria-pressed={String(filters.listingType || '').toLowerCase() === value.toLowerCase()}
                onClick={() => setFilter('listingType', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group" aria-labelledby="property-type-heading">
          <h4 id="property-type-heading">Property type</h4>
          <div className="property-type-options">
            {PROPERTY_TYPES.map((type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => togglePropertyType(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="filter-group" aria-labelledby="bedrooms-filter-heading">
          <h4 id="bedrooms-filter-heading">Bedrooms</h4>
          <div className="filter-pill-row">
            {BEDROOM_OPTIONS.map((value) => (
              <button
                key={value || 'any'}
                type="button"
                className={String(filters.bedrooms) === value ? 'selected' : ''}
                aria-pressed={String(filters.bedrooms) === value}
                onClick={() => setFilter('bedrooms', value)}
              >
                {value ? `${value}+` : 'Any'}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group" aria-labelledby="bathrooms-filter-heading">
          <h4 id="bathrooms-filter-heading">Bathrooms</h4>
          <div className="filter-pill-row">
            {BATHROOM_OPTIONS.map((value) => (
              <button
                key={value || 'any'}
                type="button"
                className={String(filters.bathrooms) === value ? 'selected' : ''}
                aria-pressed={String(filters.bathrooms) === value}
                onClick={() => setFilter('bathrooms', value)}
              >
                {value ? `${value}+` : 'Any'}
              </button>
            ))}
          </div>
        </section>

        <button type="button" className="reset-filters-button" onClick={resetFilters}>
          Reset all filters
        </button>
      </div>
    </aside>
  );
}

export { formatRupees };
export default FilterPanel;
