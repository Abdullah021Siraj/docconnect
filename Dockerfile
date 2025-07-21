FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install 

COPY . . 

# RUN npm run build

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]