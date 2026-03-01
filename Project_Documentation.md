# HostelOps: Project Architecture & Deployment Guide

**GitHub Repository:** [https://github.com/Raksha-21/Hostelops](https://github.com/Raksha-21/Hostelops)

This document explains how the HostelOps Complaint Management System is built and deployed using Docker in simple terms.

## 1. Running Deployed Application
The entire application runs using Docker. Docker packages the frontend, backend, database, and a router (Nginx) into isolated "containers." To start the application, you enter the project folder and run:
`docker-compose up -d --build`
This command automatically starts all parts of the application together in the background.

## 2. Architecture Diagram (Container + Reverse Proxy + Port Flow)
This diagram shows how the different parts of our app connect to each other.

```mermaid
graph TD
    User[User's Web Browser]

    subgraph Server (Docker Environment)
        Nginx[Nginx Reverse Proxy\nPort: 80]
        Frontend[Frontend Application]
        Backend[Node.js API\nPort: 5000]
        DB[(MongoDB Database\nPort: 27017)]
    end
    
    User -- "Traffic enters on Port 80" --> Nginx
    Nginx -- "Page Requests (/)" --> Frontend
    Nginx -- "Data Requests (/api/)" --> Backend
    Backend -- "Saves/Reads Data" --> DB
```

**How data flows:**
1. A user visits the website. The request goes to **Port 80**, where **Nginx** is listening.
2. Nginx acts like a traffic cop. If the user wants a web page, Nginx sends them to the **Frontend**. 
3. If the user wants to save or get data (using `/api/`), Nginx sends them to the **Backend**.
4. Only the **Backend** is allowed to talk to the **Database** to keep data safe.

## 3. Nginx Configuration Explanation
Nginx is our "Reverse Proxy." It sits at the front door and handles all incoming traffic.
* **Routing Traffic:** In our `nginx.conf` file, we tell Nginx to send normal requests (like loading the homepage) to the frontend application. We tell it to send any request that starts with `/api/` to the backend application.
* **Security & Privacy:** Because Nginx is the only part of our app that the outside world can talk to, it protects our backend and database from direct attacks. It also passes along important information like the user's IP address to the backend.

## 4. Dockerfile and Container Explanation
We use separate containers for distinct jobs. This keeps things organized.
* **Backend Container (Node.js):** This runs our server logic. We use a lightweight version of Node.js (`node:18-alpine`) to keep the container small and fast. It only installs what is needed to run the app.
* **Frontend Container:** This holds our HTML, CSS, and JavaScript files. Nginx serves these files directly to the user.
* **Database Container (MongoDB):** This stores our complaints and users. It uses a "volume," which means even if the container stops or restarts, our saved data won't be lost.
* **Nginx Container:** This runs the Nginx server to route the traffic as explained above.

## 5. Networking & Firewall Strategy
We use Docker to create private networks for security.
* **Public Network (`proxy`):** Nginx, the Frontend, and the Backend are on this network. This allows Nginx to talk to them.
* **Private Network (`internal`):** Only the Backend and the Database are on this network. This means the Database is completely hidden from the outside world. Nobody can access the database directly; they *must* go through the Backend API.
* **Firewall Strategy:** Only **Port 80** (for standard web traffic) needs to be open on the actual server. All other ports (like the Backend's 5000 or the Database's 27017) are hidden safely inside Docker.

## 6. Request Lifecycle Explanation
Here is the step-by-step journey of a complaint:
1. **The User:** A student fills out a complaint form and clicks "Submit" on the website.
2. **Nginx:** The request reaches our server on Port 80. Nginx sees it's an `/api/complaints` request and forwards it to the Backend.
3. **Backend:** The Node.js server receives the data, checks if it's valid, and creates a command to save it.
4. **Database:** The Backend sends the save command to MongoDB over the private network on Port 27017.
5. **Response:** MongoDB saves the complaint and tells the Backend "Success". The Backend passes this back to Nginx, and Nginx sends the "Success" message back to the student's screen so they know it worked.

## 7. Short Serverful vs Serverless Comparison (Conceptual)
* **Our Approach (Serverful/Containers):** Our application runs continuously inside Docker containers. It is always "on" and ready. This is predictable and gives us full control, but we are using server resources (and paying for them) 24/7 even if no one is using the app at 3 AM.
* **Alternative (Serverless):** In a serverless approach (like AWS Lambda), code only runs when a user makes a request. You don't manage servers, and you only pay for the exact seconds your code runs. However, if the app hasn't been used in a while, the very first request might take longer to load (a "cold start"), and they can be more complicated to set up for complex applications.
