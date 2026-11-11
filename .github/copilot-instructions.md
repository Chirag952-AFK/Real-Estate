# Project context
Full-stack Real Estate app.
- Backend: Node.js, Express 4, Mongoose 8, CommonJS (require/module.exports). Folders: backend/{app.js, server.js, config, routes, controllers, models, middleware, utils}. Controllers use try/catch and res.status(x).json({ message }).
- Frontend: React 18 + Vite (JSX, ES modules). src/App.jsx holds all current UI and state. src/services/propertyService.js has a request() helper using fetch and VITE_API_URL. Styling is plain CSS in src/index.css using CSS variables (--primary-red, --card-bg, --border, --text-dark) and classes like primary-button, secondary-button, form-grid.
- Env: backend/.env (PORT, MONGO_URI, NODE_ENV), frontend/.env (VITE_API_URL).

# Rules
- Make minimal, targeted changes. Do not rewrite or break existing features.
- Follow the existing code style and folder structure.
- Never hardcode secrets. Never return password hashes.
- Enforce all permissions on the backend; frontend checks are for UX only.
- After each task, list the files created/modified and the commands I need to run.
- Install backend packages ONLY inside /backend (cd backend && npm install <pkg>) and frontend packages ONLY inside /frontend (cd frontend && npm install <pkg>). Never run npm install in the project root.
 Filtering, sorting and pagination happen on the backend via query params. Always sanitize/escape user search input and validate numeric params.