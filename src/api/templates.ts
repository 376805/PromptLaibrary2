import express, { Request, Response } from 'express';
//@ts-ignore
import { databaseService } from '../services/databaseService';
import { Template } from '../types';

export const router = express.Router();

// Get all templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const templates = await databaseService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create template
router.post('/', async (req: Request<{}, {}, Template>, res: Response) => {
  try {
    const template = await databaseService.createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/:id', async (req: Request<{ id: string }, {}, Template>, res: Response) => {
  try {
    const template = await databaseService.updateTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    await databaseService.deleteTemplate(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router; 