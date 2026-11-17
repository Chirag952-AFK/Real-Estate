import { useEffect, useState } from 'react';
import {
  createProperty,
  deleteProperty,
  getFilterOptions,
  updateProperty,
} from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import usePropertySearch from '../hooks/usePropertySearch';
import FilterPanel, { formatRupees } from '../components/FilterPanel';
import Pagination from '../components/Pagination';

const fallbackProperties = [
  {
    _id: '1',
    title: 'Luxury 3 BHK Apartment',
    location: 'Gurugram',
    city: 'Gurugram',
    state: 'Haryana',
    price: 7600000,
    propertyType: 'Apartment',
    listingType: 'Sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 1650,
    description: 'Beautiful apartment with open balcony and bright interiors in a prime location.',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    agent: { name: 'Amit Sharma', email: 'amit@example.com', phone: '9876543210' },
  },
  {
    _id: '2',
    title: 'Modern Studio Flat',
    location: 'Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    price: 5400000,
    propertyType: 'Flat',
    listingType: 'Sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1350,
    description: 'Smartly designed flat with high-end finishes and excellent connectivity.',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    agent: { name: 'Riya Singh', email: 'riya@example.com', phone: '9123456780' },
  },
  {
    _id: '3',
    title: 'Premium Family Villa',
    location: 'Greater Noida',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    price: 9800000,
    propertyType: 'Villa',
    listingType: 'Sale',
    bedrooms: 4,
    bathrooms: 3,
    area: 2450,
    description: 'A spacious villa with landscaped garden and premium lifestyle amenities.',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    agent: { name: 'Vikram Sethi', email: 'vikram@example.com', phone: '9988776655' },
  },
  {
    _id: '4',
    title: 'Urban Budget Home',
    location: 'Ghaziabad',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    price: 3800000,
    propertyType: 'House',
    listingType: 'Sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    description: 'Affordable and comfortable home built for modern family living.',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    agent: { name: 'Neha Verma', email: 'neha@example.com', phone: '9234567890' },
  },
];

const tabs = ['Buy', 'Rent', 'All'];

const getApiErrorMessage = (error, fallback) => {
  const message = error.message || fallback;
  if (/not authorized|unauthorized|forbidden|invalid or expired token/i.test(message)) {
    return 'You are not authorized to make this change. Please sign in with the listing owner or an admin account.';
  }
  return message;
};

const getEmptyForm = () => ({
  title: '',
  description: '',
  price: '',
  location: '',
  city: '',
  state: '',
  propertyType: 'Apartment',
  listingType: 'Sale',
  bedrooms: '',
  bathrooms: '',
  area: '',
  image: '',
  amenities: '',
  features: '',
  agentName: '',
  agentEmail: '',
  agentPhone: '',
});

function HomePage() {
  const { user, loading: authLoading, logout, openAuthModal } = useAuth();
  const {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    properties,
    pagination,
    loading,
    hasLoaded,
    error: searchError,
    refetch,
  } = usePropertySearch();
  const [filterOptions, setFilterOptions] = useState({ cities: [] });
  const [filterOptionsError, setFilterOptionsError] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getFilterOptions()
      .then((options) => {
        if (active) {
          setFilterOptions(options);
          setFilterOptionsError('');
        }
      })
      .catch((requestError) => {
        if (active) {
          setFilterOptionsError(requestError.message || 'Failed to load filter options');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const activeTab = String(filters.listingType).toLowerCase() === 'sale'
    ? 'Buy'
    : String(filters.listingType).toLowerCase() === 'rent'
      ? 'Rent'
      : 'All';
  const cards = properties;

  const scrollToProperties = () => {
    document.getElementById('property-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageChange = (page) => {
    setFilter('page', page);
    scrollToProperties();
  };

  const handleResetSearch = () => {
    resetFilters();
    scrollToProperties();
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const normalizePropertyPayload = (data) => ({
    title: data.title,
    description: data.description,
    price: Number(data.price),
    location: data.location,
    city: data.city || data.location || '',
    state: data.state || '',
    propertyType: data.propertyType,
    listingType: data.listingType,
    bedrooms: Number(data.bedrooms),
    bathrooms: Number(data.bathrooms),
    area: Number(data.area),
    image: data.image || '',
    images: data.image ? [data.image] : [],
    amenities: data.amenities
      ? data.amenities.split(',').map((item) => item.trim()).filter(Boolean)
      : [],
    features: data.features
      ? data.features.split(',').map((item) => item.trim()).filter(Boolean)
      : [],
    agent: {
      name: data.agentName || '',
      email: data.agentEmail || '',
      phone: data.agentPhone || '',
    },
  });

  const resetForm = () => {
    setFormData(getEmptyForm());
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');
    setError('');

    try {
      const payload = normalizePropertyPayload(formData);
      let savedProperty = null;

      if (isEditing && selectedProperty?._id) {
        savedProperty = await updateProperty(selectedProperty._id, payload);
        setStatusMessage(`Updated: ${savedProperty?.title || formData.title}`);
      } else {
        savedProperty = await createProperty(payload);
        setStatusMessage(`Created: ${savedProperty?.title || formData.title}`);
      }

      resetForm();
      refetch();
      scrollToProperties();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setIsEditing(true);
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price || '',
      location: property.location || '',
      city: property.city || '',
      state: property.state || '',
      propertyType: property.propertyType || 'Apartment',
      listingType: property.listingType || 'Sale',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      area: property.area || '',
      image: property.image || '',
      amenities: (property.amenities || []).join(', '),
      features: (property.features || []).join(', '),
      agentName: property.agent?.name || '',
      agentEmail: property.agent?.email || '',
      agentPhone: property.agent?.phone || '',
    });
    scrollToProperties();
  };

  const handleDelete = async (propertyId) => {
    const propertyToDelete = properties.find((property) => property._id === propertyId);

    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await deleteProperty(propertyId);
      setStatusMessage(`Deleted: ${propertyToDelete?.title || 'property'}`);
      setSelectedProperty(null);
      refetch();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete property'));
    }
  };

  const canManageProperty = (property) => {
    if (user?.role === 'admin') {
      return true;
    }

    const ownerId = property.owner && typeof property.owner === 'object'
      ? property.owner._id
      : property.owner;
    return Boolean(user && ownerId && String(ownerId) === String(user._id));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    scrollToProperties();
  };

  const activeChips = [];
  if (filters.search) {
    activeChips.push({ label: `Search: ${filters.search}`, clear: () => setFilter('search', '') });
  }
  if (filters.city) {
    activeChips.push({ label: filters.city, clear: () => setFilter('city', '') });
  }
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `${formatRupees(filters.minPrice)} – ${formatRupees(filters.maxPrice)}`
      : filters.minPrice
        ? `From ${formatRupees(filters.minPrice)}`
        : `Up to ${formatRupees(filters.maxPrice)}`;
    activeChips.push({
      label,
      clear: () => setFilters({ minPrice: '', maxPrice: '' }),
    });
  }
  if (filters.listingType) {
    activeChips.push({
      label: String(filters.listingType).toLowerCase() === 'sale' ? 'Sale' : 'Rent',
      clear: () => setFilter('listingType', ''),
    });
  }
  filters.propertyType.split(',').filter(Boolean).forEach((type) => {
    activeChips.push({
      label: type,
      clear: () => setFilter(
        'propertyType',
        filters.propertyType.split(',').filter((selectedType) => selectedType !== type).join(',')
      ),
    });
  });
  if (filters.bedrooms !== '') {
    activeChips.push({ label: `${filters.bedrooms}+ Beds`, clear: () => setFilter('bedrooms', '') });
  }
  if (filters.bathrooms !== '') {
    activeChips.push({ label: `${filters.bathrooms}+ Baths`, clear: () => setFilter('bathrooms', '') });
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner container">
          <div className="brand-group">
            <div className="brand-icon">C</div>
            <div className="brand-text">Celestia</div>
          </div>

          <form className="search-toolbar" onSubmit={handleSearch}>
            <div className="search-row">
              <input
                type="search"
                className="chip-box"
                placeholder="Search by city, locality or property name"
                value={filters.search}
                onChange={(event) => setFilter('search', event.target.value)}
                aria-label="Search properties"
              />
              <select
                className="chip-box location-chip"
                value={filters.city}
                onChange={(event) => setFilter('city', event.target.value)}
                aria-label="Filter by city"
              >
                <option value="">All Cities</option>
                {filterOptions.cities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              <button type="submit" className="search-button">Search</button>
            </div>
            {filterOptionsError && <div className="status-box error">{filterOptionsError}</div>}
          </form>

          <nav className="main-nav">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'active' : ''}
                aria-pressed={activeTab === tab}
                onClick={() => {
                  setFilter('listingType', tab === 'Buy' ? 'Sale' : tab === 'Rent' ? 'Rent' : '');
                  scrollToProperties();
                }}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="top-actions">
            {!authLoading && (user ? (
              <>
                <span className="header-user-name">{user.name}</span>
                <span className="role-badge">{user.role}</span>
                <button type="button" className="secondary-button small auth-header-button" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <button type="button" className="auth-header-link" onClick={() => openAuthModal('login')}>Login</button>
                <button type="button" className="primary-button small auth-header-button" onClick={() => openAuthModal('register')}>Sign Up</button>
              </>
            ))}
            <button type="button" className="primary-button small" onClick={scrollToProperties}>Explore Homes</button>
          </div>
        </div>
      </header>

      <main className="container page-content">
        <section className="hero-section">
          <h1>Change your location, change your life</h1>
        </section>

        <section className="stats-section">
          <h2>We’ve got properties for everyone</h2>

          <div className="stats-grid">
            <div className="stat-card dark">
              <div className="stat-number">3778</div>
              <div className="stat-label">Owner Properties</div>
              <span>Explore</span>
            </div>

            <div className="stat-card dark">
              <div className="stat-number">184</div>
              <div className="stat-label">Projects</div>
              <span>Explore</span>
            </div>

            <div className="stat-card warm">
              <div className="stat-text">Find the right home faster with verified listings and local support.</div>
              <button type="button" onClick={scrollToProperties}>Browse Now</button>
            </div>

            <div className="stat-card dark">
              <div className="stat-number">1064</div>
              <div className="stat-label">Budget Homes</div>
              <span>Explore</span>
            </div>
          </div>
        </section>

        <section className="crud-section">
          <div className="section-header">
            <h2>{isEditing ? 'Edit Property' : 'Add Property'}</h2>
            {isEditing && user && ['agent', 'admin'].includes(user.role) && (
              <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>
            )}
          </div>

          {statusMessage && <div className="status-box success">{statusMessage}</div>}
          {error && <div className="status-box error">{error}</div>}

          {authLoading ? (
            <p className="listing-access-message" role="status">Checking your account...</p>
          ) : user && ['agent', 'admin'].includes(user.role) ? (
          <form className="property-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Title
                <input name="title" value={formData.title} onChange={handleFieldChange} required />
              </label>
              <label>
                Price
                <input name="price" type="number" value={formData.price} onChange={handleFieldChange} required />
              </label>
              <label>
                Location
                <input name="location" value={formData.location} onChange={handleFieldChange} required />
              </label>
              <label>
                City
                <input name="city" value={formData.city} onChange={handleFieldChange} />
              </label>
              <label>
                State
                <input name="state" value={formData.state} onChange={handleFieldChange} />
              </label>
              <label>
                Property Type
                <select name="propertyType" value={formData.propertyType} onChange={handleFieldChange}>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                  <option value="Flat">Flat</option>
                  <option value="Plot">Plot</option>
                </select>
              </label>
              <label>
                Listing Type
                <select name="listingType" value={formData.listingType} onChange={handleFieldChange}>
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                </select>
              </label>
              <label>
                Bedrooms
                <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleFieldChange} />
              </label>
              <label>
                Bathrooms
                <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleFieldChange} />
              </label>
              <label>
                Area (sq ft)
                <input name="area" type="number" value={formData.area} onChange={handleFieldChange} />
              </label>
              <label className="full-width">
                Image URL
                <input name="image" value={formData.image} onChange={handleFieldChange} placeholder="https://..." />
              </label>
              <label className="full-width">
                Description
                <textarea name="description" value={formData.description} onChange={handleFieldChange} rows="4" />
              </label>
              <label className="full-width">
                Amenities (comma separated)
                <input name="amenities" value={formData.amenities} onChange={handleFieldChange} />
              </label>
              <label className="full-width">
                Features (comma separated)
                <input name="features" value={formData.features} onChange={handleFieldChange} />
              </label>
              <label>
                Agent Name
                <input name="agentName" value={formData.agentName} onChange={handleFieldChange} />
              </label>
              <label>
                Agent Email
                <input name="agentEmail" type="email" value={formData.agentEmail} onChange={handleFieldChange} />
              </label>
              <label>
                Agent Phone
                <input name="agentPhone" value={formData.agentPhone} onChange={handleFieldChange} />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Property' : 'Create Property')}
              </button>
            </div>
          </form>
          ) : (
            <p className="listing-access-message">
              Login as an agent to list a property.{' '}
              <button type="button" onClick={() => openAuthModal('login')}>Login</button>
            </p>
          )}
        </section>

        <section id="property-section" className="property-section">
          <div className="section-header">
            <h2>Popular Owner Properties</h2>
            <a href="#" onClick={(event) => { event.preventDefault(); handleResetSearch(); }}>
              See all Properties
            </a>
          </div>

          <div className="property-layout">
            <FilterPanel
              filters={filters}
              setFilter={setFilter}
              setFilters={setFilters}
              resetFilters={resetFilters}
            />

            <div className="property-results">
              <div className="results-toolbar">
                <p>
                  Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                  -{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
                </p>
                <label>
                  Sort
                  <select
                    value={filters.sort}
                    onChange={(event) => setFilter('sort', event.target.value)}
                    aria-label="Sort properties"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="area_desc">Area: Large to Small</option>
                    <option value="area_asc">Area: Small to Large</option>
                  </select>
                </label>
              </div>

              {activeChips.length > 0 && (
                <div className="active-filter-chips" aria-label="Active filters">
                  {activeChips.map((chip) => (
                    <button key={chip.label} type="button" onClick={chip.clear} aria-label={`Remove ${chip.label} filter`}>
                      {chip.label} <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              )}

              {(searchError || error) && (
                <div className="results-error">
                  <div className="status-box error">{searchError || error}</div>
                  <button
                    type="button"
                    className="secondary-button small"
                    onClick={() => {
                      setError('');
                      refetch();
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading && cards.length > 0 && (
                <div className="results-loading-message" role="status">Updating properties...</div>
              )}

              {loading && cards.length === 0 && (
                <div className="property-grid skeleton-grid" aria-label="Loading properties" aria-busy="true">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div className="property-card skeleton-card" key={index}>
                      <div className="skeleton-image" />
                      <div className="skeleton-body">
                        <div className="skeleton-line short" />
                        <div className="skeleton-line" />
                        <div className="skeleton-line medium" />
                        <div className="skeleton-line short" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cards.length > 0 && (
                <div className={`property-grid results-property-grid${loading ? ' is-loading' : ''}`} aria-busy={loading}>
                    {cards.map((property) => (
                      <article key={property._id} className="property-card">
                        <div className="property-image-wrap">
                          <img src={property.image || fallbackProperties[0].image} alt={property.title} />
                          <span className="property-badge">{property.bedrooms} BHK</span>
                        </div>
                        <div className="property-body">
                          <div className="property-topline">
                            <span>{property.bedrooms} BHK</span>
                            <span>{property.propertyType}</span>
                          </div>
                          <h3>{property.title}</h3>
                          <p>{property.location}</p>
                          <div className="price-row">
                            <strong>₹{Number(property.price).toLocaleString('en-IN')}</strong>
                            <button type="button" onClick={() => setSelectedProperty(property)}>View</button>
                          </div>
                          {canManageProperty(property) && (
                            <div className="property-actions">
                              <button type="button" className="small-action edit" onClick={() => handleEdit(property)}>Edit</button>
                              <button type="button" className="small-action delete" onClick={() => handleDelete(property._id)}>Delete</button>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                </div>
              )}

              {!loading && hasLoaded && !searchError && !error && cards.length === 0 && (
                <div className="empty-results">
                  <h3>No properties match your filters</h3>
                  <p>Try adjusting your search or clearing the selected filters.</p>
                  <button type="button" className="primary-button small" onClick={handleResetSearch}>
                    Reset filters
                  </button>
                </div>
              )}

              {!loading && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
            </div>
          </div>
        </section>

        {selectedProperty && (
          <div className="property-modal" onClick={() => setSelectedProperty(null)}>
            <div className="property-modal-card" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="close-modal" onClick={() => setSelectedProperty(null)}>
                ×
              </button>
              <img src={selectedProperty.image || fallbackProperties[0].image} alt={selectedProperty.title} />
              <div className="modal-body">
                <span className="tag">{selectedProperty.propertyType}</span>
                <h3>{selectedProperty.title}</h3>
                <p>{selectedProperty.location}</p>
                <div className="detail-grid">
                  <span>{selectedProperty.bedrooms} Bedrooms</span>
                  <span>{selectedProperty.bathrooms} Bathrooms</span>
                  <span>{selectedProperty.area} sq ft</span>
                </div>
                <div className="modal-price">₹{Number(selectedProperty.price).toLocaleString('en-IN')}</div>
                <p className="modal-description">{selectedProperty.description}</p>
                {canManageProperty(selectedProperty) && (
                  <div className="modal-actions">
                    <button type="button" className="primary-button small" onClick={() => handleEdit(selectedProperty)}>Edit</button>
                    <button type="button" className="secondary-button small" onClick={() => handleDelete(selectedProperty._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
