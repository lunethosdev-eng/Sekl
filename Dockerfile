FROM node:22-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar yt-dlp con pip (más confiable que el binario)
RUN pip3 install --break-system-packages -U yt-dlp

# Actualizar yt-dlp a nightly (recomendado)
RUN yt-dlp -U || true

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Si tienes cookies.txt, se copiará automáticamente
CMD ["node", "src/server.js"]
