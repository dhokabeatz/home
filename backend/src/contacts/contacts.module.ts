import { Module } from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { ContactsController } from "./contacts.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../common/email/email.module";

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
