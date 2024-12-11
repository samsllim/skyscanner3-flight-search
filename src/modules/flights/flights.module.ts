import { Module } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { RapidapiModule } from './rapidapi/rapidapi.module';

@Module({
  imports: [RapidapiModule],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
