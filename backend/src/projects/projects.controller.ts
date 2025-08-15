import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectQueryDto } from "./dto/project-query.dto";

@ApiTags("Projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: "Get all projects" })
  @ApiResponse({ status: 200, description: "Projects retrieved successfully" })
  findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  @ApiResponse({ status: 200, description: "Project retrieved successfully" })
  @ApiResponse({ status: 404, description: "Project not found" })
  findOne(@Param("id") id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new project" })
  @ApiResponse({ status: 201, description: "Project created successfully" })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update project" })
  @ApiResponse({ status: 200, description: "Project updated successfully" })
  update(@Param("id") id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete project" })
  @ApiResponse({ status: 200, description: "Project deleted successfully" })
  remove(@Param("id") id: string) {
    return this.projectsService.remove(id);
  }
}
