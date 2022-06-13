FROM node:16.14.0 AS client
WORKDIR /app
COPY ./client .
RUN npm i
RUN npm run build


FROM node:16.14.0 AS server
WORKDIR /app
COPY . .
COPY --from=client /app/dist ./client/dist
RUN npm i
RUN npm run build
CMD ["node", "dist/main.js"]