FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install

CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
