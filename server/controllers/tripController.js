import Trip from '../models/Trip.js';
import CityStop from '../models/CityStop.js';
import Budget from '../models/Budget.js';
import PackingItem from '../models/PackingItem.js';
import JournalNote from '../models/JournalNote.js';
import SharedTrip from '../models/SharedTrip.js';
import AppError from '../utils/AppError.js';
import slugify from 'slugify';

// @desc    Create trip
// @route   POST /api/trips
export const createTrip = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, travelStyle } = req.body;

    const trip = await Trip.create({
      user: req.user.id,
      title,
      description,
      startDate,
      endDate,
      travelStyle,
      coverImage: req.file ? `/uploads/${req.file.filename}` : '',
    });

    // Create default budget
    await Budget.create({ trip: trip._id });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trips for user
// @route   GET /api/trips
export const getMyTrips = async (req, res, next) => {
  try {
    const { search, style, sort, status } = req.query;
    const query = { user: req.user.id };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (style) {
      query.travelStyle = style;
    }
    if (status) {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'budget') sortOption = { totalBudget: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const trips = await Trip.find(query).sort(sortOption);

    res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
export const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }
    if (trip.user.toString() !== req.user.id && !trip.isPublic) {
      return next(new AppError('Not authorized', 403));
    }

    const cityStops = await CityStop.find({ trip: trip._id }).sort('order');
    const budget = await Budget.findOne({ trip: trip._id });

    res.json({ success: true, trip, cityStops, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
export const updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }
    if (trip.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }
    if (trip.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    // Delete all related data
    const cityStops = await CityStop.find({ trip: trip._id });
    for (const stop of cityStops) {
      await Activity.deleteMany({ cityStop: stop._id });
    }
    await CityStop.deleteMany({ trip: trip._id });
    await Budget.deleteOne({ trip: trip._id });
    await PackingItem.deleteMany({ trip: trip._id });
    await JournalNote.deleteMany({ trip: trip._id });
    await SharedTrip.deleteMany({ trip: trip._id });
    await Trip.findByIdAndDelete(trip._id);

    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark
// @route   PUT /api/trips/:id/bookmark
export const toggleBookmark = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));

    trip.bookmarked = !trip.bookmarked;
    await trip.save();

    res.json({ success: true, bookmarked: trip.bookmarked });
  } catch (error) {
    next(error);
  }
};

// @desc    Share trip (generate public link)
// @route   POST /api/trips/:id/share
export const shareTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));
    if (trip.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

    const slug = slugify(trip.title, { lower: true }) + '-' + Date.now().toString(36);
    trip.isPublic = true;
    trip.shareSlug = slug;
    await trip.save();

    let shared = await SharedTrip.findOne({ trip: trip._id });
    if (!shared) {
      shared = await SharedTrip.create({
        trip: trip._id,
        shareSlug: slug,
        sharedBy: req.user.id,
      });
    } else {
      shared.shareSlug = slug;
      shared.isActive = true;
      await shared.save();
    }

    res.json({ success: true, shareSlug: slug, url: `/shared/${slug}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shared trip (public)
// @route   GET /api/trips/shared/:slug
export const getSharedTrip = async (req, res, next) => {
  try {
    const shared = await SharedTrip.findOne({ shareSlug: req.params.slug, isActive: true });
    if (!shared) return next(new AppError('Shared trip not found', 404));

    shared.views += 1;
    await shared.save();

    const trip = await Trip.findById(shared.trip).populate('user', 'name avatar');
    const cityStops = await CityStop.find({ trip: trip._id }).sort('order');
    const budget = await Budget.findOne({ trip: trip._id });

    res.json({ success: true, trip, cityStops, budget, views: shared.views });
  } catch (error) {
    next(error);
  }
};

// @desc    Copy shared trip
// @route   POST /api/trips/copy/:slug
export const copyTrip = async (req, res, next) => {
  try {
    const shared = await SharedTrip.findOne({ shareSlug: req.params.slug, isActive: true });
    if (!shared) return next(new AppError('Shared trip not found', 404));

    const originalTrip = await Trip.findById(shared.trip);
    const newTrip = await Trip.create({
      user: req.user.id,
      title: `${originalTrip.title} (Copy)`,
      description: originalTrip.description,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      travelStyle: originalTrip.travelStyle,
      coverImage: originalTrip.coverImage,
    });

    const originalStops = await CityStop.find({ trip: originalTrip._id }).sort('order');
    for (const stop of originalStops) {
      await CityStop.create({
        trip: newTrip._id,
        cityName: stop.cityName,
        country: stop.country,
        image: stop.image,
        order: stop.order,
        startDate: stop.startDate,
        endDate: stop.endDate,
        estimatedCost: stop.estimatedCost,
      });
    }

    await Budget.create({ trip: newTrip._id });

    res.status(201).json({ success: true, trip: newTrip });
  } catch (error) {
    next(error);
  }
};

import Activity from '../models/Activity.js';
