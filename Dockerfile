FROM node:20.11.0-alpine

# puppeteer 의 크롤링을 위한 설정
# https://github.com/puppeteer/puppeteer/issues/7740#issuecomment-1081225615
RUN apk add --no-cache \
  msttcorefonts-installer font-noto fontconfig \
  freetype ttf-dejavu ttf-droid ttf-freefont ttf-liberation \
  chromium \
  && rm -rf /var/cache/apk/* /tmp/*

RUN update-ms-fonts \
  && fc-cache -f

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 작업 디렉토리 설정
WORKDIR /app

# 종속성 파일 복사 및 설치
COPY package.json package-lock.json ./
RUN npm ci

# 권한 없는 pptruser 유저 추가
RUN addgroup pptruser \
  && adduser pptruser -D -G pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser

# Create dist directory and set permissions
RUN mkdir -p /app/dist && \
  chown -R pptruser:pptruser /app && \
  chmod -R 755 /app

USER pptruser

# 애플리케이션 코드 복사
COPY --chown=pptruser:pptruser . .

# 빌드
RUN npm run build

# Remove dev dependencies after build
RUN npm ci --omit=dev

EXPOSE 8081
ENV PORT 8081
ENV NODE_ENV production

# 컨테이너 실행 시 기본 명령어 설정
CMD ["npm", "run", "start:prod"]
