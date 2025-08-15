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
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ContactsService } from "./contacts.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { PublicContactDto } from "./dto/public-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { ContactQueryDto } from "./dto/contact-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("contacts")
@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all contact submissions" })
  @ApiResponse({
    status: 200,
    description: "Contact submissions retrieved successfully",
  })
  findAll(@Query() query: ContactQueryDto) {
    return this.contactsService.findAll(query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a contact submission by ID" })
  @ApiResponse({
    status: 200,
    description: "Contact submission retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Contact submission not found" })
  findOne(@Param("id") id: string) {
    return this.contactsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new contact submission (public)" })
  @ApiResponse({
    status: 201,
    description: "Contact submission created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() publicContactDto: PublicContactDto, @Request() req: any) {
    // Extract IP address and user agent from request and create full DTO
    // Split name into firstName and lastName
    const nameParts = publicContactDto.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const contactData: CreateContactDto = {
      firstName,
      lastName,
      email: publicContactDto.email,
      subject: "General Inquiry", // Default subject
      message: publicContactDto.message,
      ipAddress: req.ip || req.connection?.remoteAddress || "127.0.0.1",
      userAgent: req.get("User-Agent") || "Unknown",
    };
    return this.contactsService.create(contactData);
  }

  @Post("admin")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new contact submission (admin)" })
  @ApiResponse({
    status: 201,
    description: "Contact submission created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  createAdmin(@Body() createContactDto: CreateContactDto, @Request() req: any) {
    // For admin route, allow manual override of IP and user agent
    const contactData = {
      ...createContactDto,
      ipAddress:
        createContactDto.ipAddress ||
        req.ip ||
        req.connection?.remoteAddress ||
        "127.0.0.1",
      userAgent:
        createContactDto.userAgent || req.get("User-Agent") || "Unknown",
    };
    return this.contactsService.create(contactData);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a contact submission status" })
  @ApiResponse({
    status: 200,
    description: "Contact submission updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Contact submission not found" })
  update(@Param("id") id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a contact submission" })
  @ApiResponse({
    status: 200,
    description: "Contact submission deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Contact submission not found" })
  remove(@Param("id") id: string) {
    return this.contactsService.remove(id);
  }
}
