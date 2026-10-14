// Mood rules using Geoapify's place categories.
// These are our starting rules, not a learned model.
// Later, user ratings will help adjust the rankings.

export const moodProfiles = {
  relaxing: {
    label: 'Relaxing',
    pace: 'Slow-paced visits with plenty of breaks.',
    categories: [
      'beach',
      'leisure.park',
      'catering.cafe',
    ],
  },

  adventurous: {
    label: 'Adventurous',
    pace: 'Outdoor exploration with realistic rest and travel time.',
    categories: [
      'entertainment.activity_park',
      'tourism.attraction.viewpoint',
      'natural',
      'national_park',
    ],
  },

  cultural: {
    label: 'Cultural',
    pace: 'Time to explore local history, art, and architecture.',
    categories: [
      'entertainment.museum',
      'tourism.sights',
      'entertainment.culture',
    ],
  },

  foodie: {
    label: 'Foodie',
    pace: 'Food-focused stops spaced out across the day.',
    categories: [
      'catering.restaurant',
      'catering.cafe',
      'catering.fast_food',
      'catering.food_court',
    ],
  },

  nightlife: {
    label: 'Nightlife',
    pace: 'Easy mornings with more activity in the evening.',
    categories: [
      'catering.bar',
      'catering.pub',
      'entertainment.culture.theatre',
    ],
  },
}

// We also search for meal options, regardless of the chosen mood.
export const mealCategories = [
  'catering.restaurant',
  'catering.cafe',
  'catering.fast_food',
]

export function getMoodProfile(mood) {
  if (!Object.hasOwn(moodProfiles, mood)) {
    throw new Error('Please choose a valid travel mood.')
  }

  return moodProfiles[mood]
}

export function getMoodScore(placeCategories, mood) {
  const profile = getMoodProfile(mood)

  // Earlier categories in each mood's list have higher priority.
  return profile.categories.reduce((bestScore, category, index) => {
    const matches = placeCategories.some(
      (placeCategory) =>
        placeCategory === category ||
        placeCategory.startsWith(`${category}.`),
    )

    const score = matches
      ? (profile.categories.length - index) * 10
      : 0

    return Math.max(bestScore, score)
  }, 0)
}