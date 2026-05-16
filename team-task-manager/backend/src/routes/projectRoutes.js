import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { canAccessProject } from '../middleware/projectAccess.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? {}
      : { $or: [{ createdBy: req.user._id }, { members: req.user._id }] };

  const projects = await Project.find(filter)
    .populate('createdBy', 'name email')
    .populate('members', 'name email')
    .sort('-createdAt');

  res.json(projects);
});

router.post(
  '/',
  adminOnly,
  [body('name').trim().notEmpty(), body('description').optional().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description || '',
      createdBy: req.user._id,
      members: req.body.members || [],
    });

    await project.populate(['createdBy', 'members']);
    res.status(201).json(project);
  }
);

router.get('/:id', canAccessProject, async (req, res) => {
  await req.project.populate(['createdBy', 'members']);
  res.json(req.project);
});

router.put('/:id', canAccessProject, async (req, res) => {
  if (req.user.role !== 'admin' && req.project.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only admin or project owner can update' });
  }

  const { name, description, members } = req.body;
  if (name) req.project.name = name;
  if (description !== undefined) req.project.description = description;
  if (members) req.project.members = members;

  await req.project.save();
  await req.project.populate(['createdBy', 'members']);
  res.json(req.project);
});

router.delete('/:id', adminOnly, canAccessProject, async (req, res) => {
  await req.project.deleteOne();
  res.json({ message: 'Project deleted' });
});

export default router;
