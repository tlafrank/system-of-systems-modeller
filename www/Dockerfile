FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# copy the rest of the app
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","app.js"]
