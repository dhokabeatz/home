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
import { TeamService } from "./team.service";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";
import { TeamMemberQueryDto } from "./dto/team-member-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("team")
@Controller("team")
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOperation({ summary: "Get all team members" })
  @ApiResponse({
    status: 200,
    description: "Team members retrieved successfully",
  })
  findAll(@Query() query: TeamMemberQueryDto) {
    return this.teamService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a team member by ID" })
  @ApiResponse({
    status: 200,
    description: "Team member retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Team member not found" })
  findOne(@Param("id") id: string) {
    return this.teamService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new team member" })
  @ApiResponse({ status: 201, description: "Team member created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamService.create(createTeamMemberDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a team member" })
  @ApiResponse({ status: 200, description: "Team member updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Team member not found" })
  update(
    @Param("id") id: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
  ) {
    return this.teamService.update(id, updateTeamMemberDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a team member" })
  @ApiResponse({ status: 200, description: "Team member deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Team member not found" })
  remove(@Param("id") id: string) {
    return this.teamService.remove(id);
  }
}
