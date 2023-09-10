FROM node:16
WORKDIR /Users/surajithreddy/Documents/express/node-project
COPY package*.json ./
COPY prisma ./prisma/ 
RUN npm install
RUN npm uninstall bcrypt
RUN npm i bcrypt
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]