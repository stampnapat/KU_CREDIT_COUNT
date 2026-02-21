FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ✅ สร้าง Prisma Client ให้ตรงกับ Linux ใน container
RUN npx prisma generate

RUN npm run build

EXPOSE 8081
CMD ["npm","start"]