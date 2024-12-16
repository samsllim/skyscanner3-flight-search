import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import * as moment from 'moment';

describe('Flights (E2E)', () => {
  let app: INestApplication;
  
  const departDate = moment().add(2, 'days').format('YYYY-MM-DD'); // minimal date range
  const returnDate = moment().add(3, 'days').format('YYYY-MM-DD');
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = module.createNestApplication();
    await app.init();
  });
  
  afterAll(async () => {
    await app.close();
  });

  it('POST /search-flight should return flight data', async () => {
    const body = {
      originQuery: 'Kuala Lumpur',
      destinationQuery: 'Singapore',
      departDate,
      returnDate,
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy',
      currency: 'MYR',
      market: 'MY'
    };

    const response = await request(app.getHttpServer())
      .post('/search-flight')
      .send(body)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('all');
    // Check if data.all is an array and possibly check length > 0
    expect(Array.isArray(response.body.data.all)).toBe(true);
  }, 30_000); // 30s timeout in case it takes longer
});
