import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { TechnologiesController } from './technologies.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TechnologiesController],
  providers: [TechnologiesService],
  exports: [TechnologiesService],
})
export class TechnologiesModule { }
