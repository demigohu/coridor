FROM node:20-alpine

WORKDIR /app

# Dependencies installed on HOST first (`npm install` in coridor-server/)
# Avoids npm ETIMEDOUT inside Docker on slow WSL networks.
COPY package.json package-lock.json ./
COPY node_modules ./node_modules
COPY src ./src
COPY public ./public

EXPOSE 8091
CMD ["npm", "start"]
