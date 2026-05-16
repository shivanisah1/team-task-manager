FROM node:20

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies and build
RUN npm --prefix frontend install
RUN npm --prefix backend install
RUN npm --prefix frontend run build

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
