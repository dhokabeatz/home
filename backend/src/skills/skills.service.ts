import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillQueryDto } from './dto/skill-query.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: SkillQueryDto) {
    const { search, category, isActive, page = 1, limit = 10 } = query;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(category && { category }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany({
        where,
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.skill.count({ where }),
    ]);

    return {
      skills,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async create(createSkillDto: CreateSkillDto) {
    return this.prisma.skill.create({
      data: createSkillDto,
    });
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.skill.delete({
      where: { id },
    });
  }
}
