import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Handler, Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { WinstonLogger } from './common/logger/winston.logger';

let server: Handler;

async function createNestServer() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS configuration for both local and production
  const allowedOrigins = [
    configService.get('FRONTEND_URL'),
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:4174',
    'https://dhokabeatz.com',
    'https://www.dhokabeatz.com',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation (only in non-production)
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Ing. Henry Portfolio API')
      .setDescription('Backend API for dynamic portfolio website')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  server = server ?? (await createNestServer());
  return server(event, context, () => { });
};
