# Stage 1: Build - ใช้ Node.js เพื่อแปลงโค้ด React เป็นไฟล์ Static [cite: 2025-10-27]
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production - ใช้ Nginx เพื่อ Serve ไฟล์ที่ Build เสร็จแล้ว [cite: 2025-10-27]
FROM nginx:stable-alpine as production-stage

# คัดลอกไฟล์ที่ Build เสร็จแล้วจาก Stage แรกมาไว้ที่ Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# คัดลอกไฟล์คอนฟิก nginx.conf ที่เราเพิ่งเขียนกันไปมาทับค่าเดิม
# (สมมติว่าไฟล์ nginx.conf อยู่ในโฟลเดอร์เดียวกับ Dockerfile นี้)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]