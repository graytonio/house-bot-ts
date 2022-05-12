FROM node:17 AS builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:17
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY --from=builder /app/build/* ./

RUN yarn install

CMD ["yarn", "docker"]