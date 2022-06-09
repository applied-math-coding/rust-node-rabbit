FROM node:16.14.0 AS server
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build
CMD ["node", "dist/main.js"]