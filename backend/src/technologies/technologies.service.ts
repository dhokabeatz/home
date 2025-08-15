import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTechnologyDto } from "./dto/create-technology.dto";
import { UpdateTechnologyDto } from "./dto/update-technology.dto";

@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { isActive?: boolean }) {
    const where: any = {};

    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const technologies = await this.prisma.technology.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return {
      technologies,
      total: technologies.length,
    };
  }

  async create(createTechnologyDto: CreateTechnologyDto) {
    return this.prisma.technology.create({
      data: createTechnologyDto,
    });
  }

  async update(id: string, updateTechnologyDto: UpdateTechnologyDto) {
    const technology = await this.prisma.technology.findUnique({
      where: { id },
    });

    if (!technology) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    return this.prisma.technology.update({
      where: { id },
      data: updateTechnologyDto,
    });
  }

  async remove(id: string) {
    const technology = await this.prisma.technology.findUnique({
      where: { id },
    });

    if (!technology) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    await this.prisma.technology.delete({
      where: { id },
    });

    return { message: "Technology deleted successfully" };
  }
}
