import mongoose from "mongoose";

import Task from "../models/Task.js";
import User from "../models/User.js";

const ownerFilter = (userId) => ({
  $or: [{ createdBy: userId }, { assignedTo: userId }],
});

const buildTaskPayload = async (body, fallbackAssigneeId) => {
  const payload = {
    title: body.title,
    description: body.description,
    status: body.status,
    priority: body.priority,
    assignedTo: body.assignedTo || fallbackAssigneeId,
  };

  if (!payload.assignedTo || !mongoose.Types.ObjectId.isValid(payload.assignedTo)) {
    return { error: "Valid assignedTo user id is required." };
  }

  const userExists = await User.exists({ _id: payload.assignedTo });
  if (!userExists) {
    return { error: "Assigned user not found." };
  }
  return { payload };
};

export const getTasks = async (req, res) => {
  try {
    const {
      q = "",
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const filters = ownerFilter(req.user.userId);

    if (status && ["To Do", "In Progress", "Done"].includes(status)) filters.status = status;
    if (priority && ["Low", "Medium", "High"].includes(priority)) filters.priority = priority;
    if (q.trim()) {
      filters.$and = [
        {
          $or: [
            { title: { $regex: q.trim(), $options: "i" } },
            { description: { $regex: q.trim(), $options: "i" } },
          ],
        },
      ];
    }

    const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 50);
    const skip = (parsedPage - 1) * parsedLimit;
    const sortableFields = new Set(["createdAt", "updatedAt", "priority", "status", "title"]);
    const finalSortBy = sortableFields.has(sortBy) ? sortBy : "createdAt";
    const finalSortOrder = sortOrder === "asc" ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(filters)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ [finalSortBy]: finalSortOrder })
        .skip(skip)
        .limit(parsedLimit),
      Task.countDocuments(filters),
    ]);

    return res.json({
      tasks,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.max(Math.ceil(total / parsedLimit), 1),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks.", error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { payload, error } = await buildTaskPayload(req.body, req.user.userId);
    if (error) return res.status(400).json({ message: error });
    if (!payload.title) return res.status(400).json({ message: "Task title is required." });

    const task = await Task.create({ ...payload, createdBy: req.user.userId });
    const populatedTask = await task.populate("assignedTo", "name email");
    await populatedTask.populate("createdBy", "name email");
    return res.status(201).json(populatedTask);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task.", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const task = await Task.findOne({ _id: id, ...ownerFilter(req.user.userId) });
    if (!task) return res.status(404).json({ message: "Task not found." });

    const { payload, error } = await buildTaskPayload(
      { ...task.toObject(), ...req.body },
      task.assignedTo.toString(),
    );
    if (error) return res.status(400).json({ message: error });

    task.title = payload.title;
    task.description = payload.description;
    task.status = payload.status;
    task.priority = payload.priority;
    task.assignedTo = payload.assignedTo;
    await task.save();

    const populatedTask = await task.populate("assignedTo", "name email");
    await populatedTask.populate("createdBy", "name email");
    return res.json(populatedTask);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task.", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, ...ownerFilter(req.user.userId) });
    if (!deletedTask) return res.status(404).json({ message: "Task not found." });
    return res.json({ message: "Task deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete task.", error: error.message });
  }
};
