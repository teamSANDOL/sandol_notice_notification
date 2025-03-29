# 📌 산돌이 공지사항 알림 서버

## 📂 개요

한국공학대학교 공지사항 실시간 알림 서버입니다. 공지사항을 크롤링하여 실시간으로 알림을 제공합니다.

---

## 📌 프로젝트 구조

- `NestJS`, `TypeORM`, `PostgreSQL`, `RabbitMQ`, `Puppeteer`

---

## 📌 문서

- [API 문서 (Swagger)](http://localhost:3000/doc)
  - API 엔드포인트 및 요청/응답 스키마 확인
  - API 테스트 및 디버깅
- [서비스 가이드](https://github.com/your-org/sandol_notice_notification/wiki)
  - 크롤링 설정
  - 알림 설정
  - 데이터베이스 관리

---

## 📌 환경 설정

- **모든 서비스는 Docker 기반으로 실행되므로, 로컬 환경에 별도로 의존하지 않음**  
- **환경 변수 파일 (`.env.dev`) 필요**  
- **Docker Compose를 통해 서비스 간 네트워크 및 볼륨을 설정**  

### 📌 실행 방법  

#### 1. 개발 환경 실행

```bash
# 모든 서비스 실행 (앱, DB, RabbitMQ)
docker compose -f docker-compose.dev.yml up -d

# 특정 서비스만 실행
docker compose -f docker-compose.dev.yml up -d app
docker compose -f docker-compose.dev.yml up -d db
docker compose -f docker-compose.dev.yml up -d amqp
```

#### 2. 프로덕션 환경 실행

```bash
# 프로덕션 서비스 실행
docker compose up -d
```

#### 3. 서비스 중지  

```bash
# 개발 환경 중지
docker compose -f docker-compose.dev.yml down

# 프로덕션 환경 중지
docker compose down
```

#### 4. 환경 변수 변경 후 재시작  

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

---

## 📌 배포 가이드  

### CI/CD
- GitHub Actions를 통한 자동 배포
- Docker 이미지 자동 빌드 및 푸시

### 환경 변수
- `.env.dev`: 개발 환경 설정
- `.env`: 프로덕션 환경 설정
- `sandol_amqp/.env.amqp`: RabbitMQ 설정

### 배포 주의사항
- 프로덕션 환경에서는 반드시 `.env` 파일 설정 필요
- 데이터베이스 백업 설정 필요
- SSL 인증서 설정 필요

---

## 📌 문의  

- [산돌이 디스코드](https://discord.gg/your-invite)

---
🚀 **산돌이 프로젝트와 함께 효율적인 개발 환경을 만들어갑시다!**
****