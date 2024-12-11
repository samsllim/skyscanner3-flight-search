import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RapidApiService } from './rapidapi.service';

@Module({
  imports: [HttpModule],
  providers: [RapidApiService],
  exports: [RapidApiService]
})
export class RapidapiModule {}
