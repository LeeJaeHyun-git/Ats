# 🚀 지능형 채용 관리 솔루션 (Intelligent ATS)

> **Spring Boot & Flask 하이브리드 아키텍처 기반의 RAG 챗봇 연동 채용 관리 시스템** > **개발 기간:** 2025.12.01 ~ 2026.01.27 (8주)  
> **Project Leader:** 이재현 (Full Stack & AI Integration)

---

## 📖 프로젝트 개요
기존 채용 플랫폼의 경직된 프로세스와 수작업의 비효율성을 해결하기 위해 개발된 **한국형 ATS(Applicant Tracking System)**입니다.  
기업별 맞춤형 전형 단계 설정부터 AI 기반 공고 작성 보조까지, 채용 담당자의 업무 효율을 극대화하는 것을 목표로 합니다.

### 💡 핵심 특화점
1.  **Hybrid Architecture**: 안정적인 Spring Boot(백엔드)와 유연한 Flask(AI 서빙)의 이종 서버 결합
2.  **AI RAG Chatbot**: 사내 데이터를 기반으로 직무 기술서(JD) 초안을 자동 생성 및 추천 (Gemma/Llama 모델 활용)
3.  **Dynamic Workflow**: 채용 공고별 전형 단계와 지원 문항을 동적으로 추가·수정·삭제하고, 항목 추가 및 삭제에 따른 표시 순서를 자동 관리하는 맞춤형 입력 폼 구현

---

## 🛠 기술 스택 (Tech Stack)

| Category | Technology |
| --- | --- |
| **Frontend** | React 19, Bootstrap 5, Axios |
| **Backend (Main)** | Java 21, Spring Boot 3.5, Spring Security, JPA/Hibernate, QueryDSL |
| **Backend (AI)** | Python 3.10, Flask, Scikit-learn (TF-IDF), Ollama - gemma3:4b(LLM) |
| **Database** | Oracle Database 23ai free (RDBMS) |
| **Infrastructure** | Spring Security CORS, Gradle, RESTful API |

---

## 🏗 시스템 아키텍처 (System Architecture)

```mermaid
flowchart TD
    React["React SPA / Browser :3000"]
    Spring["Spring Boot :8080"]
    Flask["Flask AI Server :5000"]
    DB[("Oracle DB")]
    Ollama["Ollama / Gemma"]

    React -->|"Axios 직접 요청 (CORS)"| Spring
    Spring -->|"RestTemplate"| Flask
    Spring -->|"JPA / QueryDSL"| DB
    Flask -->|"LLM 요청"| Ollama
```

---

## 💾 데이터베이스 설계 (ERD)
<img width="1470" height="2516" alt="Image" src="https://github.com/user-attachments/assets/a8ce3b9d-ce10-4d3a-b517-44307c8cbb17" />
<img width="647" height="613" alt="Image" src="https://github.com/user-attachments/assets/a9821502-b5c9-492a-beff-af0567cd50ee" />

---

✨ 주요 기능 (Key Features)
1. 🤖 AI 채용 비서 (RAG Chatbot)

기능: 사용자의 자연어 요청("자바 백엔드 신입 공고 써줘")을 분석하여 직무 기술서 초안 생성

기술: TF-IDF 벡터 유사도 검색 + LLM(Gemma/Llama)을 활용한 RAG(검색 증강 생성) 구현

연동: React에서 생성된 초안을 공고 작성 폼에 원클릭 적용 가능

2. 📝 유연한 공고 관리 (Job Management)

커스텀 전형: 서류전형, 코딩테스트, 면접 등 채용 공고별 전형 단계를 동적으로 추가·수정·삭제할 수 있으며, 항목 추가 시 순서값을 부여하고 삭제 시 남은 단계의 순서값을 자동 재계산

지원 문항 관리: 채용 공고별 지원 문항의 추가·수정·삭제 기능을 제공하고, 문항 유형(질문형·안내형)과 필수 응답 여부를 설정할 수 있도록 구현 

UI/UX: 직관적인 UI 제공

상태 관리: 모집 중(OPEN) / 마감(CLOSED) 상태 관리 및 스케줄러를 통한 자동 마감 처리

3. 🔐 보안 및 인증 (Security)

권한 분리: 기업 담당자(Recruiter)와 구직자(Guest)의 접근 권한을 철저히 분리

하이브리드 통신 보안: React가 AI 서버에 직접 접근하지 않고, Spring Boot를 Gateway로 경유하여 보안성 강화

---

🔥 트러블 슈팅 (Troubleshooting)

이슈 1: React–Spring 간 CORS 및 Spring–Flask 서버 연동 문제

문제: React 개발 서버(3000)와 Spring Boot 서버(8080)가 서로 다른 출처에서 실행되어 브라우저의 교차 출처 요청 처리가 필요하고, 별도로 실행되는 Flask AI 서버(5000)와의 통신 구조를 구성해야 하는 문제

해결:

React의 Axios 인스턴스에 Spring Boot 서버 주소(http://localhost:8080)를 설정하여 REST API를 직접 호출

Spring Security의 CorsConfigurationSource에서 React 개발 서버의 출처(http://localhost:3000)와 인증 정보가 포함된 요청을 허용하도록 설정

Spring Boot의 ChatController에서 RestTemplate을 이용하여 Flask AI 서버의 챗봇 API로 요청을 중계

React가 Flask 서버에 직접 접근하지 않고 Spring Boot를 통해 AI 기능을 호출하도록 통신 경로를 구성

이슈 2: 동적 입력 폼 데이터의 순서 정합성 유지

문제: 사용자가 채용 공고 작성 과정에서 전형 단계(JobStep)와 지원 문항(JobQuestion)을 동적으로 추가하거나 삭제할 때, 항목의 표시 순서(Order)가 불연속적으로 관리될 수 있는 문제

해결:

프론트엔드 순서 관리: React에서 전형 단계와 지원 문항을 추가할 때 배열 길이를 기준으로 순서값을 부여하고, 항목 삭제 시 배열 인덱스를 기준으로 남은 항목의 order 값을 재계산하여 순서 정합성을 유지

데이터 저장: 공고 등록 및 수정 요청 시 JobRequestDto를 통해 전형 단계와 지원 문항의 순서 정보를 Spring Boot 서버로 전달하고, JPA 엔티티에 반영하여 데이터베이스에 저장

백엔드 재정렬 API: JobReorderRequestDto를 통해 변경된 ID 목록을 수신하는 별도의 순서 변경 API(PUT /api/jobs/{jobId}/reorder)를 구현

JPA 변경 감지 활용: @Transactional 환경에서 각 엔티티의 updateOrder() 메서드로 순서값을 변경하고, JPA의 변경 감지(Dirty Checking)를 통해 트랜잭션 종료 시 변경 사항을 데이터베이스에 반영

---

## 📂 프로젝트 구조 (Project Structure)

### 1. AtsProject-Ats (Main Service)
```bash
AtsProject-Ats
├── ☕ backend (Spring Boot)
│   ├── src/main/java/min/boot/ats
│   │   ├── component   # JobScheduler
│   │   ├── config      # Security, QueryDSL, Password 설정
│   │   ├── control     # REST API Controller
│   │   ├── domain      # JPA Entity
│   │   ├── dto         # Request/Response DTO
│   │   ├── repo        # Repository & Custom QueryDSL
│   │   └── service     # 비즈니스 로직
│   └── build.gradle
│
└── ⚛️ front (React)
    ├── src
    │   ├── api         # Axios 인스턴스 설정
    │   ├── components  # Chatbot
    │   ├── context     # AuthContext (로그인 상태 관리)
    │   ├── pages       # 주요 페이지
    │   └── setupProxy.js # Proxy 설정
    └── package.json
```

### 2. AtsProject-Chatbot (AI Microservice)
```bash
AtsProject-Chatbot
├── 🐍 ai-server (Flask)
│   └── myApp
│       └── app.py      # Flask 서버 진입점 & RAG 로직
└── data            # 학습용 데이터셋 (ChatbotData.csv, 답변 실패 로그 파일 포함)
```

---


