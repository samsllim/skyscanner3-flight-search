
interface FlightLeg{
  airline: string;
  departure: string; //2024-12-31T14:55:00
  arrival: string; //2024-12-31T18:10:00
  stopCount: number;
  segments: any[];
}

interface FlightOption {
  price: number;
  depature: FlightLeg;
  return: FlightLeg;
  departureDate: string; // "YYYY-MM-DD"
  returnDate: string;    // "YYYY-MM-DD"
}

export { FlightOption, FlightLeg };
  