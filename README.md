# Skyscanner Flight Search API

This project provides an API to search for round-trip flights using data from the Skyscanner RapidAPI endpoint. It also allows detection of a user's country configuration and includes Swagger documentation for ease of reference.

## Features

- **Flight Search (POST /search-flight)**:  
  Searches for round-trip flights based on the provided origin, destination, departure date, and return date. Additional options such as number of adults/children/infants, cabin class, currency, and market can also be configured.
  
- **Country Detection (GET /location/detect)**:  
  Based on the user's IP or pre-configured logic, returns a country configuration containing market, locale, and currency details suitable for performing flight searches.

- **Swagger Documentation (GET /docs)**:  
  Browse the API specification and test endpoints through the integrated Swagger UI.

- **Validation**:  
  Input validation for dates and query parameters ensures that departure and return dates are valid and not in the past.

- **Integration Tests & E2E Testing**:  
  The project includes tests to validate business logic and end-to-end behavior.

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
  $ npm run start

  # watch mode
  $ npm run start:dev

  # production mode
  $ npm run start:prod
   ```

  By default, the server runs on `http://localhost:3000`.

## Environment Setup

You must provide RapidAPI credentials in a `.env` file located at the project root. For example:

```env
RAPIDAPI_HOST=your_rapidapi_host
RAPIDAPI_KEY=your_rapidapi_key
```

These credentials are used by the application to call Skyscanner’s RapidAPI endpoints.

## API Endpoints

### 1. POST `/search-flight`

**Description**:  
Search for round-trip flights using the Skyscanner RapidAPI integration.

**Request Body Example**:
```json
{
  "originQuery": "Kuala Lumpur",
  "destinationQuery": "London",
  "departDate": "2024-12-13",
  "returnDate": "2024-12-20",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "cabinClass": "economy",
  "currency": "MYR",
  "market": "MY"
}
```

**Conditions & Validation**:
- `originQuery`: Required, string.
- `destinationQuery`: Required, string.
- `departDate`: Required, must be `YYYY-MM-DD`, not in the past.
- `returnDate`: Required, must be `YYYY-MM-DD`, not earlier than `departDate`.
- `adults`: Optional, integer ≥ 1.
- `children`: Optional, integer ≥ 0.
- `infants`: Optional, integer ≥ 0.
- `cabinClass`: Optional, one of `economy`, `premium_economy`, `business`, `first`.
- `currency`: Optional, defaults to `MYR`.
- `market`: Optional, defaults to `MY`.

**Response Example**:
```json
{
  "status": "success",
  "data": [
    {
      "price": 5214,
      "depature": {
        "airline": "SriLankan Airlines",
        "departure": "2024-12-13T14:45:00",
        "arrival": "2024-12-14T08:40:00",
        "stopCount": 2,
        "segments": []
      },
      "return": {
        "airline": "SriLankan Airlines",
        "departure": "2024-12-20T20:40:00",
        "arrival": "2024-12-22T13:45:00",
        "stopCount": 2,
        "segments": []
      },
      "departureDate": "2024-12-13",
      "returnDate": "2024-12-20"
    }
  ]
}
```

### 2. GET `/location/detect`

**Description**:  
Returns the configuration data for the detected country, including market, locale, and currency.

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

The Swagger UI provides a visual interface to explore all endpoints, see their input/output parameters, and test them directly.

## Testing

The project includes both unit and e2e tests to ensure functionality and reliability.

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

- **Rate Limits**: RapidAPI and Skyscanner may impose rate limits. Ensure you handle `429` (Too Many Requests) responses gracefully or consider caching frequently used data.
- **Security**: For public endpoints, no authentication is required. If authentication or API keys for clients are needed, implement `Guards` in NestJS.
- **Configuration Files**: JSON configuration files (like `countries-config.json`, `airports.json`) can be placed in a `data` or `assets` directory. A cron job can be used to periodically update these files.

---

This `README.md` should serve as a comprehensive guide to installing, configuring, and using this flight search API.