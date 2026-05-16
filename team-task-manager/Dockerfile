FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Run the build script which installs dependencies and builds the frontend
RUN npm run build

# Set the port environment variable (default 5000 if not provided by Railway)
ENV PORT=5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
