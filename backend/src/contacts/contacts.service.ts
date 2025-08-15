import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) { }

  async findAll(query: ContactQueryDto) {
    const { search, status, page = 1, limit = 10 } = query;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [contactsRaw, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contact.count({ where }),
    ]);

    // Transform contacts to include combined name field
    const contacts = contactsRaw.map(contact => ({
      ...contact,
      name: `${contact.firstName} ${contact.lastName}`.trim(),
    }));

    return {
      contacts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException('Contact submission not found');
    }

    // Transform contact to include combined name field
    return {
      ...contact,
      name: `${contact.firstName} ${contact.lastName}`.trim(),
    };
  }

  async create(createContactDto: CreateContactDto) {
    try {
      // Create the contact submission in database
      const contact = await this.prisma.contact.create({
        data: createContactDto,
      });

      // Send email notification
      try {
        await this.emailService.sendContactEmail({
          name: `${createContactDto.firstName} ${createContactDto.lastName}`,
          email: createContactDto.email,
          message: createContactDto.message,
        });

        // Send auto-reply (optional - won't fail the entire operation)
        await this.emailService.sendAutoReply({
          name: `${createContactDto.firstName} ${createContactDto.lastName}`,
          email: createContactDto.email,
          message: createContactDto.message,
        });

        this.logger.log(`Email notifications sent for contact: ${contact.id}`);
      } catch (emailError) {
        // Log email error but don't fail the contact creation
        this.logger.error('Failed to send email notifications:', emailError);
      }

      // Return contact with combined name field
      return {
        ...contact,
        name: `${contact.firstName} ${contact.lastName}`.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to create contact:', error);
      throw error;
    }
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
