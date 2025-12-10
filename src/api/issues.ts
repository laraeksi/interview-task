// Import necessary libraries and types
// axios HTTP client for making API requests
// Request, Response Express types for handling HTTP requests/responses
// SampleData TypeScript interface defining the structure of API response data
import axios from 'axios';
import { Request, Response } from 'express';
import { SampleData } from './types';

// API endpoint URL, fetches 100 data points from the service desk API
// This endpoint is used by the front end to display the list of issues
// datapoints=100: specifies we want 100 issues (as required by front-end requirements)
const DATA_URL = 'https://sampleapi.squaredup.com/integrations/v1/service-desk?datapoints=100';

// Export the GET handler function - this is called when a GET request is made to /api/issues
// The vite-plugin-api-routes automatically creates this route based on the file name
// This is a simple proxy endpoint that fetches data from the external API and returns it
export const GET = async (req: Request, res: Response) => {
    // Make GET request to external API
    // await waits for the HTTP request to complete
    // <SampleData> TypeScript generic ensures response matches expected type
    const { data } = await axios.get<SampleData>(DATA_URL)
    
    // Send the data directly to the client
    // res.send() sends the response data (automatically converts to JSON)
    res.send(data);
};
