# 🚀 Ats (Intelligent ATS Solution)
> **Spring Boot & Flask 하이브리드 아키텍처 기반의 지능형 채용 관리 솔루션**
> *Spring Boot & Flask Hybrid Architecture based Intelligent ATS*

![Java](https://img.shields.io/badge/Java-21-blue?logo=openjdk&logoColor=white) 
![SpringBoot](https://img.shields.io/badge/SpringBoot-3.5.9-green?logo=springboot&logoColor=white) 
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) 
![Python](https://img.shields.io/badge/Python-3.12-yellow?logo=python&logoColor=white) 
![Oracle](https://img.shields.io/badge/Oracle-21c-F80000?logo=oracle&logoColor=white)

## 📖 프로젝트 개요 (Overview)
**Ats**는 한국 기업의 채용 프로세스에 특화된 **올인원 채용 관리 시스템**입니다.  
기존 채용 플랫폼의 문제점인 **'경직된 채용 프로세스'**와 **'반복적인 공고 작성 업무'**를 해결하기 위해 개발되었습니다. 
기업은 전형 단계(Step)를 상황에 맞춰 자유롭게 커스터마이징 할 수 있으며, **RAG(검색 증강 생성) 기반의 AI 비서**를 통해 직무에 최적화된 공고를 자동 생성할 수 있습니다.

### 🎯 핵심 목표 (Goals)
* **Process Innovation:** 정형화된 채용 단계를 넘어선 유연한 프로세스 설계 (Custom Workflow).
* **Work Efficiency:** RAG AI 기술을 활용한 공고 작성 및 직무 기술서 자동화.
* **Hybrid Tech:** Spring Boot의 대용량 트래픽 처리 능력과 Flask의 유연한 AI 확장성을 결합.

---

## 🎥 프로젝트 시연 (Demo)

### [핵심 기능] AI 공고 자동 생성 및 원클릭 적용
> **아래 링크를 클릭하면 고화질 시연 영상을 확인할 수 있습니다.**

https://github.com/user-attachments/assets/67e3294b-aa00-4dab-badf-a5c9823524ba

---

## 🏗 시스템 아키텍처 (System Architecture)

**Spring Boot(Main Backend)**와 **Flask(AI Server)**를 분리하여 각 서버의 장점을 극대화한 **하이브리드 아키텍처**입니다.

```mermaid
graph LR
    User["User React Client"] -->|API Request| Spring["Spring Boot Server"]
    Spring -->|JPA and QueryDSL| DB[("Oracle DB")]
    Spring -->|REST API JSON| Flask["Flask AI Server"]
    Flask -->|Vector Search| Vector[("TF-IDF Vectorizer")]
    Flask -->|Prompt Injection| LLM["Ollama Gemma Model"]
    LLM -->|Generated Text| Flask
    Flask -->|Response| Spring
    Spring -->|Response| User
```

