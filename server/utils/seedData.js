import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import CityStop from '../models/CityStop.js';
import Activity from '../models/Activity.js';
import Budget from '../models/Budget.js';
import PackingItem from '../models/PackingItem.js';
import JournalNote from '../models/JournalNote.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Trip.deleteMany({});
    await CityStop.deleteMany({});
    await Activity.deleteMany({});
    await Budget.deleteMany({});
    await PackingItem.deleteMany({});
    await JournalNote.deleteMany({});

    // Create users
    const users = await User.create([
      { name: 'Demo User', email: 'demo@traveloop.com', password: 'demo123', role: 'admin' },
      { name: 'Jane Explorer', email: 'jane@example.com', password: 'password123' },
      { name: 'Alex Wanderer', email: 'alex@example.com', password: 'password123' },
    ]);

    console.log('✅ Users created');

    // Create trips
    const trips = await Trip.create([
      {
        user: users[0]._id, title: 'European Summer Adventure',
        description: 'A 3-week journey through the most beautiful cities in Europe',
        startDate: new Date('2025-07-01'), endDate: new Date('2025-07-21'),
        travelStyle: 'cultural', status: 'planning', cityCount: 4, totalBudget: 5000,
        coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      },
      {
        user: users[0]._id, title: 'Southeast Asia Backpacking',
        description: 'Budget-friendly adventure through SE Asia',
        startDate: new Date('2025-09-15'), endDate: new Date('2025-10-15'),
        travelStyle: 'backpacking', status: 'planning', cityCount: 3, totalBudget: 2000,
        coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      },
      {
        user: users[0]._id, title: 'Tokyo Cherry Blossom Trip',
        description: 'Experience cherry blossom season in Japan',
        startDate: new Date('2025-04-01'), endDate: new Date('2025-04-10'),
        travelStyle: 'cultural', status: 'completed', cityCount: 2, totalBudget: 3500,
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      },
      {
        user: users[1]._id, title: 'Maldives Honeymoon',
        description: 'Romantic getaway to the Maldives',
        startDate: new Date('2025-12-20'), endDate: new Date('2025-12-30'),
        travelStyle: 'romantic', status: 'planning', cityCount: 1, totalBudget: 8000,
        coverImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      },
      {
        user: users[2]._id, title: 'Dubai Luxury Weekend',
        description: 'A luxurious long weekend in Dubai',
        startDate: new Date('2025-11-05'), endDate: new Date('2025-11-09'),
        travelStyle: 'luxury', status: 'planning', cityCount: 1, totalBudget: 4000,
        coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      },
    ]);

    console.log('✅ Trips created');

    // Create city stops for first trip
    const cityStops = await CityStop.create([
      { trip: trips[0]._id, cityName: 'Paris', country: 'France', order: 0, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', startDate: new Date('2025-07-01'), endDate: new Date('2025-07-06'), estimatedCost: 1200, popularity: 98, costIndex: '$$$' },
      { trip: trips[0]._id, cityName: 'Rome', country: 'Italy', order: 1, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', startDate: new Date('2025-07-07'), endDate: new Date('2025-07-12'), estimatedCost: 1000, popularity: 93, costIndex: '$$$' },
      { trip: trips[0]._id, cityName: 'Barcelona', country: 'Spain', order: 2, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400', startDate: new Date('2025-07-13'), endDate: new Date('2025-07-17'), estimatedCost: 800, popularity: 92, costIndex: '$$' },
      { trip: trips[0]._id, cityName: 'Amsterdam', country: 'Netherlands', order: 3, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400', startDate: new Date('2025-07-18'), endDate: new Date('2025-07-21'), estimatedCost: 900, popularity: 88, costIndex: '$$$' },
      { trip: trips[1]._id, cityName: 'Bangkok', country: 'Thailand', order: 0, image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400', startDate: new Date('2025-09-15'), endDate: new Date('2025-09-25'), estimatedCost: 400, popularity: 90, costIndex: '$' },
      { trip: trips[1]._id, cityName: 'Bali', country: 'Indonesia', order: 1, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', startDate: new Date('2025-09-26'), endDate: new Date('2025-10-05'), estimatedCost: 500, popularity: 94, costIndex: '$' },
      { trip: trips[1]._id, cityName: 'Singapore', country: 'Singapore', order: 2, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400', startDate: new Date('2025-10-06'), endDate: new Date('2025-10-15'), estimatedCost: 800, popularity: 90, costIndex: '$$$' },
    ]);

    console.log('✅ City stops created');

    // Create activities
    await Activity.create([
      { cityStop: cityStops[0]._id, name: 'Eiffel Tower Visit', category: 'sightseeing', cost: 25, duration: '2-3 hours', rating: 4.8, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=400' },
      { cityStop: cityStops[0]._id, name: 'Louvre Museum', category: 'culture', cost: 17, duration: '3-4 hours', rating: 4.9 },
      { cityStop: cityStops[0]._id, name: 'Seine River Cruise', category: 'sightseeing', cost: 15, duration: '1-2 hours', rating: 4.6 },
      { cityStop: cityStops[0]._id, name: 'French Wine Tasting', category: 'food', cost: 45, duration: '2-3 hours', rating: 4.7 },
      { cityStop: cityStops[1]._id, name: 'Colosseum Tour', category: 'sightseeing', cost: 20, duration: '2-3 hours', rating: 4.8, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
      { cityStop: cityStops[1]._id, name: 'Vatican Museums', category: 'culture', cost: 17, duration: '3-4 hours', rating: 4.9 },
      { cityStop: cityStops[1]._id, name: 'Pasta Making Class', category: 'food', cost: 60, duration: '2-3 hours', rating: 4.8 },
      { cityStop: cityStops[2]._id, name: 'Sagrada Familia', category: 'sightseeing', cost: 26, duration: '2-3 hours', rating: 4.9 },
      { cityStop: cityStops[2]._id, name: 'La Boqueria Market', category: 'food', cost: 0, duration: '1-2 hours', rating: 4.5 },
      { cityStop: cityStops[4]._id, name: 'Grand Palace Visit', category: 'sightseeing', cost: 15, duration: '2-3 hours', rating: 4.7 },
      { cityStop: cityStops[4]._id, name: 'Street Food Tour', category: 'food', cost: 30, duration: '3-4 hours', rating: 4.9 },
      { cityStop: cityStops[5]._id, name: 'Scuba Diving', category: 'adventure', cost: 80, duration: '3-4 hours', rating: 4.7 },
      { cityStop: cityStops[5]._id, name: 'Rice Terrace Hike', category: 'nature', cost: 10, duration: '4-6 hours', rating: 4.8 },
      { cityStop: cityStops[5]._id, name: 'Balinese Spa', category: 'wellness', cost: 30, duration: '2-3 hours', rating: 4.6 },
    ]);

    console.log('✅ Activities created');

    // Create budgets
    await Budget.create([
      { trip: trips[0]._id, transport: 800, hotels: 2000, food: 1000, activities: 500, miscellaneous: 200, totalBudget: 5000, currency: 'USD', dailyBudget: 238 },
      { trip: trips[1]._id, transport: 400, hotels: 600, food: 500, activities: 300, miscellaneous: 200, totalBudget: 2000, currency: 'USD', dailyBudget: 67 },
    ]);

    console.log('✅ Budgets created');

    // Create packing items
    await PackingItem.create([
      { trip: trips[0]._id, name: 'Passport', category: 'documents', isPacked: true },
      { trip: trips[0]._id, name: 'Travel Insurance', category: 'documents', isPacked: true },
      { trip: trips[0]._id, name: 'Flight Tickets', category: 'documents', isPacked: false },
      { trip: trips[0]._id, name: 'T-shirts (5)', category: 'clothes', isPacked: false },
      { trip: trips[0]._id, name: 'Jeans (2)', category: 'clothes', isPacked: false },
      { trip: trips[0]._id, name: 'Jacket', category: 'clothes', isPacked: false },
      { trip: trips[0]._id, name: 'Phone Charger', category: 'electronics', isPacked: true },
      { trip: trips[0]._id, name: 'Power Bank', category: 'electronics', isPacked: false },
      { trip: trips[0]._id, name: 'Camera', category: 'electronics', isPacked: false },
      { trip: trips[0]._id, name: 'Sunscreen', category: 'toiletries', isPacked: false },
      { trip: trips[0]._id, name: 'Toothbrush', category: 'toiletries', isPacked: false },
    ]);

    console.log('✅ Packing items created');

    // Create journal notes
    await JournalNote.create([
      { trip: trips[2]._id, title: 'Arrival in Tokyo!', content: 'Finally arrived in Tokyo after a long flight. The city is absolutely stunning even from the airport. Can\'t wait to explore!', mood: 'excited', date: new Date('2025-04-01') },
      { trip: trips[2]._id, title: 'Cherry Blossoms!', content: 'Visited Ueno Park today. The cherry blossoms are in full bloom. It\'s even more beautiful than I imagined. Had a wonderful hanami picnic.', mood: 'happy', date: new Date('2025-04-03') },
      { trip: trips[2]._id, title: 'Kyoto Day Trip', content: 'Took the shinkansen to Kyoto. Visited Fushimi Inari Shrine - the thousand torii gates are breathtaking. Wore a traditional kimono.', mood: 'adventurous', date: new Date('2025-04-05') },
    ]);

    console.log('✅ Journal notes created');
    console.log('\n🎉 Seed data complete!');
    console.log('\n📧 Login: demo@traveloop.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
