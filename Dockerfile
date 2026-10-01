FROM node:22-slim

# 1. Instalar dependencias del sistema (ffmpeg y python3 para yt-dlp)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Descargar e instalar yt-dlp globalmente
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

# 3. Directorio de trabajo
WORKDIR /app

# 4. Instalar dependencias de Node.js
COPY package*.json ./
RUN npm install --production

# 5. Copiar el resto del código
COPY . .

# 6. Comando de arranque
CMD ["node", "src/server.js"]
