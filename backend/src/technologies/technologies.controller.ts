import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TechnologiesService } from "./technologies.service";
import { CreateTechnologyDto } from "./dto/create-technology.dto";
import { UpdateTechnologyDto } from "./dto/update-technology.dto";

@ApiTags("Technologies")
@Controller("technologies")
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  // Public endpoint for getting active technologies
  @Get()
  @ApiOperation({ summary: "Get all technologies (public endpoint)" })
  @ApiResponse({
    status: 200,
    description: "Technologies retrieved successfully",
  })
  async getPublicTechnologies(@Query("isActive") isActive?: boolean) {
    return this.technologiesService.findAll({ isActive });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new technology" })
  @ApiResponse({ status: 201, description: "Technology created successfully" })
  async create(@Body() createTechnologyDto: CreateTechnologyDto) {
    return this.technologiesService.create(createTechnologyDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update technology" })
  @ApiResponse({ status: 200, description: "Technology updated successfully" })
  async update(
    @Param("id") id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
  ) {
    return this.technologiesService.update(id, updateTechnologyDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete technology" })
  @ApiResponse({ status: 200, description: "Technology deleted successfully" })
  async remove(@Param("id") id: string) {
    return this.technologiesService.remove(id);
  }
}
