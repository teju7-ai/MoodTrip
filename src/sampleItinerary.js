// Demo data for building and testing the interface.
// Costs and timings are illustrative estimates, not live prices.
// Budget covers activities and food per person.
// Flights, hotels, and transport are excluded.

export const sampleItinerary = {
  id: 'goa-relaxing-demo',
  destination: 'Goa',
  mood: 'relaxing',
  days: 3,
  currency: 'INR',
  isDemo: true,

  itinerary: [
    {
      day: 1,
      title: 'Ease into beach life',
      stops: [
        {
          id: 'day1-morning',
          period: 'Morning',
          time: '9:00 AM',
          duration: '2 hours',
          name: 'Candolim Beach',
          description:
            'Start slowly with a walk along the shore and time to unwind.',
          estimatedCost: 0,
          mapsQuery: 'Candolim Beach Goa',
        },
        {
          id: 'day1-afternoon',
          period: 'Afternoon',
          time: '1:00 PM',
          duration: '1.5 hours',
          name: 'Lunch near Candolim Beach',
          description:
            'Choose a nearby café for a relaxed lunch. This is a meal allowance, not a specific restaurant booking.',
          estimatedCost: 450,
          mapsQuery: 'cafes near Candolim Beach Goa',
        },
        {
          id: 'day1-evening',
          period: 'Evening',
          time: '5:00 PM',
          duration: '2 hours',
          name: 'Calangute Beach',
          description:
            'Enjoy an evening by the sea, followed by dinner nearby.',
          estimatedCost: 600,
          mapsQuery: 'Calangute Beach Goa',
        },
      ],
    },

    {
      day: 2,
      title: 'A little history, a lot of breathing room',
      stops: [
        {
          id: 'day2-morning',
          period: 'Morning',
          time: '9:30 AM',
          duration: '1.5 hours',
          name: 'Fort Aguada',
          description:
            'Explore the fort and coastal views at an easy pace.',
          estimatedCost: 200,
          mapsQuery: 'Fort Aguada Goa',
        },
        {
          id: 'day2-afternoon',
          period: 'Afternoon',
          time: '1:00 PM',
          duration: '1.5 hours',
          name: 'Lunch in Panaji',
          description:
            'Take a leisurely lunch break in the city. Choose a restaurant that fits your preferences.',
          estimatedCost: 500,
          mapsQuery: 'restaurants in Panaji Goa',
        },
        {
          id: 'day2-evening',
          period: 'Evening',
          time: '4:30 PM',
          duration: '1.5 hours',
          name: 'Miramar Beach',
          description:
            'Finish your afternoon with a gentle beach walk.',
          estimatedCost: 0,
          mapsQuery: 'Miramar Beach Goa',
        },
      ],
    },

    {
      day: 3,
      title: 'Colorful streets and a quiet goodbye',
      stops: [
        {
          id: 'day3-morning',
          period: 'Morning',
          time: '9:00 AM',
          duration: '2 hours',
          name: 'Fontainhas',
          description:
            'Wander through colorful streets, take photos, and pause for a drink.',
          estimatedCost: 100,
          mapsQuery: 'Fontainhas Panaji Goa',
        },
        {
          id: 'day3-afternoon',
          period: 'Afternoon',
          time: '12:30 PM',
          duration: '1.5 hours',
          name: 'Lunch near Fontainhas',
          description:
            'Enjoy a final relaxed lunch before your last stop.',
          estimatedCost: 600,
          mapsQuery: 'restaurants near Fontainhas Goa',
        },
        {
          id: 'day3-evening',
          period: 'Evening',
          time: '4:00 PM',
          duration: '1 hour',
          name: 'Dona Paula',
          description:
            'End your getaway with coastal views and time to reflect.',
          estimatedCost: 100,
          mapsQuery: 'Dona Paula Goa',
        },
      ],
    },
  ],
}

export function getEstimatedTotal(plan) {
  return plan.itinerary.reduce(
    (tripTotal, day) =>
      tripTotal +
      day.stops.reduce(
        (dayTotal, stop) => dayTotal + stop.estimatedCost,
        0,
      ),
    0,
  )
}

export function getMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}