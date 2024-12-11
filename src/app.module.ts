import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FlightsModule } from './modules/flights/flights.module';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: ['.env', '.env.local'],
  }), FlightsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
