import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMemberQueryDto } from './dto/team-member-query.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: TeamMemberQueryDto) {
    const { search, isActive, page = 1, limit = 10 } = query;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { role: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [teamMembers, total] = await Promise.all([
      this.prisma.teamMember.findMany({
        where,
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.teamMember.count({ where }),
    ]);

    return {
      teamMembers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    return teamMember;
  }

  async create(createTeamMemberDto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({
      data: createTeamMemberDto,
    });
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.teamMember.update({
      where: { id },
      data: updateTeamMemberDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.teamMember.delete({
      where: { id },
    });
  }
}
