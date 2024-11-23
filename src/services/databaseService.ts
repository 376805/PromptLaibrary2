import { Template } from '../types';

class DatabaseService {
  async getAllTemplates(): Promise<Template[]> {
    return [];
  }

  async createTemplate(template: Template): Promise<Template> {
    return template;
  }

  async updateTemplate(id: string, template: Template): Promise<Template> {
    return template;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return true;
  }
}

export const databaseService = new DatabaseService();
