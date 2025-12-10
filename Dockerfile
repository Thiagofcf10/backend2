FROM node:18-alpine

WORKDIR /app

# copy package files first for caching
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --only=production || npm install --production

# copy source
COPY . .


EXPOSE 3333

CMD ["node", "src/server.js"]
