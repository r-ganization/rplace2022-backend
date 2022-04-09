FROM node:16-alpine3.15 as builder

WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:16-alpine3.15

WORKDIR /usr/app
COPY --from=builder /usr/app/package*.json ./
COPY --from=builder /usr/app/dist ./

RUN npm install --only=production
EXPOSE 3036

CMD ["node", "index.js"]
