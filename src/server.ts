import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const ai = new GoogleGenAI({ apiKey: process.env.AI_KEY });

app.use(cors());
app.use(express.json());


app.get('/api/execute', async(req, res) => {
    try {
        const message = req.query.message;
        const code = req.query.code;

        // Validate code parameter if exists
        if (!code || code.toString().trim() === '') {
            return res.status(400).json({ error: 'Code parameter is required.' });
        }

        if (!message || message.toString().trim() === '') {
            return res.status(400).json({ error: 'Message parameter is required.' });
        }


        // A prompt for user request to structured JSON for restaurant search
        const searchPrompt = `
        Convert the following user request into a structured JSON format for a restaurant search.

            User Request: "${message}"

            Requirements:
                - The output must be a valid JSON object.
                - Use the following structure exactly:

                {
                    "action": "search_restaurants",
                    "parameters": {
                        "query": string,       // user search keywords
                        "near": string,        // location or city
                        "price": string|null,  // optional, use null if not provided
                        "open_now": boolean    // optional, use false if not specified
                    }
                }

                - Do NOT include any text outside the JSON.
                - Always include all keys; use null or default values if the information is missing.
        `;

        // Generate JSON response using GEMINI AI model
        const response = await ai.models.generateContent({
            model: process.env.AI_MODEL!,
            contents: searchPrompt,
        })

            const text = response.text;
            const cleanedText = text!.replace(/```json|```/g, '').trim(); // using regex to clean code for extra layered backticks

            // Extract the JSON object with regex
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

            // Parse it safely
            let parseText = null;
            if (jsonMatch) {
            try {
                parseText = JSON.parse(jsonMatch[0]);
            } catch (err) {
                console.error('Failed to parse JSON:', err);
            }
            }


            // using Foursquare Place API to search for restaurants base on structured JSON from AI
            const searchPlace = await axios.get('https://places-api.foursquare.com/places/search', {
                headers: {
                    Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
                    'X-Places-Api-Version': '2025-06-17',
                },
                params: {
                    query: parseText.parameters.query, 
                    near: parseText.parameters.near,
                    price: parseText.parameters.price,
                    open_now: parseText.parameters.open_now,
                }
            })


        // Constructing a required response format
        const data = searchPlace.data.results.map((item: any) => ({
                name: item.name,
                address: item.location?.formatted_address || 'N/A',
                cuisine: item.categories?.map((cat: any) => cat.name).join(', ') || 'N/A',
                rating: item.rating ?? undefined,
                price: item.price ?? undefined,
                open_now: item.hours?.is_open ?? undefined,
            }));

        return res.status(200).json({message: 'Here are suggested places you want to visit:', results: data });
    } catch (error) {
        throw res.status(500).json({ error: 'Internal Server Error' });
    }
  
})


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

