# Pastebin-Lite

A simple, full-stack Pastebin clone built as an interactive CLI agent demonstration. It allows users to create and view text pastes with optional expiration times (Time-To-Live) and view limits.

## 1. Project Description
This project showcases a basic Pastebin-like application designed with a decoupled frontend and backend, demonstrating robust persistence, API design, and client-side interaction with server-side logic.

## 2. Tech Stack
-   **Backend:** Node.js with Express.js
    -   **Persistence:** Redis (Upstash-compatible)
-   **Frontend:** React.js (Vite)

## 3. How to Run Locally

### Prerequisites
-   Node.js (v18+) and npm
-   Redis server (e.g., via Docker, a local installation, or an Upstash instance)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd Pastebin-Lite
    ```

2.  **Set up Backend (Server):**
    ```bash
    cd server
    npm install
    ```
    *   **Configure Environment Variables:**
        Create a `.env` file in the `server/` directory with the following content:
        ```
        REDIS_URL="redis://localhost:6379" # Replace with your Upstash Redis URL if applicable
        PORT=5000
        CLIENT_URL="http://localhost:5173" # URL of your React development server
        # TEST_MODE=1                      # Uncomment to enable deterministic time for testing
        ```
        *If you're using a local Redis server, `redis://localhost:6379` is typically correct.*

    *   **Start the Backend:**
        ```bash
        npm run dev
        ```
        The backend server will start on `http://localhost:5000`.

3.  **Set up Frontend (Client):**
    ```bash
    cd ../client
    npm install
    ```
    *   **Start the Frontend:**
        ```bash
        npm run dev
        ```
        The frontend application will typically open in your browser at `http://localhost:5173`. API requests to `/api` will be automatically proxied to the backend server at `http://localhost:5000` by the Vite development server (configured in `client/vite.config.js`).

4.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:5173`.

## 4. Environment Variables

### Backend (`server/.env`)
-   `REDIS_URL`: **Required.** Connection string for your Redis database. (e.g., `redis://localhost:6379` or `rediss://...` for Upstash).
-   `PORT`: **Optional.** Port for the Express server to listen on. Defaults to `5000`.
-   `CLIENT_URL`: **Required for local development redirection.** The URL of your React frontend development server (e.g., `http://localhost:5173`). Used by the backend to redirect client-side routes in `development` mode.
-   `TEST_MODE`: **Optional.** Set to `1` to enable deterministic time via `x-test-now-ms` header for expiry logic testing.

### Frontend (`client/`)
The frontend does not require a `.env` file for local development, as API requests are handled by Vite's proxy.

## 5. Persistence Layer and Rationale

-   **Redis:** Chosen as the persistence layer due to its speed, serverless compatibility (especially with Upstash), and robust support for atomic operations.
-   **Why Redis:**
    -   **Performance:** Redis is an in-memory data store, offering extremely fast read/write operations, ideal for a Pastebin where quick access to paste content is paramount.
    -   **Serverless-Friendly:** Services like Upstash provide serverless Redis instances, which scale on demand and integrate well with serverless function environments (like Vercel).
    -   **Atomic Operations:** Crucial for safely managing view counts (`HINCRBY`) and preventing race conditions under concurrent access.
    -   **Flexible Data Structures:** Redis Hashes are used to store paste metadata and content efficiently, allowing for easy retrieval and modification of individual paste properties.

## 6. Key Design Decisions

-   **Full-Stack Separation:** Clear division between backend (Node.js/Express) and frontend (React/Vite) for maintainability and and independent scalability.
-   **API-First Approach:** The backend provides a RESTful API, consumed by both the React frontend and directly accessible if needed.
-   **Atomic View Counting:** Implemented using Redis `HINCRBY` to guarantee that paste view limits are accurately enforced without race conditions. Pastes are automatically deleted from Redis when views are exhausted.
-   **Manual Expiry:** Paste expiration is handled by checking an `expires_at` timestamp on each retrieval, rather than relying on Redis key TTLs. This ensures consistent logic regardless of Redis configuration and allows for more nuanced handling (e.g., cleaning up on view, and a single point of truth for expiry rules).
-   **Safe HTML Rendering (XSS Protection):** The client-side rendered content (e.g., when displaying paste content) escapes HTML characters to prevent Cross-Site Scripting vulnerabilities.
-   **Development Workflow:**
    -   **Vite Proxy:** The Vite dev server proxies `/api` requests to the backend, avoiding CORS issues and hardcoded URLs in the frontend code.
    -   **Backend Redirect:** A `CLIENT_URL`-based redirect on the backend handles client-side routes during local development, allowing the React router to function correctly.
    -   `nodemon` is used for automatic backend restarts during development.
-   **Deterministic Time for Testing:** An `x-test-now-ms` request header (enabled via `TEST_MODE=1`) allows simulating future times for expiration testing without altering system clocks or `created_at` timestamps.

## 7. Deployment Notes

This project is configured for easy deployment to **Vercel**.

### Vercel Configuration

The `vercel.json` file at the root configures Vercel to:
-   Deploy the Express backend as a serverless function (`/server/index.js`).
-   Build the React frontend and serve it as static assets.
-   Rewrite all `/api` requests to the serverless function.
-   Route all other requests to the frontend's `index.html` for client-side routing.

### Environment Variables on Vercel

You **must** set the following environment variables in your Vercel project settings:
-   `REDIS_URL`: The connection string to your Upstash Redis database.
-   `PORT`: Vercel automatically assigns a port, so this variable is not strictly necessary but can be set to `5000` for consistency.
-   `TEST_MODE`: (Optional) If you want to enable deterministic time in your Vercel deployment, set this to `1`.

*The `CLIENT_URL` is only for local development redirection and is not needed for Vercel.*