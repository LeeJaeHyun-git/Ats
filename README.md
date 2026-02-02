# 🚀 Ats (Korean Intelligent ATS Solution)
> **Spring Boot & Flask 하이브리드 아키텍처 기반의 지능형 채용 관리 솔루션** > *Spring Boot & Flask Hybrid Architecture based Intelligent ATS*

![Java](https://img.shields.io/badge/Java-21-blue?logo=openjdk&logoColor=white) 
![SpringBoot](https://img.shields.io/badge/SpringBoot-3.5.9-green?logo=springboot&logoColor=white) 
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) 
![Python](https://img.shields.io/badge/Python-3.12-yellow?logo=python&logoColor=white) 
![Oracle](https://img.shields.io/badge/Oracle-21c-F80000?logo=oracle&logoColor=white)

## 📖 프로젝트 개요 (Overview)
**Ats**는 한국 기업의 채용 프로세스에 특화된 **올인원 채용 관리 시스템**입니다.  
기존 채용 플랫폼의 경직된 구조를 탈피하여 **전형 단계(Step)를 자유롭게 커스터마이징** 할 수 있으며, **RAG(검색 증강 생성) 기반의 AI 비서**를 통해 채용 공고 작성 업무를 획기적으로 단축시킵니다.

### 🎯 핵심 목표 및 특징
* **AI 기반 업무 자동화:** 직무 키워드만 입력하면 RAG 기술이 적용된 AI가 완성도 높은 공고 초안을 작성.
* **유연한 프로세스 설계:** 기업/공고별로 상이한 채용 단계(서류-면접-과제 등)와 사전 질문을 동적으로 구성 (Dynamic Workflow).
* **하이브리드 아키텍처:** Spring Boot(안정성)와 Flask(AI 확장성)의 장점을 결합한 이종 서버 간 통신 구현.
* **사용자 중심 UX:** React SPA 기반의 부드러운 화면 전환과 드래그 앤 드롭(DnD) UI 제공.

---

## 🛠 기술 스택 (Tech Stack)

### Backend (Core)
* **Framework:** Spring Boot 3.5.9
* **Language:** Java 21
* **Database:** Oracle Database 21c (ojdbc11)
* **ORM:** JPA (Hibernate), **QueryDSL 5.0** (동적 쿼리 및 검색 최적화)
* **Security:** Spring Security (Custom API Auth, PasswordEncoder)
* **Build Tool:** Gradle

### Frontend (User Interface)
* **Library:** React 19 (SPA Architecture)
* **Styling:** Bootstrap 5, React-Bootstrap
* **State Management:** Context API (`AuthContext` - 세션 및 전역 상태 관리)
* **HTTP Client:** Axios (Interceptor & Proxy Middleware 설정)

### AI & Data Engineering
* **Server:** Python Flask
* **LLM Model:** Ollama (**gemma3:4b**)
* **Algorithm:** **RAG (Retrieval-Augmented Generation)**
    * **Retrieval:** Scikit-learn (TF-IDF Vectorizer, Cosine Similarity)
    * **Generation:** Ollama API Integration
* **Data:** Custom CSV Dataset (직무별 기술 요건 데이터셋 구축)

---

## 💡 주요 기능 (Key Features)

### 1. 🤖 RAG 기반 AI 채용 비서 (AI Assistant)
* **기능:** 사용자가 "백엔드 개발자 공고 써줘"라고 요청하면, 사전에 구축된 직무 데이터셋(CSV)에서 가장 유사한 기술 요건을 검색(Retrieval)하여 LLM이 정확한 공고 초안을 작성합니다.
* **기술:** `TF-IDF` 벡터화 및 `Cosine Similarity` 검색 알고리즘 적용.
* **UX:** 챗봇이 작성한 내용을 **[적용하기]** 버튼 클릭 한 번으로 작성 폼(Form)에 자동 입력.

### 2. 📝 커스텀 채용 공고 관리 (Custom Workflow)
* **기능:** 공고별로 **채용 단계(서류 → 1차 면접 → 과제 → 최종 면접)**를 자유롭게 추가/삭제/순서 변경이 가능합니다.
* **기술:** `Jobs` ↔ `JobSteps` ↔ `JobQuestions` 테이블 간의 **1:N 연관관계** 매핑 및 `orphanRemoval=true`를 통한 생명주기 관리.

### 3. 🔍 QueryDSL 기반 동적 검색 (Dynamic Search)
* **기능:** 지역, 직무 카테고리, 고용 형태, 키워드 등 다양한 조건의 복합 필터링 지원.
* **기술:** QueryDSL의 `BooleanBuilder`와 `BooleanExpression`을 활용하여 **Null-Safe**한 동적 쿼리 구현.

### 4. 🔐 하이브리드 아키텍처 & 보안 (Architecture & Security)
* **기능:** React(User) ↔ Spring Boot(Biz Logic) ↔ Flask(AI Worker) 구조.
* **기술:**
    * `RestTemplate`을 이용한 Spring-Flask 서버 간 통신 및 예외 처리.
    * `http-proxy-middleware`를 이용한 CORS 해결 및 세션 쿠키 공유.
    * `PasswordEncoderFactories`를 활용한 비밀번호 암호화 (`{bcrypt}`, `{noop}` 유동적 지원).

---

## 🏗 시스템 아키텍처 (System Architecture)

```mermaid
graph LR
    User["User (React Client)"] -->|API Request| Spring["Spring Boot Server"]
    Spring -->|JPA/QueryDSL| DB[("Oracle DB")]
    Spring -->|REST API (JSON)| Flask["Flask AI Server"]
    Flask -->|Vector Search| Vector[("TF-IDF Vectorizer")]
    Flask -->|Prompt Injection| LLM["Ollama (Gemma Model)"]
    LLM -->|Generated Text| Flask
    Flask -->|Response| Spring
    Spring -->|Response| User
