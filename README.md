# 📌 산돌이 Repository Template

## 📂 개요

한국공학대학교 실시간 알림 서버 레포지토리 입니다.

---

## 📌 프로젝트 구조

- `Express`, `typeorm`, `postgresSQL`, `puppeteer`

---

## 📌 문서

- **(API 문서 링크를 삽입하세요.)**
  - 예시: `[API 문서 (Swagger)](링크)`, `[API 문서 (Notion)](링크)`
- **(이 Repository에서 제공하는 서비스 관련 문서를 추가하세요.)**
  - 예시: `챗봇 명령어 목록`, `웹 서비스 이용 가이드`, `Webhook 사용법` 등

---

### 📌 실행 방법  

#### 기본 실행 (모든 서비스 실행)  

```bash
git clone --recurse-submodules https://github.com/teamSANDOL/sandol_notice_notification.git

git submodule update --remote --recursive


# 배포 환경
docker compose -f docker-compose.yml -f sandol_amqp up -d --build
# 또는 npm run docker:dev:up
npm run docker:dev:up

# 개발 환경
docker compose -f docker-compose.dev.yml -f sandol_amqp up -d --build
# 또는
npm run docker:prod:up
```

---

## 📌 배포 가이드  

- 서브 모듈의 .env.amqp 파일이 필요합니다. 실행시 꼭 서브모듈을 로드해 주세요  
  - git clone시 --recuse-submodules 옵션과 함께 하기
  
- docker compose -f docker-compose.yml -f sandol_amqp/docker-compose.yml up 을 이용합니다.
- headlthcheck를 이용해 실행 의존성을 설정 하였습니다.

---

## 📌 문의  

- **(디스코드 채널 링크를 삽입하세요)**

---
🚀 **산돌이 프로젝트와 함께 효율적인 개발 환경을 만들어갑시다!**  
