import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FlightsModule } from './modules/flights/flights.module';
import { LocationsModule } from './modules/locations/locations.module';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: ['.env', '.env.local'],
  }), FlightsModule, LocationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
