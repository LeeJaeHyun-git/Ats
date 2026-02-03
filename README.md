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
3.  **Dynamic Workflow**: 드래그 앤 드롭(DnD)으로 전형 단계와 자기소개서 문항을 자유롭게 커스터마이징

---

## 🛠 기술 스택 (Tech Stack)

| Category | Technology |
| --- | --- |
| **Frontend** | React 19, Bootstrap 5, Axios, @hello-pangea/dnd |
| **Backend (Main)** | Java 21, Spring Boot 3.5, Spring Security, JPA/Hibernate, QueryDSL |
| **Backend (AI)** | Python 3.11, Flask, Scikit-learn (TF-IDF), Ollama (LLM) |
| **Database** | Oracle 19c (RDBMS) |
| **Infrastructure** | Http-Proxy-Middleware (CORS 해결), Gradle, RESTful API |

---

## 🏗 시스템 아키텍처 (System Architecture)

```mermaid
graph TD
    User([User / Browser]) -->|React SPA| Proxy[Http Proxy Middleware]
    Proxy -->|/api/*| Spring[Spring Boot Server :8080]
    Proxy -->|/api/chatbot/*| Spring
    Spring -->|RestTemplate| Flask[Flask AI Server :5000]
    Spring -->|JPA/QueryDSL| DB[(Oracle DB)]
    Flask -->|RAG / LLM| AI_Model[[Ollama / Local LLM]]
    Flask -->|Load| CSV[(ChatbotData.csv)]
