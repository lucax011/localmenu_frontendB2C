# Local Menu B2C - Testing Guide

## Prerequisites
1. Backend must be running at `http://localhost:3000` (or the URL configured in `.env`)
2. Backend should have at least one restaurant with a published menu

## Setup
```bash
npm install --legacy-peer-deps
```

## Running the App

### Web
```bash
npx expo start --web
```

### iOS
```bash
npx expo start --ios
```

### Android
```bash
npx expo start --android
```

### Mobile (Expo Go)
```bash
npx expo start
# Then scan the QR code with Expo Go app
```

## Testing Checklist

### Home Screen
- [ ] Opens successfully
- [ ] Shows loading indicator while fetching
- [ ] Displays list of restaurants when backend has data
- [ ] Each restaurant card shows name
- [ ] Shows "No restaurants available" when backend has no data
- [ ] Shows error message with retry button on connection error
- [ ] Clicking a restaurant navigates to menu page

### Restaurant Menu Screen
- [ ] Opens successfully with restaurant slug
- [ ] Shows loading indicator while fetching
- [ ] Displays restaurant name and menu name in header
- [ ] Shows search input at top
- [ ] Displays all categories and their items
- [ ] Each item shows: name, price, description
- [ ] Items marked as unavailable show "Currently Unavailable" label
- [ ] Back button returns to home screen

### Search Functionality
- [ ] Typing in search box filters items in real-time
- [ ] Search is case-insensitive (try "PIZZA", "pizza", "Pizza")
- [ ] Search matches partial names (try "sal" to find "salad")
- [ ] Shows "No items match your search" when no results
- [ ] Clearing search shows all items again
- [ ] Search works across all categories

## Expected API Responses

### GET /public/restaurants
```json
[
  {
    "id": 1,
    "name": "Test Restaurant",
    "slug": "test-restaurant",
    "menuId": 1
  }
]
```

### GET /public/r/test-restaurant
```json
{
  "restaurant": {
    "id": 1,
    "name": "Test Restaurant"
  },
  "menu": {
    "id": 1,
    "name": "Main Menu",
    "categories": [
      {
        "id": 1,
        "name": "Pizzas",
        "order": 1,
        "items": [
          {
            "id": 1,
            "name": "Margherita",
            "price": 12.99,
            "description": "Classic tomato and mozzarella",
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

## Troubleshooting

### "Failed to load restaurants"
- Check that backend is running
- Verify `EXPO_PUBLIC_API_BASE_URL` in `.env` is correct
- Check browser console or Metro logs for specific error

### "Cannot connect to Metro"
- Try `npx expo start --clear` to clear cache
- Make sure port 8081 is not in use

### TypeScript errors
- Run `npx tsc --noEmit` to check for type errors

### Lint errors
- Run `npm run lint` to check for linting issues

## Unit Tests
```bash
npm test
```

Should pass all 7 tests for the search filter utility.
