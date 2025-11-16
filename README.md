# Pokémon Favorites Backend API

A Node.js/Express backend API that serves as a proxy to the PokéAPI and manages user favorites with persistent storage.

## 🏗️ Architecture

This backend follows a **Layered Architecture** with **Repository Pattern**:

```
├── Controllers (HTTP Layer)
├── Services (Business Logic)
├── Repositories (Data Access)
└── Utils & Middleware (Cross-cutting concerns)
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── constants.js          # Configuration constants
│   ├── controllers/
│   │   ├── pokemonController.js  # Pokemon endpoint handlers
│   │   └── favoritesController.js # Favorites endpoint handlers
│   ├── services/
│   │   ├── pokemonService.js     # Pokemon business logic
│   │   └── favoritesService.js   # Favorites business logic
│   ├── repositories/
│   │   └── favoritesRepository.js # Data persistence layer
│   ├── middleware/
│   │   └── errorHandler.js       # Error handling middleware
│   ├── utils/
│   │   ├── apiClient.js          # Axios PokéAPI client
│   │   └── logger.js             # Logging utility
│   ├── routes/
│   │   └── index.js              # API routes
│   └── app.js                    # Express app setup
├── data/
│   └── favorites.json            # Persistent storage (auto-generated)
├── .env                          # Environment variables
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
PORT=5000
POKEAPI_BASE_URL=https://pokeapi.co/api/v2
CACHE_TTL=3600
FRONTEND_URL=http://localhost:3000
```

4. **Start the server**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

### Pokémon Endpoints

#### Get all Pokémon (first 150)
```
GET /api/pokemon
```
**Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id": 1,
      "name": "bulbasaur",
      "imageUrl": "https://...",
      "types": ["grass", "poison"],
      "abilities": ["overgrow", "chlorophyll"]
    }
  ]
}
```

#### Get Pokémon by ID
```
GET /api/pokemon/:id
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "pikachu",
    "imageUrl": "https://...",
    "types": [{"name": "electric", "slot": 1}],
    "abilities": [{"name": "static", "isHidden": false}],
    "stats": [...],
    "height": 4,
    "weight": 60,
    "evolutionChain": [...]
  }
}
```

#### Search Pokémon
```
GET /api/pokemon/search?query=pika
```
**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [...]
}
```

### Favorites Endpoints

#### Get all favorites
```
GET /api/favorites
```
**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 25,
      "name": "pikachu",
      "imageUrl": "https://...",
      "addedAt": "2024-11-14T10:30:00.000Z"
    }
  ]
}
```

#### Add to favorites
```
POST /api/favorites
Content-Type: application/json

{
  "id": 25,
  "name": "pikachu",
  "imageUrl": "https://..."
}
```
**Response:**
```json
{
  "success": true,
  "message": "Pokemon added to favorites",
  "data": {...}
}
```

#### Remove from favorites
```
DELETE /api/favorites/:id
```
**Response:**
```json
{
  "success": true,
  "message": "Pokemon removed from favorites",
  "data": { "id": 25 }
}
```

#### Check if Pokémon is favorite
```
GET /api/favorites/:id/check
```
**Response:**
```json
{
  "success": true,
  "data": { "isFavorite": true }
}
```

## 🎯 Key Features

### 1. **Caching**
- In-memory caching using `node-cache`
- Pokémon list cached for 1 hour
- Individual Pokémon details cached
- Reduces API calls to PokéAPI

### 2. **Error Handling**
- Centralized error handling middleware
- Proper HTTP status codes
- Detailed error logging
- Development vs Production error responses

### 3. **Data Persistence**
- File-based JSON storage for favorites
- Auto-initialization of storage
- Atomic read/write operations
- Easy migration path to database

### 4. **CORS Configuration**
- Configured for frontend communication
- Credentials support enabled
- Configurable origin via environment

## 🔧 Configuration

All configuration is managed through environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `POKEAPI_BASE_URL` | PokéAPI base URL | https://pokeapi.co/api/v2 |
| `CACHE_TTL` | Cache time-to-live (seconds) | 3600 |
| `FRONTEND_URL` | Frontend origin for CORS | http://localhost:3000 |

## 📦 Dependencies

### Production
- **express** - Web framework
- **cors** - CORS middleware
- **axios** - HTTP client for PokéAPI
- **dotenv** - Environment configuration
- **node-cache** - In-memory caching

### Development
- **nodemon** - Auto-reload during development

## 🧪 Testing the API

Use tools like Postman, Thunder Client, or curl:

```bash
# Get all Pokémon
curl http://localhost:5000/api/pokemon

# Get specific Pokémon
curl http://localhost:5000/api/pokemon/25

# Add to favorites
curl -X POST http://localhost:5000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"id": 25, "name": "pikachu", "imageUrl": "https://..."}'

# Get favorites
curl http://localhost:5000/api/favorites

# Remove from favorites
curl -X DELETE http://localhost:5000/api/favorites/25
```

## 🚦 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created (new favorite added) |
| 400 | Bad Request (invalid input) |
| 404 | Not Found (Pokémon or favorite not found) |
| 409 | Conflict (Pokémon already in favorites) |
| 500 | Internal Server Error |

## 📝 Logging

All logs include timestamps and log levels:
- **INFO** - General information
- **WARN** - Warnings
- **ERROR** - Errors with stack traces
- **DEBUG** - Debug information (development only)

## 🔄 Upgrade Path

## Bonus Features Implemented

### ✅ MongoDB Integration
- Persistent favorites storage using MongoDB
- Mongoose ODM with proper schema design
- Toggle between file-based and MongoDB storage
- Fallback mechanism if MongoDB unavailable

### ✅ Intelligent Caching
- Node-Cache for PokéAPI responses
- 1-hour TTL reduces API calls
- Separate concerns: cache vs persistence

### To Database (Bonus)

The repository pattern makes it easy to switch to a database:

1. Create `SqliteRepository.js` or `MongoRepository.js`
2. Implement the same interface as `FavoritesRepository`
3. Swap in `favoritesService.js`

```javascript
// const repository = new FavoritesRepository();
const repository = new SqliteRepository();
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env or kill the process
lsof -ti:5000 | xargs kill
```

**CORS errors:**
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check browser console for specific CORS issues

**PokéAPI rate limiting:**
- The cache helps reduce requests
- Consider implementing exponential backoff for retries

## 📄 License

MIT

## 👨‍💻 Development Notes

- Code follows ES6+ standards
- Async/await for asynchronous operations
- Error-first callback pattern avoided in favor of try/catch
- Modular design for easy testing and maintenance
- Comments added for complex logic

## 🎓 Design Patterns Used

1. **Layered Architecture** - Separation of concerns
2. **Repository Pattern** - Data access abstraction
3. **Dependency Injection** - Services receive dependencies
4. **Factory Pattern** - API client creation
5. **Middleware Chain** - Request processing pipeline
