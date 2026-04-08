# 1. Use the official Node.js image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the frontend code
COPY . .

ENV NEXT_PUBLIC_API_URL="https://fitnest-backend-7533.onrender.com"

# 5. Build the Next.js application
RUN npm run build

# 6. Expose the port Next.js runs on
EXPOSE 3000

# 7. Start the application
CMD ["npm", "start"]
