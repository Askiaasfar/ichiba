import { MarketplaceCategory } from '../types/marketplace';

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics & Technology',
    slug: 'electronics-technology',
    iconName: 'Laptop',
    description: 'Computers, audio systems, smart gadgets, televisions, and computing accessories',
    listingType: 'physical',
    isActive: true,
    order: 1,
    subcategories: [
      'Smartphones',
      'Mobile phones',
      'Tablets',
      'Laptops',
      'Desktop computers',
      'Computer accessories',
      'Gaming consoles',
      'Gaming accessories',
      'Televisions',
      'Audio equipment',
      'Headphones & earbuds',
      'Cameras & photography',
      'Smartwatches',
      'Networking equipment',
      'Printers & scanners',
      'Computer components',
      'Storage devices',
      'Electronic accessories',
      'Smart home devices',
      'Software & digital products'
    ],
    attributeDefinitions: [
      { name: 'brand', label: 'Brand / Manufacturer', type: 'text', required: true },
      { name: 'model', label: 'Model Number / Name', type: 'text', required: false },
      { name: 'condition', label: 'Item Condition', type: 'select', options: ['Brand New', 'Open Box', 'Refurbished', 'Foreign Used'], required: true },
      { name: 'ram', label: 'RAM Memory', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB', 'N/A'], required: false },
      { name: 'storage', label: 'Internal Storage', type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB', 'N/A'], required: false },
      { name: 'warranty', label: 'Warranty Period', type: 'select', options: ['No Warranty', '3 Months', '6 Months', '12 Months', '24 Months'], required: false }
    ]
  },
  {
    id: 'cat-fashion',
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    iconName: 'Shirt',
    description: 'Men, women, and children clothing, bespoke cultural apparel, footwear, and accessories',
    listingType: 'physical',
    isActive: true,
    order: 2,
    subcategories: [
      "Men's clothing",
      "Women's clothing",
      "Children's clothing",
      'Traditional & cultural clothing',
      'Hausa fashion',
      'Abayas & modest fashion',
      'Dresses',
      'Shirts',
      'Trousers',
      'Jeans',
      'Shoes',
      'Sneakers',
      'Sandals',
      'Bags',
      'Watches',
      'Jewelry',
      'Accessories',
      'Fabrics & textiles',
      'Tailoring materials',
      'Sportswear',
      'Underwear',
      'Bridal fashion'
    ],
    attributeDefinitions: [
      { name: 'gender', label: 'Target Audience', type: 'select', options: ['Men', 'Women', 'Unisex', 'Kids / Boys', 'Kids / Girls'], required: true },
      { name: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom / Tailored', 'Free Size'], required: true },
      { name: 'color', label: 'Primary Color', type: 'text', required: true },
      { name: 'material', label: 'Material / Fabric', type: 'text', required: false },
      { name: 'brand', label: 'Designer / Brand', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-home-furniture',
    name: 'Home, Furniture & Living',
    slug: 'home-furniture-living',
    iconName: 'Armchair',
    description: 'Living room furniture, bedroom suites, kitchen equipment, decor, and domestic fittings',
    listingType: 'physical',
    isActive: true,
    order: 3,
    subcategories: [
      'Furniture',
      'Sofas',
      'Beds & mattresses',
      'Tables & chairs',
      'Wardrobes',
      'Kitchen equipment',
      'Kitchenware',
      'Home decorations',
      'Lighting',
      'Bedding',
      'Curtains',
      'Carpets',
      'Storage',
      'Cleaning equipment',
      'Home improvement',
      'Bathroom products',
      'Household appliances'
    ],
    attributeDefinitions: [
      { name: 'material', label: 'Primary Material', type: 'select', options: ['Solid Wood', 'Engineered Wood / MDF', 'Metal / Steel', 'Leather', 'Fabric', 'Glass', 'Plastic'], required: false },
      { name: 'condition', label: 'Condition', type: 'select', options: ['Brand New', 'Refurbished', 'Locally Used'], required: true },
      { name: 'dimensions', label: 'Dimensions / Dimensions (LxWxH)', type: 'text', required: false },
      { name: 'color', label: 'Color / Finish', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-phones-accessories',
    name: 'Phones & Accessories',
    slug: 'phones-accessories',
    iconName: 'Smartphone',
    description: 'Smartphones, feature phones, high-speed chargers, power banks, and replacement parts',
    listingType: 'physical',
    isActive: true,
    order: 4,
    subcategories: [
      'Android phones',
      'iPhones',
      'Used phones',
      'Refurbished phones',
      'Phone cases',
      'Chargers',
      'Power banks',
      'Screen protectors',
      'Earphones',
      'Phone repair parts',
      'Phone accessories'
    ],
    attributeDefinitions: [
      { name: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Transsion (Tecno/Infinix/Itel)', 'Xiaomi / Redmi', 'Google Pixel', 'Huawei', 'Other'], required: true },
      { name: 'model', label: 'Model Name', type: 'text', required: true },
      { name: 'storage', label: 'Internal Storage', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], required: true },
      { name: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], required: false },
      { name: 'condition', label: 'Condition', type: 'select', options: ['Brand New (Factory Sealed)', 'Open Box', 'UK / Foreign Used', 'Locally Used'], required: true },
      { name: 'batteryHealth', label: 'Battery Health / Capacity', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-beauty-health',
    name: 'Beauty, Personal Care & Health',
    slug: 'beauty-personal-care-health',
    iconName: 'Sparkles',
    description: 'Skincare, haircare, fragrances, wellness equipment, grooming, and cosmetics',
    listingType: 'physical',
    isActive: true,
    order: 5,
    subcategories: [
      'Skincare',
      'Haircare',
      'Cosmetics',
      'Perfumes',
      'Makeup',
      'Grooming equipment',
      'Beauty accessories',
      'Personal hygiene',
      'Fitness equipment',
      'General wellness products'
    ],
    attributeDefinitions: [
      { name: 'brand', label: 'Brand', type: 'text', required: true },
      { name: 'skinType', label: 'Skin / Hair Type', type: 'select', options: ['All Skin Types', 'Oily Skin', 'Dry Skin', 'Combination', 'Sensitive Skin', 'Natural Hair'], required: false },
      { name: 'volume', label: 'Volume / Net Weight', type: 'text', required: false },
      { name: 'formulation', label: 'Formulation', type: 'select', options: ['Cream', 'Serum', 'Oil', 'Liquid', 'Powder', 'Balm', 'Solid Device'], required: false }
    ]
  },
  {
    id: 'cat-vehicles-automotive',
    name: 'Automotive & Vehicles',
    slug: 'automotive-vehicles',
    iconName: 'Car',
    description: 'Automobiles, commercial trucks, bikes, tricycles, genuine replacement parts, and maintenance tools',
    listingType: 'classified',
    isActive: true,
    order: 6,
    subcategories: [
      'Cars',
      'SUVs',
      'Trucks',
      'Buses',
      'Motorcycles',
      'Tricycles',
      'Commercial vehicles',
      'Vehicle parts',
      'Tires',
      'Batteries',
      'Car accessories',
      'Automotive tools',
      'Vehicle maintenance equipment'
    ],
    attributeDefinitions: [
      { name: 'make', label: 'Vehicle Make', type: 'text', required: true },
      { name: 'model', label: 'Vehicle Model', type: 'text', required: true },
      { name: 'year', label: 'Year of Manufacture', type: 'number', required: true },
      { name: 'transmission', label: 'Transmission', type: 'select', options: ['Automatic', 'Manual', 'CVT', 'Dual Clutch'], required: true },
      { name: 'fuelType', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG (Compressed Natural Gas)'], required: true },
      { name: 'mileage', label: 'Mileage (Kilometers)', type: 'number', required: false },
      { name: 'condition', label: 'Vehicle Condition', type: 'select', options: ['Brand New', 'Foreign Used (Tokunbo)', 'Nigerian Used'], required: true },
      { name: 'registered', label: 'Registered in Nigeria', type: 'select', options: ['Yes', 'No (Customs Cleared)'], required: false }
    ]
  },
  {
    id: 'cat-real-estate',
    name: 'Real Estate & Property',
    slug: 'real-estate-property',
    iconName: 'Building',
    description: 'Residential houses, rental apartments, commercial lands, warehouses, offices, and short-lets',
    listingType: 'real_estate',
    isActive: true,
    order: 7,
    subcategories: [
      'Houses for sale',
      'Houses for rent',
      'Apartments',
      'Land for sale',
      'Commercial property',
      'Offices',
      'Shops',
      'Warehouses',
      'Short-let properties',
      'Property development listings'
    ],
    attributeDefinitions: [
      { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Duplex', 'Flat / Apartment', 'Terrace', 'Bungalow', 'Commercial Building', 'Plot of Land', 'Warehouse'], required: true },
      { name: 'transactionType', label: 'Listing Purpose', type: 'select', options: ['For Sale', 'For Rent', 'Short-Let / Daily', 'Joint Venture'], required: true },
      { name: 'bedrooms', label: 'Number of Bedrooms', type: 'select', options: ['Self-Contain / Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5+ Bedrooms', 'N/A (Land)'], required: true },
      { name: 'bathrooms', label: 'Number of Bathrooms', type: 'select', options: ['1', '2', '3', '4', '5+', 'N/A'], required: false },
      { name: 'furnishing', label: 'Furnishing Status', type: 'select', options: ['Furnished', 'Semi-Furnished', 'Unfurnished'], required: false },
      { name: 'landSize', label: 'Land Size / Plot Area (sqm)', type: 'text', required: false },
      { name: 'documentTitle', label: 'Title Documents', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-agriculture',
    name: 'Agriculture & Farming',
    slug: 'agriculture-farming',
    iconName: 'Sprout',
    description: 'Farm produce, bulk grains, livestock, fertilizers, agricultural machinery, and farming supplies',
    listingType: 'physical',
    isActive: true,
    order: 8,
    subcategories: [
      'Farm produce',
      'Grains',
      'Rice',
      'Maize',
      'Beans',
      'Livestock',
      'Poultry',
      'Fish farming',
      'Seeds',
      'Fertilizers',
      'Farming tools',
      'Irrigation equipment',
      'Agricultural machinery',
      'Animal feed',
      'Farm supplies'
    ],
    attributeDefinitions: [
      { name: 'quantityAvailable', label: 'Available Quantity', type: 'text', required: true },
      { name: 'measurementUnit', label: 'Unit of Measure', type: 'select', options: ['50kg Bag', '100kg Bag', 'Tonne', 'Per Head / Animal', 'Crate', 'Kg', 'Litre'], required: true },
      { name: 'originState', label: 'Farm Origin Location', type: 'text', required: true },
      { name: 'organicStatus', label: 'Cultivation Type', type: 'select', options: ['Naturally Grown / Organic', 'Standard Commercial', 'Hydroponic / Greenhouse'], required: false }
    ]
  },
  {
    id: 'cat-food-beverages',
    name: 'Food & Beverages',
    slug: 'food-beverages',
    iconName: 'Utensils',
    description: 'Packaged foods, wholesale groceries, cooking ingredients, bakery supplies, and catering items',
    listingType: 'physical',
    isActive: true,
    order: 9,
    subcategories: [
      'Groceries',
      'Packaged food',
      'Fresh produce',
      'Meat & fish',
      'Snacks',
      'Bakery products',
      'Cooking ingredients',
      'Food supplies',
      'Restaurant & catering supplies'
    ],
    attributeDefinitions: [
      { name: 'packaging', label: 'Packaging Type', type: 'select', options: ['Carton / Bulk', 'Retail Pack', 'Tin / Can', 'Bottle', 'Bag / Sack'], required: true },
      { name: 'shelfLife', label: 'Expiry / Shelf Life', type: 'text', required: false },
      { name: 'nafdacNumber', label: 'NAFDAC Reg No. (if applicable)', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-industrial-equipment',
    name: 'Industrial & Commercial Equipment',
    slug: 'industrial-commercial-equipment',
    iconName: 'Wrench',
    description: 'Manufacturing machines, diesel industrial generators, construction equipment, and workshop tools',
    listingType: 'physical',
    isActive: true,
    order: 10,
    subcategories: [
      'Manufacturing equipment',
      'Construction machinery',
      'Industrial tools',
      'Generators',
      'Welding equipment',
      'Electrical equipment',
      'Plumbing equipment',
      'Workshop tools',
      'Commercial kitchen equipment',
      'Warehouse equipment',
      'Packaging machinery',
      'Business supplies'
    ],
    attributeDefinitions: [
      { name: 'equipmentType', label: 'Equipment Category', type: 'text', required: true },
      { name: 'manufacturer', label: 'Manufacturer / Brand', type: 'text', required: true },
      { name: 'capacity', label: 'Output Capacity / Power Rating (kVA/kW/HP)', type: 'text', required: false },
      { name: 'condition', label: 'Condition', type: 'select', options: ['Brand New', 'Factory Refurbished', 'Working Tested Used'], required: true }
    ]
  },
  {
    id: 'cat-solar-power',
    name: 'Solar, Power & Electrical',
    slug: 'solar-power-electrical',
    iconName: 'Sun',
    description: 'Tier-1 solar panels, hybrid inverters, lithium batteries, charge controllers, and cabling',
    listingType: 'physical',
    isActive: true,
    order: 11,
    subcategories: [
      'Solar panels',
      'Inverters',
      'Batteries',
      'Solar generators',
      'Solar lights',
      'Charge controllers',
      'Electrical wiring',
      'Electrical components',
      'Generators',
      'Power accessories',
      'Installation equipment'
    ],
    attributeDefinitions: [
      { name: 'powerRating', label: 'Power Rating (Watts / kVA)', type: 'text', required: true },
      { name: 'batteryTechnology', label: 'Battery Chemistry (if applicable)', type: 'select', options: ['Lithium LiFePO4', 'Tubular Gel', 'Deep Cycle AGM', 'Lead Acid', 'N/A'], required: false },
      { name: 'voltage', label: 'System Voltage', type: 'select', options: ['12V', '24V', '48V', '96V', '220V/240V AC'], required: false },
      { name: 'warranty', label: 'Manufacturer Warranty', type: 'select', options: ['1 Year', '2 Years', '5 Years', '10 Years', '25 Years (Panels)'], required: true }
    ]
  },
  {
    id: 'cat-sports-fitness',
    name: 'Sports, Fitness & Outdoor',
    slug: 'sports-fitness-outdoor',
    iconName: 'Dumbbell',
    description: 'Commercial gym equipment, treadmills, sports kits, football gear, and outdoor activity items',
    listingType: 'physical',
    isActive: true,
    order: 12,
    subcategories: [
      'Gym equipment',
      'Sportswear',
      'Football equipment',
      'Basketball equipment',
      'Fitness accessories',
      'Camping equipment',
      'Outdoor furniture',
      'Bicycles',
      'Exercise equipment'
    ],
    attributeDefinitions: [
      { name: 'sportType', label: 'Sport / Activity', type: 'text', required: true },
      { name: 'condition', label: 'Condition', type: 'select', options: ['Brand New', 'Open Box', 'Used'], required: true }
    ]
  },
  {
    id: 'cat-baby-kids',
    name: 'Baby, Kids & Toys',
    slug: 'baby-kids-toys',
    iconName: 'Baby',
    description: 'Baby care essentials, cribs, strollers, kids apparel, and certified educational toys',
    listingType: 'physical',
    isActive: true,
    order: 13,
    subcategories: [
      'Baby clothing',
      'Baby care',
      'Baby furniture',
      'Toys',
      'Educational toys',
      'School supplies',
      "Children's shoes",
      'Strollers',
      'Feeding accessories'
    ],
    attributeDefinitions: [
      { name: 'ageGroup', label: 'Recommended Age', type: 'select', options: ['0-6 Months', '6-12 Months', '1-3 Years', '4-7 Years', '8-12 Years', 'Teens'], required: true },
      { name: 'condition', label: 'Condition', type: 'select', options: ['Brand New', 'Gentle Used'], required: true }
    ]
  },
  {
    id: 'cat-books-education',
    name: 'Books, Education & Office',
    slug: 'books-education-office',
    iconName: 'BookOpen',
    description: 'Textbooks, literature, stationery, professional development materials, and office printers',
    listingType: 'physical',
    isActive: true,
    order: 14,
    subcategories: [
      'Books',
      'Educational materials',
      'School supplies',
      'Office furniture',
      'Stationery',
      'Printers',
      'Office equipment',
      'Art supplies',
      'Learning tools'
    ],
    attributeDefinitions: [
      { name: 'format', label: 'Format / Binding', type: 'select', options: ['Paperback', 'Hardcover', 'Digital Download', 'Box Set'], required: true },
      { name: 'language', label: 'Language', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-arts-crafts',
    name: 'Arts, Crafts & Collectibles',
    slug: 'arts-crafts-collectibles',
    iconName: 'Palette',
    description: 'Authentic African artwork, handcrafted woodwork, cultural sculptures, and musical instruments',
    listingType: 'physical',
    isActive: true,
    order: 15,
    subcategories: [
      'Artwork',
      'Handmade products',
      'Crafts',
      'Musical instruments',
      'Collectibles',
      'Antiques',
      'Cultural products',
      'Handmade jewelry',
      'Art materials'
    ],
    attributeDefinitions: [
      { name: 'medium', label: 'Art Medium / Material', type: 'text', required: true },
      { name: 'artist', label: 'Artist / Craftsman Name', type: 'text', required: false },
      { name: 'origin', label: 'Region of Origin', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-services',
    name: 'Services & Skilled Trades',
    slug: 'services-trades',
    iconName: 'Briefcase',
    description: 'Verified professional repairs, plumbing, electrical installations, graphics, tech, and logistics',
    listingType: 'service',
    isActive: true,
    order: 16,
    subcategories: [
      'Repairs',
      'Electronics repair',
      'Plumbing',
      'Electrical services',
      'Cleaning',
      'Tailoring',
      'Graphic design',
      'Web development',
      'Photography',
      'Event services',
      'Logistics',
      'Moving services',
      'Construction',
      'Professional services'
    ],
    attributeDefinitions: [
      { name: 'servicePricingModel', label: 'Pricing Model', type: 'select', options: ['Fixed Price', 'Hourly Rate', 'Daily Rate', 'Quote Upon Inspection'], required: true },
      { name: 'serviceDelivery', label: 'Service Location', type: 'select', options: ['On-site / Home Service', 'At Provider Workshop', 'Remote / Online'], required: true },
      { name: 'experienceYears', label: 'Years of Experience', type: 'text', required: false }
    ]
  },
  {
    id: 'cat-digital-products',
    name: 'Digital Products',
    slug: 'digital-products',
    iconName: 'FileCode',
    description: 'Lawful digital design assets, templates, e-books, creative audio, and software tools',
    listingType: 'digital',
    isActive: true,
    order: 17,
    subcategories: [
      'Templates',
      'Digital designs',
      'E-books',
      'Software',
      'Digital learning materials',
      'Creative assets'
    ],
    attributeDefinitions: [
      { name: 'fileFormat', label: 'Download Format (e.g. PDF, ZIP, PSD)', type: 'text', required: true },
      { name: 'licenseType', label: 'License Terms', type: 'select', options: ['Personal Use Only', 'Commercial License', 'Resale Rights'], required: true }
    ]
  },
  {
    id: 'cat-other',
    name: 'Other Categories',
    slug: 'other-categories',
    iconName: 'Layers',
    description: 'Controlled marketplace listings for legitimate items that span multiple specialty fields',
    listingType: 'physical',
    isActive: true,
    order: 18,
    subcategories: [
      'Specialty items',
      'Commercial supplies',
      'Miscellaneous verified goods'
    ],
    attributeDefinitions: [
      { name: 'itemType', label: 'Item Specific Type', type: 'text', required: true },
      { name: 'condition', label: 'Condition', type: 'select', options: ['Brand New', 'Used', 'Refurbished'], required: true }
    ]
  }
];

export const ALL_CATEGORY_NAMES = MARKETPLACE_CATEGORIES.map((c) => c.name);
