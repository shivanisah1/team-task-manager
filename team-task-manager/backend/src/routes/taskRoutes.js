import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

const userCanAccessProject = async (user, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const userId = user._id.toString();
  const allowed =
    user.role === 'admin' ||
    project.createdBy.toString() === userId ||
    project.members.some((m) => m.toString() === userId);
  return allowed ? project : null;
};

router.get('/', async (req, res) => {
  const { projectId, status, assignedTo } = req.query;
  let projectIds = [];

  if (projectId) {
    const project = await userCanAccessProject(req.user, projectId);
    if (!project) return res.status(403).json({ message: 'No access' });
    projectIds = [projectId];
  } else {
    const filter =
      req.user.role === 'admin'
        ? {}
        : { $or: [{ createdBy: req.user._id }, { members: req.user._id }] };
    const projects = await Project.find(filter).select('_id');
    projectIds = projects.map((p) => p._id);
  }

  const query = { project: { $in: projectIds } };
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name')
    .sort('-createdAt');

  res.json(tasks);
});

router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('project').notEmpty(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await userCanAccessProject(req.user, req.body.project);
    if (!project) return res.status(403).json({ message: 'No access to project' });

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || null,
      project: req.body.project,
      assignedTo: req.body.assignedTo || null,
      createdBy: req.user._id,
    });

    await task.populate(['assignedTo', 'createdBy', 'project']);
    res.status(201).json(task);
  }
);

router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name');

  if (!task) return res.status(404).json({ message: 'Task not found' });

  const project = await userCanAccessProject(req.user, task.project._id);
  if (!project) return res.status(403).json({ message: 'No access' });

  res.json(task);
});

router.put('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const project = await userCanAccessProject(req.user, task.project);
  if (!project) return res.status(403).json({ message: 'No access' });

  const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
  const canEdit = req.user.role === 'admin' || isAssignee || req.user.role === 'admin';

  if (!canEdit && req.user.role === 'member') {
    const allowedFields = ['status'];
    const keys = Object.keys(req.body);
    if (keys.some((k) => !allowedFields.includes(k))) {
      return res.status(403).json({ message: 'Members can only update status on assigned tasks' });
    }
    if (!isAssignee) return res.status(403).json({ message: 'Not assigned to this task' });
  }

  const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });

  await task.save();
  await task.populate(['assignedTo', 'createdBy', 'project']);
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const project = await userCanAccessProject(req.user, task.project);
  if (!project) return res.status(403).json({ message: 'No access' });

  if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only admin or creator can delete' });
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

export default router;
