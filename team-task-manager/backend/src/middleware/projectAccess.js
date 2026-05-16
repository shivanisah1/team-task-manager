import Project from '../models/Project.js';

export const canAccessProject = async (req, res, next) => {
  const project = await Project.findById(req.params.projectId || req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const userId = req.user._id.toString();
  const isMember =
    project.createdBy.toString() === userId ||
    project.members.some((m) => m.toString() === userId);

  if (!isMember && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'No access to this project' });
  }

  req.project = project;
  next();
};
