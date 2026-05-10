import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Activity from '../models/Activity.js';
import CityStop from '../models/CityStop.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const totalActivities = await Activity.countDocuments();

    const popularStyles = await Trip.aggregate([
      { $group: { _id: '$travelStyle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentUsers = await User.find().sort('-createdAt').limit(10).select('name email createdAt');
    const recentTrips = await Trip.find().sort('-createdAt').limit(10).populate('user', 'name');

    const tripsPerMonth = await Trip.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topCities = await CityStop.aggregate([
      { $group: { _id: '$cityName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalTrips, totalActivities, popularStyles, tripsPerMonth, topCities },
      recentUsers,
      recentTrips,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};
