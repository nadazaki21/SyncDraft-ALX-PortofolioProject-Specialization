# Use the official Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Serve the app using a static server (like serve)
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3001

# Command to run the app
CMD ["serve", "-s", "build"]
