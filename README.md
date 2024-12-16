# Skyscanner Flight Search API

This project provides an API to search for round-trip flights using data from the Skyscanner RapidAPI endpoint. It can also detect a user's country configuration and includes Swagger documentation for easy reference.

## Features

- **Flight Search (POST /search-flight)**:
  - Searches for round-trip flights given an origin, destination, and date range.
  - Supports returning multiple date combinations between the provided `departDate` and `returnDate`.
  - Results are grouped into:
    - **all**: All flights, sorted by cheapest first.
    - **weekday**: Flights where both departure and return dates are weekdays (Mon-Fri), sorted by cheapest first.
    - **weekend**: Flights where both departure and return dates fall on weekends (Sat-Sun), sorted by cheapest first.
  - If departure and return dates do not fall strictly into both weekday or both weekend, the flight is only listed in the `all` group.
  - Additional search options include number of adults, children, infants, cabin class, currency, and market.

- **Country Detection (GET /location/detect)**:
  Returns a country configuration (market, locale, currency) based on user context or predefined logic.

- **Swagger Documentation (GET /docs)**:
  Explore endpoints, models, and make test calls through the integrated Swagger UI.

- **Validation**:
  Input validation ensures departure and return dates are valid (from today onward) and the return date is not earlier than the departure date.

- **Rate Limiting & Security** (Optional Enhancements):
  Implements rate limiting to prevent abuse. Helmet is used to set secure HTTP headers.

- **Integration Tests & E2E Testing**:
  The project includes tests to validate core business logic and overall system behavior.

## Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:samsllim/skyscanner3-flight-search.git
   cd skyscanner3-flight-search
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile and run the project**:
   ```bash
   # development
   npm run start

   # watch mode
   npm run start:dev

   # production mode
   npm run start:prod
   ```

   By default, the server runs on `http://localhost:3000`.

## Environment Setup

Create a `.env` file at the project root with your RapidAPI credentials:

```env
RAPIDAPI_HOST=your_rapidapi_host
RAPIDAPI_KEY=your_rapidapi_key
```

These are required to call Skyscanner’s RapidAPI endpoints.

## API Endpoints

### 1. POST `/search-flight`

**Description**:  
Search for round-trip flights for a given origin, destination, and a date range. Multiple date combinations are considered as long as `returnDate > departDate`. Results are returned in three categories: `all`, `weekday`, and `weekend`. Each category is sorted by cheapest flights first.

**Request Body Example**:
```json
{
  "originQuery": "Kuala Lumpur",
  "destinationQuery": "London",
  "departDate": "2024-12-01",
  "returnDate": "2024-12-04",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "economy",
  "currency": "MYR",
  "market": "MY"
}
```

**Conditions & Validation**:
- `originQuery`: Required, string (city or country name).
- `destinationQuery`: Required, string (city or country name).
- `departDate`: Required, `YYYY-MM-DD`, must not be in the past.
- `returnDate`: Required, `YYYY-MM-DD`, must be after `departDate`.
- `adults`: Optional, ≥1.
- `children`: Optional, ≥0.
- `infants`: Optional, ≥0.
- `cabinClass`: Optional, one of `economy`, `premium_economy`, `business`, `first`.
- `currency`: Optional, defaults to `MYR`.
- `market`: Optional, defaults to `MY`.

**Response Structure**:
The response now returns an object with three arrays: `all`, `weekday`, and `weekend`. Each element conforms to the updated `FlightOption` interface:

```typescript
interface FlightLeg {
  airline: string;
  departure: string;
  arrival: string;
  stopCount: number;
  segments: any[];
}

interface FlightOption {
  price: number;
  currency: string;
  depature: FlightLeg;
  return: FlightLeg;
  departureDate: string; // "YYYY-MM-DD"
  returnDate: string;    // "YYYY-MM-DD"
}
```

**Response Example**:
```json
{
  "status": "success",
  "data": {
    "all": [
      {
        "price": 5214,
        "currency": "MYR",
        "depature": {
          "airline": "SriLankan Airlines",
          "departure": "2024-12-01T14:45:00",
          "arrival": "2024-12-02T08:40:00",
          "stopCount": 2,
          "segments": []
        },
        "return": {
          "airline": "SriLankan Airlines",
          "departure": "2024-12-03T20:40:00",
          "arrival": "2024-12-04T13:45:00",
          "stopCount": 2,
          "segments": []
        },
        "departureDate": "2024-12-01",
        "returnDate": "2024-12-03"
      }
      // ... other flights
    ],
    "weekday": [
      // flights where both departureDate and returnDate are weekdays
    ],
    "weekend": [
      // flights where both departureDate and returnDate are weekend days
    ]
  }
}
```

### 2. GET `/location/detect`

**Description**:  
Returns the country configuration based on the user's location or preconfigured logic.

**Response Example**:
```json
{
  "countryCode": "MY",
  "countryConfig": {
    "country": "Malaysia",
    "market": "MY",
    "locale": "en-GB",
    "currencyTitle": "Malaysian Ringgit",
    "currency": "MYR",
    "currencySymbol": "RM",
    "site": "www.skyscanner.com.my"
  }
}
```

## Swagger Documentation

**URL**: `http://localhost:3000/docs`

Use the Swagger UI to view all endpoints, request/response models, and test the API interactively.

## Testing

- **Unit tests**:
  ```bash
  npm run test
  ```
- **e2e tests**:
  ```bash
  npm run test:e2e
  ```
- **Coverage**:
  ```bash
  npm run test:cov
  ```

## Additional Notes

- **Rate Limits**:  
  RapidAPI and Skyscanner may impose rate limits. Consider implementing caching or adjusting request strategies.
  
- **Security**:  
  Basic security measures (helmet, rate limiting) are implemented. For more advanced use, consider authentication or API keys for certain endpoints.
  
- **Configuration Files**:  
  Place JSON configs like `countries-config.json` in a `data` directory. A cron job can refresh these periodically if needed.

