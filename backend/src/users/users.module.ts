import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UploadService } from "../upload/upload.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, UploadService],
  exports: [UsersService],
})
export class UsersModule {}
