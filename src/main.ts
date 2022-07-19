import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { corsConfiguration } from './config/cors.config';
import { DEFAULT_APP_PORT } from './core/base/constant';

async function bootstrap() {
  const cors: boolean | CorsOptions = corsConfiguration;
  const app = await NestFactory.create(AppModule, { cors });

  const options = new DocumentBuilder()
    .setTitle('Scraper Service')
    .setDescription('API documentation for the Scraper Service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || DEFAULT_APP_PORT;
  const logger = new Logger();

  await app.listen(port, () => {
    logger.log(`Scraper service is started on PORT ${port}`);
  });
}
bootstrap();
