FROM node:18-alpine

# Create and set the working directory
WORKDIR /app

# Copy the npm package.json and install dependencies
COPY front-end/package.json front-end/
COPY front-end/package-lock.json front-end/
RUN cd front-end && npm install

# Copy the npm app source front-end
COPY front-end /app/front-end

# Expose the port for the npm app
EXPOSE 3000

# Command to run the npm app
CMD ["npm", "start","--prefix","/app/front-end"]
