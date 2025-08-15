import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { UploadService } from "../upload/upload.service";

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, UploadService],
})
export class ProjectsModule {}
