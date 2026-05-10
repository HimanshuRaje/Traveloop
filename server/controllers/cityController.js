import CityStop from '../models/CityStop.js';
import Trip from '../models/Trip.js';
import AppError from '../utils/AppError.js';

// @desc    Add city stop to trip
// @route   POST /api/trips/:tripId/cities
export const addCityStop = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return next(new AppError('Trip not found', 404));
    if (trip.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

    const count = await CityStop.countDocuments({ trip: trip._id });

    const cityStop = await CityStop.create({
      trip: trip._id,
      ...req.body,
      order: req.body.order ?? count,
    });

    trip.cityCount = count + 1;
    await trip.save();

    res.status(201).json({ success: true, cityStop });
  } catch (error) {
    next(error);
  }
};

// @desc    Get city stops for trip
// @route   GET /api/trips/:tripId/cities
export const getCityStops = async (req, res, next) => {
  try {
    const cityStops = await CityStop.find({ trip: req.params.tripId }).sort('order');
    res.json({ success: true, cityStops });
  } catch (error) {
    next(error);
  }
};

// @desc    Update city stop
// @route   PUT /api/cities/:id
export const updateCityStop = async (req, res, next) => {
  try {
    const cityStop = await CityStop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cityStop) return next(new AppError('City stop not found', 404));

    res.json({ success: true, cityStop });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete city stop
// @route   DELETE /api/cities/:id
export const deleteCityStop = async (req, res, next) => {
  try {
    const cityStop = await CityStop.findById(req.params.id);
    if (!cityStop) return next(new AppError('City stop not found', 404));

    const trip = await Trip.findById(cityStop.trip);
    await CityStop.findByIdAndDelete(req.params.id);

    // Reorder remaining stops
    const remaining = await CityStop.find({ trip: cityStop.trip }).sort('order');
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].order = i;
      await remaining[i].save();
    }

    if (trip) {
      trip.cityCount = remaining.length;
      await trip.save();
    }

    res.json({ success: true, message: 'City stop deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder city stops
// @route   PUT /api/trips/:tripId/cities/reorder
export const reorderCityStops = async (req, res, next) => {
  try {
    const { orderedIds } = req.body; // Array of city stop IDs in new order
    for (let i = 0; i < orderedIds.length; i++) {
      await CityStop.findByIdAndUpdate(orderedIds[i], { order: i });
    }

    const cityStops = await CityStop.find({ trip: req.params.tripId }).sort('order');
    res.json({ success: true, cityStops });
  } catch (error) {
    next(error);
  }
};

// @desc    Search cities (from seed data)
// @route   GET /api/cities/search
export const searchCities = async (req, res, next) => {
  try {
    const { q, region } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { cityName: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } },
      ];
    }

    const cities = await CityStop.find(query).distinct('cityName');

    // Return from curated city data
    const curatedCities = getCuratedCities();
    let results = curatedCities;

    if (q) {
      results = curatedCities.filter(
        (c) =>
          c.cityName.toLowerCase().includes(q.toLowerCase()) ||
          c.country.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (region) {
      results = results.filter((c) => c.region === region);
    }

    res.json({ success: true, cities: results });
  } catch (error) {
    next(error);
  }
};

function getCuratedCities() {
  return [
    { cityName: 'Paris', country: 'France', region: 'Europe', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', popularity: 98, costIndex: '$$$' },
    { cityName: 'Tokyo', country: 'Japan', region: 'Asia', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', popularity: 95, costIndex: '$$$' },
    { cityName: 'New York', country: 'USA', region: 'North America', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', popularity: 97, costIndex: '$$$$' },
    { cityName: 'London', country: 'UK', region: 'Europe', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400', popularity: 96, costIndex: '$$$$' },
    { cityName: 'Rome', country: 'Italy', region: 'Europe', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', popularity: 93, costIndex: '$$$' },
    { cityName: 'Barcelona', country: 'Spain', region: 'Europe', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400', popularity: 92, costIndex: '$$' },
    { cityName: 'Dubai', country: 'UAE', region: 'Middle East', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', popularity: 91, costIndex: '$$$$' },
    { cityName: 'Bangkok', country: 'Thailand', region: 'Asia', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400', popularity: 90, costIndex: '$' },
    { cityName: 'Bali', country: 'Indonesia', region: 'Asia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', popularity: 94, costIndex: '$' },
    { cityName: 'Istanbul', country: 'Turkey', region: 'Europe', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400', popularity: 88, costIndex: '$$' },
    { cityName: 'Sydney', country: 'Australia', region: 'Oceania', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400', popularity: 89, costIndex: '$$$' },
    { cityName: 'Santorini', country: 'Greece', region: 'Europe', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400', popularity: 91, costIndex: '$$$' },
    { cityName: 'Kyoto', country: 'Japan', region: 'Asia', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', popularity: 87, costIndex: '$$$' },
    { cityName: 'Amsterdam', country: 'Netherlands', region: 'Europe', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400', popularity: 88, costIndex: '$$$' },
    { cityName: 'Marrakech', country: 'Morocco', region: 'Africa', image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400', popularity: 82, costIndex: '$' },
    { cityName: 'Prague', country: 'Czech Republic', region: 'Europe', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400', popularity: 85, costIndex: '$$' },
    { cityName: 'Lisbon', country: 'Portugal', region: 'Europe', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400', popularity: 86, costIndex: '$$' },
    { cityName: 'Seoul', country: 'South Korea', region: 'Asia', image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400', popularity: 84, costIndex: '$$' },
    { cityName: 'Cape Town', country: 'South Africa', region: 'Africa', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400', popularity: 83, costIndex: '$$' },
    { cityName: 'Rio de Janeiro', country: 'Brazil', region: 'South America', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400', popularity: 86, costIndex: '$$' },
    { cityName: 'Vienna', country: 'Austria', region: 'Europe', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400', popularity: 84, costIndex: '$$$' },
    { cityName: 'Singapore', country: 'Singapore', region: 'Asia', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400', popularity: 90, costIndex: '$$$' },
    { cityName: 'Maldives', country: 'Maldives', region: 'Asia', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400', popularity: 89, costIndex: '$$$$' },
    { cityName: 'Cancun', country: 'Mexico', region: 'North America', image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400', popularity: 85, costIndex: '$$' },
    { cityName: 'Swiss Alps', country: 'Switzerland', region: 'Europe', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400', popularity: 87, costIndex: '$$$$' },
  ];
}
