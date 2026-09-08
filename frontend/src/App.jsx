import { useEffect, useMemo, useState } from 'react';
import {
  createProperty,
  deleteProperty,
  getProperties,
  updateProperty,
} from './services/propertyService';

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

function App() {
  const [properties, setProperties] = useState(fallbackProperties);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [locationFilter, setLocationFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [formData, setFormData] = useState(getEmptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setProperties([]);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (locationFilter && locationFilter !== 'All') {
      result = result.filter((property) =>
        (property.location || '').toLowerCase().includes(locationFilter.toLowerCase()) ||
        (property.city || '').toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (budgetFilter === 'Under ₹80L') {
      result = result.filter((property) => Number(property.price) <= 8000000);
    }

    if (budgetFilter === 'Above ₹80L') {
      result = result.filter((property) => Number(property.price) > 8000000);
    }

    if (activeTab === 'Buy') {
      return result;
    }

    if (activeTab === 'Rent') {
      return result.filter((property) => property.listingType && property.listingType.toLowerCase() === 'rent');
    }

    return result;
  }, [properties, locationFilter, budgetFilter, activeTab]);

  const cards = filteredProperties.slice(0, 6);

  const scrollToProperties = () => {
    document.getElementById('property-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      setLocationFilter('All');
      setBudgetFilter('All');
      setActiveTab('All');
      resetForm();
      await fetchProperties();
      scrollToProperties();
    } catch (err) {
      setError(err.message || 'Something went wrong');
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
      await fetchProperties();
    } catch (err) {
      setError(err.message || 'Failed to delete property');
    }
  };

  const handleSearch = () => {
    scrollToProperties();
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner container">
          <div className="brand-group">
            <div className="brand-icon">M</div>
            <div className="brand-text">magicbricks</div>
          </div>

          <div className="city-label">Ghaziabad</div>

          <nav className="main-nav">
            <span>Buy</span>
            <span>Rent</span>
            <span>Sell</span>
            <span>Contact</span>
          </nav>

          <div className="top-actions">
            <button type="button" className="primary-button small" onClick={scrollToProperties}>Explore Homes</button>
          </div>
        </div>
      </header>

      <div className="subnav container">
        <span>Buy</span>
        <span>Rent</span>
        <span>New Launch</span>
        <span>Plots</span>
        <span>Villas</span>
      </div>

      <main className="container page-content">
        <section className="hero-section">
          <h1>Start your #PataBhadoLifeBhado Journey</h1>

          <div className="search-toolbar">
            <div className="tab-group">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="search-row">
              <button
                type="button"
                className="chip-box location-chip"
                onClick={() =>
                  setLocationFilter((prev) => {
                    if (prev === 'All') return 'Ghaziabad';
                    if (prev === 'Ghaziabad') return 'Noida';
                    if (prev === 'Noida') return 'All';
                    return 'All';
                  })
                }
              >
                {locationFilter === 'All' ? 'All Cities' : locationFilter}
              </button>
              <button
                type="button"
                className="chip-box"
                onClick={() =>
                  setBudgetFilter((prev) => {
                    if (prev === 'All') return 'Under ₹80L';
                    if (prev === 'Under ₹80L') return 'Above ₹80L';
                    if (prev === 'Above ₹80L') return 'All';
                    return 'All';
                  })
                }
              >
                {budgetFilter === 'All' ? 'All Budgets' : budgetFilter}
              </button>
              <button type="button" className="search-button" onClick={handleSearch}>Search</button>
            </div>
          </div>

          <div className="promo-card">
            <div className="promo-badge">40%</div>
            <h3>Smart home upgrades for a better lifestyle</h3>
            <p>View Packages</p>
          </div>
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
            {isEditing && (
              <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>
            )}
          </div>

          {statusMessage && <div className="status-box success">{statusMessage}</div>}
          {error && <div className="status-box error">{error}</div>}

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
        </section>

        <section id="property-section" className="property-section">
          <div className="section-header">
            <h2>Popular Owner Properties</h2>
            <a href="#" onClick={(event) => { event.preventDefault(); scrollToProperties(); }}>
              See all Properties
            </a>
          </div>

          {loading && <div className="status-box">Loading properties...</div>}
          {error && !loading && <div className="status-box error">{error}</div>}

          {!loading && !error && (
            cards.length > 0 ? (
              <div className="property-grid">
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
                      <div className="property-actions">
                        <button type="button" className="small-action edit" onClick={() => handleEdit(property)}>Edit</button>
                        <button type="button" className="small-action delete" onClick={() => handleDelete(property._id)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="status-box">No properties found for the current filters.</div>
            )
          )}
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
                <div className="modal-actions">
                  <button type="button" className="primary-button small" onClick={() => handleEdit(selectedProperty)}>Edit</button>
                  <button type="button" className="secondary-button small" onClick={() => handleDelete(selectedProperty._id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
