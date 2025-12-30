# Pastebin-Lite

A simple, full-stack Pastebin clone that allows users to create and view text pastes with optional expiration times and view limits.

## 1. Project Description
This project implements a basic Pastebin-like application with a decoupled frontend and backend.

-   **Backend (`/api`):** A Node.js and Express server responsible for handling paste creation, retrieval, and persistence with Redis.
-   **Frontend (`/client`):** A React (Vite) single-page application that provides the user interface for creating and viewing pastes.

## 2. Tech Stack
-   **Backend:** Node.js with Express.js
-   **Persistence:** Redis
-   **Frontend:** React.js (Vite)

## 3. API Endpoints

The backend provides the following endpoints:

-   `POST /api/pastes`: Creates a new paste.
    -   **Body:** `{ "content": "...", "ttl_seconds": 3600, "max_views": 5 }`
-   `POST /api/pastes/:id/view`: Retrieves a paste's content and decrements its view counter. This is the primary endpoint for viewing a paste.
-   `GET /api/pastes/:id`: Retrieves a paste's content without decrementing the view counter.
-   `GET /api/healthz`: A health check endpoint to verify the server is running and connected to Redis.

## 4. How to Run Locally

### Prerequisites
-   Node.js (v18+) and npm
-   A running Redis server

### Steps

1.  **Clone the repository and install dependencies:**
    ```bash
    git clone <your-repo-url>
    cd Pastebin-Lite

    # Install backend dependencies
    cd api
    npm install

    # Install frontend dependencies
    cd ../client
    npm install
    cd ..
    ```

2.  **Configure Backend Environment:**
    In the `/api` directory, create a `.env` file from the example:
    ```
    PORT=5000
    REDIS_URL=redis://localhost:6379
    # TEST_MODE=1 # Uncomment to enable deterministic time for testing
    ```

3.  **Configure Frontend Environment:**
    In the `/client` directory, create a `.env` file from the example. It must point to your local backend server.
    ```
    VITE_API_BASE_URL=http://localhost:5000
    ```

4.  **Run Both Services:**
    Open two separate terminals.
    ```bash
    # In terminal 1: Start the backend
    cd api
    npm run dev
    ```
    ```bash
    # In terminal 2: Start the frontend
    cd client
    npm run dev
    ```

5.  **Access the Application:**
    Open your web browser and navigate to the URL provided by the Vite development server (usually `http://localhost:5173`).

## 4. Deployment

This project is designed for a decoupled deployment: the backend on a service like Render, and the frontend on Vercel.

### Backend (Render)
1.  Push your code to a GitHub repository.
2.  On Render, create a new "Web Service" and connect it to your repository.
3.  Render will detect the `package.json` in the `/api` directory. You may need to set the "Root Directory" to `api`.
4.  Set the "Start Command" to `npm start`.
5.  Add the following Environment Variables in the Render dashboard:
    -   `REDIS_URL`: The connection string for your production Redis instance (e.g., from Upstash or Render Redis).
    -   `PORT`: Render provides this automatically, but you can set it to `5000`.

### Frontend (Vercel)
1.  Push your code to a GitHub repository.
2.  On Vercel, create a new project and connect it to your repository.
3.  Configure the project settings:
    -   **Root Directory:** Set to `client`.
    -   **Framework Preset:** Select `Vite` (auto-detect is usually fine).
4.  **Add `client/vercel.json`:** To ensure client-side routing (e.g., for `/p/:id` paths) works when directly accessing a URL, you must add a `vercel.json` file inside your `client/` directory with the following content:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
    This tells Vercel to serve `index.html` for any route that is not a real file, allowing React Router to handle the URL.
5.  Add the following Environment Variable in the Vercel project settings:
    -   `VITE_API_BASE_URL`: The public URL of your deployed backend service on Render (e.g., `https://your-backend.onrender.com`).

