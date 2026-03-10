# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage (Node.js)
FROM node:18-alpine
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

# Copy server code
COPY server.js ./

# Cloud Run port
EXPOSE 8080

CMD ["node", "server.js"]
