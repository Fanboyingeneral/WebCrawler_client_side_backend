FROM node:16-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

# Default port set via ENV, can be overridden at runtime
ENV CLIENT_BACKEND_PORT 6000

EXPOSE ${CLIENT_BACKEND_PORT}

CMD ["sh", "-c", "node index.js --port=${CLIENT_BACKEND_PORT}"]
