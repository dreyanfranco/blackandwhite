import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the Expo app (running on a device/simulator) to call the API.
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  // 0.0.0.0 so a physical phone on the same Wi-Fi can reach it via the LAN IP.
  await app.listen(port, '0.0.0.0');
  console.log(`⚽  blackandwhite API listening on http://0.0.0.0:${port}`);
}
bootstrap();
