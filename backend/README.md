# MERN Stack Agent Management System - Backend

Backend API for managing agents and distributing leads from CSV/Excel files.

## Features

- ✅ Admin authentication with JWT
- ✅ Agent creation and management
- ✅ CSV/Excel file upload and parsing
- ✅ Equal distribution of leads among agents
- ✅ Lead tracking and management
- ✅ RESTful API with proper error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload
- **bcryptjs** - Password hashing
- **csv-parser** - CSV parsing
- **xlsx** - Excel file parsing

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/agent_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

4. **Create uploads directory**
```bash
mkdir uploads
```

5. **Start MongoDB** (if using local MongoDB)
```bash
mongod
```

6. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register admin user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Agents

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/agents` | Create new agent | Yes (Admin) |
| GET | `/api/agents` | Get all agents | Yes (Admin) |
| GET | `/api/agents/:id` | Get agent by ID | Yes (Admin) |
| PUT | `/api/agents/:id` | Update agent | Yes (Admin) |
| DELETE | `/api/agents/:id` | Delete agent | Yes (Admin) |

### Leads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/leads/upload` | Upload CSV/Excel file | Yes (Admin) |
| GET | `/api/leads` | Get all leads | Yes (Admin) |
| GET | `/api/leads/distribution` | Get distribution summary | Yes (Admin) |
| GET | `/api/leads/agent/:agentId` | Get leads by agent | Yes (Admin) |
| DELETE | `/api/leads` | Delete all leads | Yes (Admin) |

## API Usage Examples

### 1. Register Admin User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 3. Create Agent

```bash
POST /api/agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "countryCode": "+91",
  "mobile": "9876543210",
  "password": "agent123"
}
```

### 4. Upload CSV/Excel File

```bash
POST /api/leads/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <select file>
```

**CSV Format:**
```csv
FirstName,Phone,Notes
John,9876543210,Important client
Jane,9876543211,Follow up needed
```

## CSV/Excel File Format

The uploaded file must contain these columns:

- **FirstName** (required) - Text
- **Phone** (required) - Number
- **Notes** (optional) - Text

**Accepted file formats:** `.csv`, `.xlsx`, `.xls`

## Lead Distribution Logic

- Leads are distributed equally among all active agents
- If total leads are not divisible by number of agents, remaining leads are distributed sequentially
- Example: 23 leads with 5 agents = 5,5,5,4,4 distribution

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # Admin user model
│   ├── Agent.js             # Agent model
│   └── Lead.js              # Lead model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── agent.js             # Agent routes
│   └── lead.js              # Lead routes
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── agentController.js   # Agent logic
│   └── leadController.js    # Lead logic
├── utils/
│   └── csvParser.js         # CSV/Excel parsing utilities
├── uploads/                 # Uploaded files (temporary)
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── server.js               # Entry point
└── package.json            # Dependencies
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with middleware
- Input validation
- File type validation
- File size limits (5MB)

## Testing with Postman

1. Import the API endpoints into Postman
2. Create an environment variable for `baseUrl` = `http://localhost:5000/api`
3. Create an environment variable for `token` after login
4. Use `{{baseUrl}}` and `{{token}}` in requests

## Common Issues & Solutions

**Issue:** MongoDB connection error  
**Solution:** Check if MongoDB is running and MONGO_URI is correct

**Issue:** JWT token expired  
**Solution:** Login again to get a new token

**Issue:** File upload fails  
**Solution:** Ensure file format is CSV/XLSX/XLS and size is under 5MB

## Development Notes

- Always use proper error handling
- Validate input data
- Use environment variables for sensitive data
- Keep uploaded files temporary (delete after processing)
- Log errors for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License