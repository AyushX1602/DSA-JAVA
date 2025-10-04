/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';
import {
  Client as GoogleMapsClient,
  PlacePhoto,
  PlaceInputType,
} from '@googlemaps/google-maps-services-js';

interface AIGeneratedTrip {
  trip: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    stops: Array<{
      city: string;
      startDate: string;
      endDate: string;
      notes: string;
      places: Array<{
        name: string;
        latitude?: number;
        longitude?: number;
        activities: Array<{
          title: string;
          description: string;
          expense: number;
          startTime: string;
          endTime: string;
        }>;
      }>;
    }>;
  };
}

@Injectable()
export class AiTripGenerationService {
  private genAI: GoogleGenAI;
  private googleMapsClient: GoogleMapsClient;
  private narrationCache: Map<
    string,
    { transcript: string; cachedAt: number }
  > = new Map();
  private narrationAudioCache: Map<
    string,
    { audioBase64: string; cachedAt: number }
  > = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });
    this.googleMapsClient = new GoogleMapsClient({});
  }

  async generateActivityNarration(
    trip: { name?: string; description?: string } | null,
    stop: { city?: string; notes?: string } | null,
    place: { name?: string } | null,
    activity: {
      title: string;
      description?: string;
      expense?: number;
      startTime?: string;
      endTime?: string;
    },
  ): Promise<{
    transcript: string;
    audioBase64: string;
    success: boolean;
    message: string;
  }> {
    const cacheKey = this.buildNarrationCacheKey(trip, stop, place, activity);
    let transcript: string | null = null;

    if (this.narrationCache.has(cacheKey)) {
      const cached = this.narrationCache.get(cacheKey)!;
      transcript = cached.transcript;
    }

    if (!transcript) {
      try {
        const prompt = this.buildActivityNarrationPrompt(
          trip,
          stop,
          place,
          activity,
        );
        const response = await this.genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        const transcriptRaw = response.text?.trim() ?? '';

        const sentences = transcriptRaw
          .replace(/\s+/g, ' ')
          .split(/(?<=[.!?])\s+/)
          .filter(Boolean)
          .slice(0, 4);
        transcript = sentences.join(' ');

        this.narrationCache.set(cacheKey, { transcript, cachedAt: Date.now() });
      } catch (error: any) {
        throw new BadRequestException(
          `Failed to generate narration (stage=gemini): ${this.stringifyError(error)}`,
        );
      }
    }

    try {
      if (this.narrationAudioCache.has(cacheKey)) {
        const cachedAudio = this.narrationAudioCache.get(cacheKey)!;
        return {
          transcript: transcript!,
          audioBase64: cachedAudio.audioBase64,
          success: true,
          message: 'Narration generated (cached audio)',
        };
      }

      const audioBase64 = await this.synthesizeWithElevenLabs(transcript!);
      this.narrationAudioCache.set(cacheKey, {
        audioBase64,
        cachedAt: Date.now(),
      });
      return {
        transcript: transcript!,
        audioBase64,
        success: true,
        message: 'Narration generated',
      };
    } catch (error: any) {
      const readable = this.getReadableBody(error?.response?.data);
      throw new BadRequestException(
        `Failed to generate narration (stage=elevenlabs): status=${error?.response?.status} body=${readable}`,
      );
    }
  }

  private buildActivityNarrationPrompt(
    trip: { name?: string; description?: string } | null,
    stop: { city?: string; notes?: string } | null,
    place: { name?: string } | null,
    activity: {
      title: string;
      description?: string;
      expense?: number;
      startTime?: string;
      endTime?: string;
    },
  ): string {
    const tripPart = `Trip: ${trip?.name ?? 'Unknown Trip'}${trip?.description ? ` — ${trip.description}` : ''}`;
    const stopPart = `Stop/City: ${stop?.city ?? 'Unknown City'}${stop?.notes ? ` — ${stop.notes}` : ''}`;
    const placePart = `Place: ${place?.name ?? 'Unknown Place'}`;
    const activityPart = `Activity: ${activity.title}${activity.description ? ` — ${activity.description}` : ''} ${activity.startTime ? ` from ${activity.startTime}` : ''}${activity.endTime ? ` to ${activity.endTime}` : ''}${typeof activity.expense === 'number' ? `, Cost: $${activity.expense.toFixed(2)}` : ''}`;

    return `Write a concise, engaging 3-4 sentence narration describing the historical or cultural significance and travel context of the following itinerary item. Be factual, friendly, and suitable to be read aloud. Avoid marketing fluff, avoid second-person commands, and do not exceed four sentences.

${tripPart}
${stopPart}
${placePart}
${activityPart}

Output: Only the narration text.`;
  }

  private async synthesizeWithElevenLabs(text: string): Promise<string> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) {
      throw new Error('Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID');
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const payload = {
      text,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
    } as any;
    try {
      const response = await axios.post(url, payload, {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      });

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return base64;
    } catch (error: any) {
      const readable = this.getReadableBody(error?.response?.data);
      throw error;
    }
  }

  private buildNarrationCacheKey(
    trip: { name?: string; description?: string } | null,
    stop: { city?: string; notes?: string } | null,
    place: { name?: string } | null,
    activity: {
      title: string;
      description?: string;
      expense?: number;
      startTime?: string;
      endTime?: string;
      id?: string;
    },
  ): string {
    if ((activity as any)?.id) {
      return `activity:${(activity as any).id}`;
    }
    const raw = JSON.stringify({
      t: trip?.name,
      td: trip?.description,
      s: stop?.city,
      sn: stop?.notes,
      p: place?.name,
      a: {
        ti: activity.title,
        d: activity.description ?? '',
        e: activity.expense ?? null,
        st: activity.startTime ?? '',
        et: activity.endTime ?? '',
      },
    });
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return `activityHash:${hash}`;
  }

  private stringifyError(error: any): string {
    if (error?.response) {
      const status = error.response.status;
      const data =
        typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
      return `status=${status} body=${data?.slice(0, 400)}`;
    }
    return error?.message || String(error);
  }

  private formatAxiosError(error: any) {
    return {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: this.getReadableBody(error?.response?.data),
      headers: error?.response?.headers,
    };
  }

  private getReadableBody(data: any): string | undefined {
    if (typeof data === 'undefined') return undefined;
    if (Buffer.isBuffer(data)) {
      try {
        const text = data.toString('utf8');
        return text;
      } catch {
        return `<buffer length=${data.length}>`;
      }
    }
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }

  async generateTrip(
    city: string,
    duration: number, // in days
    budget: string,
    interests: string[],
    userId: string,
  ): Promise<{ tripId: string; message: string; success: boolean }> {
    try {
      // Generate trip content using AI
      const aiGeneratedTrip = await this.generateTripContent(
        city,
        duration,
        budget,
        interests,
      );

      // Create the trip in the database
      const trip = await this.prisma.trip.create({
        data: {
          name: aiGeneratedTrip.trip.name,
          description: aiGeneratedTrip.trip.description,
          startDate: new Date(aiGeneratedTrip.trip.startDate),
          endDate: new Date(aiGeneratedTrip.trip.endDate),
          owner: {
            connect: { id: userId },
          },
        },
      });

      // Create trip stops with places and activities
      for (const stopData of aiGeneratedTrip.trip.stops) {
        const stop = await this.prisma.tripStop.create({
          data: {
            tripId: trip.id,
            cityId: null, // We'll need to handle city mapping
            city: stopData.city,
            startDate: new Date(stopData.startDate),
            endDate: new Date(stopData.endDate),
            notes: stopData.notes,
          },
        });

        // Create places for this stop
        for (const placeData of stopData.places) {
          const place = await this.prisma.place.create({
            data: {
              tripStopId: stop.id,
              name: placeData.name,
              latitude: placeData.latitude,
              longitude: placeData.longitude,
            },
          });

          // Create activities for this place
          for (const activityData of placeData.activities) {
            await this.prisma.activity.create({
              data: {
                placeId: place.id,
                title: activityData.title,
                description: activityData.description,
                expense: activityData.expense,
                startTime: new Date(activityData.startTime),
                endTime: new Date(activityData.endTime),
              },
            });
          }
        }
      }

      return {
        tripId: trip.id,
        message: 'AI-generated trip created successfully',
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate trip: ${error.message}`,
      );
    }
  }

  private async generateTripContent(
    city: string,
    duration: number,
    budget: string,
    interests: string[],
  ): Promise<AIGeneratedTrip> {
    const model = this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: this.buildPrompt(city, duration, budget, interests),
    });

    const response = await model;
    const responseText = response.text;

    // Clean the response text - remove markdown formatting if present
    let cleanResponse = responseText.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
    }

    try {
      const parsedResponse = JSON.parse(cleanResponse);

      return this.validateAndFormatTripData(parsedResponse);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Response text:', responseText);
      return this.fallbackTripGeneration(city, duration, interests);
    }
  }

  private buildPrompt(
    city: string,
    duration: number,
    budget: string,
    interests: string[],
  ): string {
    return `Generate a detailed travel itinerary for ${city} for ${duration} days with a budget of ${budget}.

        User interests: ${interests.join(', ')}

        IMPORTANT: You must respond with ONLY a valid JSON object in the following exact format. Do not include any other text, explanations, or markdown formatting:

        {
        "trip": {
        "name": "Trip name",
        "description": "Detailed trip description",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "stops": [
        {
        "city": "City name",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "notes": "Stop description and notes",
        "places": [
        {
        "name": "Place name",
        "latitude": 0.0,
        "longitude": 0.0,
        "activities": [
        {
        "title": "Activity title",
        "description": "Activity description",
        "expense": 0.00,
        "startTime": "YYYY-MM-DDTHH:MM:SS.000Z",
        "endTime": "YYYY-MM-DDTHH:MM:SS.000Z"
        }
        ]
        }
        ]
        }
        ]
        }
        }

        Requirements:

        Create exactly ${duration} stops, each representing a different day or area but ensure there is only one stop per city.

        If multiple cities are provided (comma-separated), create exactly one stop for each city (no duplicates).

        Each stop should have a maximum of 6-7 places to visit.

        Each place should have 1-3 activities.

        Activities should have realistic timing and expenses.

        Use actual coordinates for famous landmarks when possible.

        Ensure dates are sequential and logical.

        Make activities align with user interests.

        Keep expenses within budget constraints.

        Be creative but realistic with the itinerary.

        Return ONLY the JSON object, no other text.`;
  }

  private validateAndFormatTripData(data: any): AIGeneratedTrip {
    // Basic validation of the AI response structure
    if (!data.trip || !Array.isArray(data.trip.stops)) {
      throw new Error('Invalid AI response structure - missing trip or stops');
    }

    // Validate trip data
    if (!data.trip.name || !data.trip.startDate || !data.trip.endDate) {
      throw new Error('Missing required trip information');
    }

    // Validate stops data
    for (const stop of data.trip.stops) {
      if (
        !stop.city ||
        !stop.startDate ||
        !stop.endDate ||
        !Array.isArray(stop.places)
      ) {
        throw new Error('Invalid stop data structure');
      }

      // Validate places data
      for (const place of stop.places) {
        if (!place.name || !Array.isArray(place.activities)) {
          throw new Error('Invalid place data structure');
        }

        // Validate activities data
        for (const activity of place.activities) {
          if (!activity.title || !activity.startTime || !activity.endTime) {
            throw new Error('Invalid activity data structure');
          }
        }
      }
    }

    return data as AIGeneratedTrip;
  }

  private fallbackTripGeneration(
    city: string,
    duration: number,
    interests: string[],
  ): AIGeneratedTrip {
    // Fallback to a basic template if AI generation fails
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + duration - 1);

    const fallbackTrip = {
      trip: {
        name: `${city} Adventure - ${duration} Days`,
        description: `Explore ${city} with activities based on your interests: ${interests.join(', ')}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        stops: [
          {
            city: city,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            notes: `Explore ${city} and discover local attractions`,
            places: [
              {
                name: `${city} City Center`,
                latitude: 0,
                longitude: 0,
                activities: [
                  {
                    title: 'City Exploration',
                    description: 'Walk around and explore the city center',
                    expense: 0,
                    startTime: `${startDate.toISOString().split('T')[0]}T09:00:00.000Z`,
                    endTime: `${startDate.toISOString().split('T')[0]}T12:00:00.000Z`,
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    return fallbackTrip;
  }

  async estimateActivityCost(
    title: string,
    description: string,
    placeName: string,
    city: string,
    startTime: string,
    endTime: string,
  ): Promise<{ estimatedCost: number; reasoning: string }> {
    try {
      const model = this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: this.buildCostEstimationPrompt(
          title,
          description,
          placeName,
          city,
          startTime,
          endTime,
        ),
      });

      const response = await model;
      const responseText = response.text;

      // Clean the response text - remove markdown formatting if present
      let cleanResponse = responseText.trim();

      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '');
      }

      try {
        // Parse the cleaned response as JSON
        const parsedResponse = JSON.parse(cleanResponse);

        return this.validateAndFormatCostEstimation(parsedResponse);
      } catch (parseError) {
        console.error('JSON parsing failed for cost estimation:', parseError);
        console.error('Response text:', responseText);
        return this.fallbackCostEstimation(city);
      }
    } catch (error) {
      console.error('Cost estimation failed:', error);
      // Return a fallback estimation if AI generation fails
      return this.fallbackCostEstimation(city);
    }
  }

  private buildCostEstimationPrompt(
    title: string,
    description: string,
    placeName: string,
    city: string,
    startTime: string,
    endTime: string,
  ): string {
    return `Estimate the cost for the following activity. Consider the location, type of activity, and typical pricing in that area.

IMPORTANT: You must respond with ONLY a valid JSON object in the following exact format. Do not include any other text, explanations, or markdown formatting:

{
  "estimatedCost": 0.00,
  "reasoning": "Brief explanation of how you arrived at this cost estimate"
}

Activity Details:
- Title: ${title}
- Description: ${description || 'No description provided'}
- Place: ${placeName}
- City: ${city}
- Start Time: ${startTime}
- End Time: ${endTime}

Requirements:
- Provide a realistic cost estimate in USD
- Consider the location and type of activity
- Factor in typical pricing for similar activities in that city/region
- Include reasoning for your estimate
- Return ONLY the JSON object, no other text`;
  }

  private validateAndFormatCostEstimation(data: any): {
    estimatedCost: number;
    reasoning: string;
    message: string;
    success: boolean;
  } {
    // Basic validation of the AI response structure
    if (!data.estimatedCost || typeof data.estimatedCost !== 'number') {
      throw new Error(
        'Invalid cost estimation response - missing or invalid estimatedCost',
      );
    }

    if (!data.reasoning || typeof data.reasoning !== 'string') {
      throw new Error(
        'Invalid cost estimation response - missing or invalid reasoning',
      );
    }

    return {
      estimatedCost: Number(data.estimatedCost.toFixed(2)),
      reasoning: data.reasoning,
      message: 'Cost estimation successful!',
      success: true,
    };
  }

  private fallbackCostEstimation(city: string): {
    estimatedCost: number;
    reasoning: string;
    message: string;
    success: boolean;
  } {
    // Fallback to a basic template if AI generation fails
    const baseCost = 25; // Base cost for most activities
    const cityMultiplier = this.getCityCostMultiplier(city);
    const estimatedCost = baseCost * cityMultiplier;

    return {
      estimatedCost: Number(estimatedCost.toFixed(2)),
      reasoning: `Fallback estimate based on typical activity costs in ${city}. Base cost: $${baseCost}, adjusted for city cost of living.`,
      message: 'Cost estimation successful!',
      success: true,
    };
  }

  private getCityCostMultiplier(city: string): number {
    // Simple cost multipliers based on city type
    const cityLower = city.toLowerCase();

    if (
      cityLower.includes('new york') ||
      cityLower.includes('london') ||
      cityLower.includes('tokyo') ||
      cityLower.includes('paris')
    ) {
      return 2.5; // High cost cities
    } else if (
      cityLower.includes('los angeles') ||
      cityLower.includes('chicago') ||
      cityLower.includes('toronto') ||
      cityLower.includes('sydney')
    ) {
      return 2.0; // Medium-high cost cities
    } else if (
      cityLower.includes('miami') ||
      cityLower.includes('denver') ||
      cityLower.includes('vancouver')
    ) {
      return 1.5; // Medium cost cities
    } else {
      return 1.0; // Default multiplier
    }
  }

  async fetchTripImages(
    tripId: string,
  ): Promise<{ placeName: string; images: string[] }[]> {
    try {
      // Get the trip with all its stops and places
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          stops: {
            include: {
              places: true,
            },
          },
        },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      const placeImages: { placeName: string; images: string[] }[] = [];

      // For each stop, fetch images for its places
      for (const stop of trip.stops) {
        for (const place of stop.places) {
          try {
            const images = await this.fetchPlaceImages(place.name, stop.city);
            placeImages.push({
              placeName: place.name,
              images: images,
            });
          } catch (error) {
            console.error(
              `Failed to fetch images for place ${place.name}:`,
              error,
            );
            // Continue with other places even if one fails
            placeImages.push({
              placeName: place.name,
              images: [],
            });
          }
        }
      }

      return placeImages;
    } catch (error) {
      console.error('Failed to fetch trip images:', error);
      throw new Error(`Failed to fetch trip images: ${error.message}`);
    }
  }

  private async fetchPlaceImages(
    placeName: string,
    cityName: string,
  ): Promise<string[]> {
    try {
      const searchQuery = `${placeName}, ${cityName}`;
      const findPlaceResponse = await this.googleMapsClient.findPlaceFromText({
        params: {
          input: searchQuery,
          inputtype: PlaceInputType.textQuery,
          fields: ['place_id', 'photos'],
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });

      const place = findPlaceResponse.data.candidates[0];
      if (!place || !place.photos) {
        return [];
      }

      return place.photos.map((photo: PlacePhoto) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      });
    } catch (error) {
      console.error(`Failed to fetch images for ${placeName}:`, error);
      return [];
    }
  }
}
