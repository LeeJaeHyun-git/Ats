import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import {
    Robot, Person, Send, XCircleFill, ChatDotsFill,
    PencilSquare, CheckCircle
} from 'react-bootstrap-icons';
import { Spinner, Button } from 'react-bootstrap';

/**
 * AI 챗봇 컴포넌트
 * @param {Function} onApplyDraft - (선택) 챗봇 답변을 부모 컴포넌트(공고 폼)에 적용하는 콜백 함수
 */
const Chatbot = ({ onApplyDraft }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatLog, setChatLog] = useState([
        {
            text: "안녕하세요! 채용 공고 작성을 도와드리는 AI 비서입니다. \n'자바 백엔드 개발자 공고 써줘'라고 물어보세요!",
            role: 'bot'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // 자동 스크롤을 위한 Ref
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [chatLog, isOpen]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMsg = { text: message, role: 'user' };
        setChatLog(prev => [...prev, userMsg]);
        setMessage("");
        setIsLoading(true);

        try {
            // Flask AI 서버로 요청 (RAG + LLM)
            const response = await api.post('/api/chatbot/ask', { message: message });

            // 응답 텍스트
            const answer = response.data.answer || "죄송합니다. 답변을 생성하지 못했습니다.";

            // 구조화된 데이터(JSON)가 포함되어 있는지 확인하는 로직을 추가할 수 있음
            // 여기서는 단순 텍스트로 처리
            const botMsg = { text: answer, role: 'bot' };
            setChatLog(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            setChatLog(prev => [...prev, {
                text: "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
                role: 'bot'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 엔터키 처리
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // [본문에 적용하기] 버튼 핸들러
    const handleApply = (text) => {
        if (onApplyDraft) {
            // 간단한 전처리: 따옴표 제거나 불필요한 문구 제거 가능
            onApplyDraft(text);
            alert("공고 내용에 적용되었습니다! 내용을 확인하고 수정해주세요.");
        }
    };

    return (
        <>
            {/* 1. 플로팅 버튼 (닫혀있을 때) */}
            {!isOpen && (
                <div
                    className="chat-fab shadow-lg"
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        right: '30px',
                        bottom: '30px',
                        cursor: 'pointer',
                        zIndex: 1050,
                        backgroundColor: '#0d6efd',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <ChatDotsFill color="white" size={28} />
                </div>
            )}

            {/* 2. 채팅창 (열려있을 때) */}
            {isOpen && (
                <div
                    className="card shadow-lg border-0"
                    style={{
                        position: 'fixed',
                        right: '30px',
                        bottom: '30px',
                        width: '400px',
                        height: '600px',
                        zIndex: 1050,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '20px',
                        overflow: 'hidden'
                    }}
                >
                    {/* 헤더 */}
                    <div className="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center border-0">
                        <div className="d-flex align-items-center">
                            <Robot className="me-2" size={24} />
                            <span className="fw-bold">AI 채용 비서</span>
                        </div>
                        <XCircleFill
                            className="cursor-pointer opacity-75 hover-opacity-100"
                            size={24}
                            onClick={() => setIsOpen(false)}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    {/* 메시지 영역 */}
                    <div className="card-body bg-light overflow-auto p-3" style={{ flex: 1 }}>
                        {chatLog.map((msg, i) => (
                            <div key={i} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                {msg.role === 'bot' && (
                                    <div className="me-2 mt-1">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width:'32px', height:'32px'}}>
                                            <Robot color="white" size={18} />
                                        </div>
                                    </div>
                                )}

                                <div style={{ maxWidth: '80%' }}>
                                    <div
                                        className={`p-3 rounded-4 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                                        style={{
                                            borderTopLeftRadius: msg.role === 'bot' ? '4px' : '20px',
                                            borderTopRightRadius: msg.role === 'user' ? '4px' : '20px',
                                            whiteSpace: 'pre-wrap', // 줄바꿈 보존
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5'
                                        }}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* 봇 메시지이고, 적용 핸들러가 있을 경우 '적용하기' 버튼 표시 */}
                                    {msg.role === 'bot' && onApplyDraft && i > 0 && (
                                        <div className="mt-1">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="rounded-pill d-flex align-items-center py-1 px-3"
                                                style={{ fontSize: '0.8rem' }}
                                                onClick={() => handleApply(msg.text)}
                                            >
                                                <PencilSquare className="me-1" />
                                                본문에 적용하기
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 로딩 인디케이터 */}
                        {isLoading && (
                            <div className="d-flex mb-3 justify-content-start">
                                <div className="me-2 mt-1">
                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width:'32px', height:'32px'}}>
                                        <Robot color="white" size={18} />
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-4 shadow-sm" style={{ borderTopLeftRadius: '4px' }}>
                                    <Spinner animation="dots" variant="secondary" size="sm">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                    <span className="ms-2 text-muted small">답변을 생성하고 있습니다...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 */}
                    <div className="card-footer bg-white p-3 border-top">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control border-0 bg-light rounded-start-pill ps-4"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="무엇이든 물어보세요..."
                                style={{ height: '50px' }}
                                disabled={isLoading}
                            />
                            <button
                                className="btn btn-primary rounded-end-pill px-4"
                                onClick={sendMessage}
                                disabled={isLoading || !message.trim()}
                            >
                                {isLoading ? <Spinner size="sm" animation="border" /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;