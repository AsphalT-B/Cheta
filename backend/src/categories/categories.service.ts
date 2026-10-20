import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const DEFAULT_CATEGORIES = ['Entertainment', 'Productivity', 'Cloud Storage', 'Health', 'Education', 'Other'];

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await Promise.all(DEFAULT_CATEGORIES.map((name) => this.prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })));
  }

  list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
  }
}
