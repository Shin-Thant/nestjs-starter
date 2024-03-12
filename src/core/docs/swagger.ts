import { SWAGGER_CONFIG } from '@config/swagger.config';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';

export function createDocument(app: INestApplication) {
  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'authorization')
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version);
  for (const tag of SWAGGER_CONFIG.tags) {
    builder.addTag(tag);
  }
  const configService = app.get(ConfigService);
  const options = builder.build();
  const username = configService.get<string>('swagger.username');
  const password = configService.get<string>('swagger.password');
  const appMode = configService.get<string>('app.mode');
  if (appMode !== 'development') {
    app.use(
      '/docs',
      basicAuth({
        challenge: true,
        users: { [username]: password },
      }),
    );
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }
}