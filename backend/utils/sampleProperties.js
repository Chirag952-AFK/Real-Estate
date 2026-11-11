const cities = [
  {
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    areas: ['Indirapuram', 'Vaishali', 'Raj Nagar', 'Crossings Republik', 'Kaushambi', 'Siddharth Vihar', 'Vasundhara', 'Mohan Nagar'],
  },
  {
    city: 'Noida',
    state: 'Uttar Pradesh',
    areas: ['Sector 50', 'Sector 75', 'Sector 137', 'Sector 150', 'Sector 62', 'Sector 78', 'Sector 100', 'Sector 128'],
  },
  {
    city: 'Gurugram',
    state: 'Haryana',
    areas: ['Golf Course Road', 'Sector 56', 'Sohna Road', 'DLF Phase 3', 'New Gurgaon', 'Sector 57', 'Palam Vihar', 'Golf Course Extension Road'],
  },
  {
    city: 'Delhi',
    state: 'Delhi',
    areas: ['Dwarka', 'Rohini', 'Vasant Kunj', 'Saket', 'Mayur Vihar', 'Lajpat Nagar', 'Pitampura', 'Janakpuri'],
  },
  {
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    areas: ['Alpha 1', 'Pari Chowk', 'Chi 5', 'Techzone 4', 'Knowledge Park', 'Beta 2', 'Zeta 1', 'Omicron 3'],
  },
];

const propertyTypes = ['Apartment', 'Villa', 'House', 'Flat', 'Plot'];
const imageUrls = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
];
const agents = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '9876501201' },
  { name: 'Meera Kapoor', email: 'meera.kapoor@example.com', phone: '9876501202' },
  { name: 'Kabir Verma', email: 'kabir.verma@example.com', phone: '9876501203' },
  { name: 'Ananya Singh', email: 'ananya.singh@example.com', phone: '9876501204' },
  { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', phone: '9876501205' },
];

const sampleProperties = cities.flatMap(({ city, state, areas }, cityIndex) =>
  areas.map((areaName, areaIndex) => {
    const index = cityIndex * areas.length + areaIndex;
    const propertyType = propertyTypes[index % propertyTypes.length];
    const listingType = index % 2 === 0 ? 'Sale' : 'Rent';
    const bedrooms = index % 6;

    return {
      isSample: true,
      title: `${bedrooms === 0 ? 'Studio' : `${bedrooms} BHK`} ${propertyType} in ${areaName}`,
      description: `Well-maintained ${propertyType.toLowerCase()} in ${areaName}, ${city}, with convenient access to local markets, schools, and public transport.`,
      price: listingType === 'Sale'
        ? 2000000 + (index / 2) * 2500000
        : 8000 + Math.floor(index / 2) * 7000,
      location: areaName,
      city,
      state,
      propertyType,
      listingType,
      bedrooms,
      bathrooms: (index % 4) + 1,
      area: 500 + index * 75,
      image: imageUrls[index % imageUrls.length],
      images: [imageUrls[index % imageUrls.length]],
      amenities: ['Parking', 'Power backup'],
      features: ['Close to public transport', 'Gated community'],
      agent: agents[index % agents.length],
    };
  })
);

module.exports = sampleProperties;
