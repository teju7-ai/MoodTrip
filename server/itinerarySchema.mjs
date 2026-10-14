// Defines the structure we ask the AI to return.
// The backend will also check the result before displaying it.

export function createItinerarySchema(days, placeIds) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['summary', 'itinerary'],

    properties: {
      summary: {
        type: 'string',
        description: 'A short introduction to this trip.',
      },

      itinerary: {
        type: 'array',
        minItems: days,
        maxItems: days,

        items: {
          type: 'object',
          additionalProperties: false,
          required: ['day', 'title', 'stops'],

          properties: {
            day: {
              type: 'integer',
              minimum: 1,
              maximum: days,
            },

            title: {
              type: 'string',
              description: 'A short title describing the day.',
            },

            stops: {
              type: 'array',
              minItems: 3,
              maxItems: 3,

              items: {
                type: 'object',
                additionalProperties: false,

                required: [
                  'placeId',
                  'period',
                  'time',
                  'durationMinutes',
                  'description',
                  'estimatedCost',
                ],

                properties: {
                  placeId: {
                    type: 'string',
                    enum: placeIds,
                    description:
                      'Choose an ID from the supplied places only.',
                  },

                  period: {
                    type: 'string',
                    enum: ['Morning', 'Afternoon', 'Evening'],
                  },

                  time: {
                    type: 'string',
                    description:
                      'Suggested start time in 24-hour HH:MM format.',
                  },

                  durationMinutes: {
                    type: 'integer',
                    minimum: 30,
                    maximum: 240,
                  },

                  description: {
                    type: 'string',
                    description:
                      'Briefly explain the suggested visit.',
                  },

                  estimatedCost: {
                    type: 'number',
                    minimum: 0,
                    description:
                      'Estimated activity or meal cost per person in INR. Not a verified live price.',
                  },
                },
              },
            },
          },
        },
      },
    },
  }
}