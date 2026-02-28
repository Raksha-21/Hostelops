# HostelOps — Smart Hostel Complaint Management System

## 🚀 Quick Deploy (One Command)

```bash
# Clone and deploy
git clone <your-repo>
cd hostelops
echo "JWT_SECRET=your_secret_here" > .env
docker-compose up --build -d
```
Access at: **http://localhost** or **http://YOUR_EC2_IP**

---

## 🏗 Architecture

```
Internet (Port 80 only)
    ↓
[Nginx Container]  ← Reverse proxy, rate limiting, security headers
    ↓           ↓
/api/*         /
    ↓           ↓
[Backend]   [Frontend]     ← Internal Docker network (not public)
Node.js:5000  Nginx:80
    ↓
[MongoDB]                  ← Internal only, never exposed
mongo:27017
```

## 📁 Project Structure
```
hostelops/
├── backend/             Node.js API
│   ├── controllers/     Route handlers
│   ├── middleware/      JWT auth
│   ├── models/          Mongoose schemas
│   ├── routes/          Express routes
│   ├── server.js        Entry point
│   └── Dockerfile
├── frontend/            Single-page app
│   ├── index.html       Full glassmorphism UI
│   ├── nginx-spa.conf   SPA routing
│   └── Dockerfile
├── nginx/
│   └── nginx.conf       Reverse proxy config
├── docker-compose.yml   Orchestration
└── .env                 Secrets (never commit!)
```

## 🔑 Default Credentials
| Role    | Email                | Password   |
|---------|----------------------|------------|
| Admin   | admin@hostel.com     | admin123   |
| Student | student@hostel.com   | 123456     |

## 🔒 Security
- Only Port 80 exposed publicly
- Backend port 5000 internal only
- MongoDB port 27017 internal only
- JWT authentication on all protected routes
- Rate limiting: 60 req/min API, 10 req/min auth
- Helmet.js security headers
- CORS configured

## 🐳 Docker Commands
```bash
# Start
docker-compose up --build -d

# Logs
docker-compose logs -f backend

# Stop
docker-compose down

# Check status
docker-compose ps

# Shell into backend
docker exec -it hostelops-backend sh
```

## 🌐 AWS Deployment
1. Launch EC2 t2.micro (Ubuntu 22.04)
2. Security Groups: Port 22 (your IP), Port 80 (0.0.0.0/0)
3. SSH in and install Docker
4. Clone project and run docker-compose up
5. Assign Elastic IP
