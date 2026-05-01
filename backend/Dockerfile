FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
RUN npm install
COPY src/ ./src/
EXPOSE 5001
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm install --only=production
COPY src/ ./src/
EXPOSE 5001
CMD ["node", "src/server.js"]
