import React, { useState, useEffect, useRef } from 'react';
// 페이지 이동(navigate) 관련 임포트 제거
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './TestRoom.css'; 

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export default function TestRoom() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'basic';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false); 
  const scrollRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = "http://localhost:8080";

  const interviewer = {
    name: type === 'job' ? '김 팀장' : '박 부장',
    img: type === 'job' ? '/img/woman.png' : '/img/man.png',
    title: type === 'job' ? '개발팀 팀장 17년차' : '부장 임원 23년차'
  };

  // 첫 질문 가져오기
  useEffect(() => {
    const fetchInitialQuestion = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/gemini/start?type=${type}`);
        setTimeout(() => {
          setMessages([{ role: 'ai', text: res.data.question }]);
        }, 600);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setMessages([{ role: 'ai', text: `${interviewer.name}님이 잠시 자리를 비우셨습니다.` }]);
      }
    };
    fetchInitialQuestion();
  }, [type]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 답변 전송 로직
  const handleSend = async () => {
    if (!input.trim() || isLoading || isFinished) return;

    const lastAiQuestion = messages[messages.length - 1].text;
    const userMsg = input;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/gemini/chat`, { 
        interviewId: 1,           
        message: userMsg,         
        lastQuestion: lastAiQuestion, 
        type: type                
      });

      const aiResponse = res.data.question;
      const isFinishedSignal = res.data.isFinished;

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

      // 백엔드에서 면접이 끝났다는 신호(true)가 오면
      if (isFinishedSignal) {
        setIsFinished(true);

        setTimeout(() => {
          alert("면접이 종료되었습니다.");
          // 피드백으로 이동하는 로직은 나중에 구현할 때 여기에 추가하면 댐
        }, 500);
      }

    } catch (err) {
      console.error("전송 오류:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "연결 오류가 발생했습니다. 다시 시도해 주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="test-room-wrapper">
      <header className="test-room-header">
        <h2>{interviewer.title}</h2>
      </header>

      <div className="test-room-chatWindow">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'ai' ? "test-room-aiRow" : "test-room-userRow"}>
            {msg.role === 'ai' && (
              <div className="test-room-interviewer-info">
                <div className="test-room-interviewer-name">{interviewer.name}</div>
                <img src={interviewer.img} className="test-room-avatar" alt="면접관" />
              </div>
            )}
            <div className="test-room-bubble">{msg.text}</div>
          </div>
        ))}
        {isLoading && <div className="test-room-loading">{interviewer.name}님이 답변을 생각 중입니다...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="test-room-inputArea">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isFinished ? "면접이 종료되었습니다." : "답변을 입력하세요..."}
          disabled={isLoading || isFinished} 
        />
        <button onClick={handleSend} disabled={isLoading || isFinished}>전송</button>
      </div>
    </div>
  );
}