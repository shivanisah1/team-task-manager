import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? {}
      : { $or: [{ createdBy: req.user._id }, { members: req.user._id }] };

  const projects = await Project.find(filter).select('_id');
  const projectIds = projects.map((p) => p._id);

  const taskFilter = { project: { $in: projectIds } };
  const now = new Date();

  const [total, todo, inProgress, done, overdue, myTasks] = await Promise.all([
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: 'todo' }),
    Task.countDocuments({ ...taskFilter, status: 'in_progress' }),
    Task.countDocuments({ ...taskFilter, status: 'done' }),
    Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: now },
      status: { $ne: 'done' },
    }),
    Task.countDocuments({ ...taskFilter, assignedTo: req.user._id }),
  ]);

  const recentTasks = await Task.find(taskFilter)
    .populate('assignedTo', 'name')
    .populate('project', 'name')
    .sort('-updatedAt')
    .limit(10);

  const overdueTasks = await Task.find({
    ...taskFilter,
    dueDate: { $lt: now },
    status: { $ne: 'done' },
  })
    .populate('assignedTo', 'name')
    .populate('project', 'name')
    .sort('dueDate')
    .limit(10);

  res.json({
    summary: { total, todo, inProgress, done, overdue, myTasks, projectCount: projectIds.length },
    recentTasks,
    overdueTasks,
  });
});

export default router;
