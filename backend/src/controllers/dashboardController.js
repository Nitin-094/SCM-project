import mongoose from "mongoose";

import Task from "../models/Task.js";

const countsByKey = (items, defaults) => {
  const output = { ...defaults };
  items.forEach((item) => {
    output[item._id] = item.count;
  });
  return output;
};

export const getDashboardStats = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const filter = {
      $or: [{ createdBy: userObjectId }, { assignedTo: userObjectId }],
    };

    const [totalTasks, statusStats, priorityStats] = await Promise.all([
      Task.countDocuments(filter),
      Task.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: filter }, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
    ]);

    return res.json({
      totalTasks,
      byStatus: countsByKey(statusStats, { "To Do": 0, "In Progress": 0, Done: 0 }),
      byPriority: countsByKey(priorityStats, { Low: 0, Medium: 0, High: 0 }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load dashboard stats.", error: error.message });
  }
};
