import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const server = express();
let cachedServer: any;

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('SmartJob Core API')
    .setDescription('API untuk sistem Job Crawling, Parsing CV, dan AI-based Job Matching.')
    .setVersion('1.0.0')
    .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, documentFactory);

  await app.init();
  return app;
};

export default async (req: any, res: any) => {
  if (!cachedServer) {
    await createNestServer(server);
    cachedServer = server;
  }
  return cachedServer(req, res);
};
