import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WriteMessage.css';

function WriteMessage() {
    const navigate = useNavigate();
    const [author, setAuthor] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!author.trim() || !message.trim()) {
            alert('작성자와 메시지를 모두 입력해주세요.');
            return;
        }

        console.log({
            author,
            message
        });
        // TODO: API 호출

        // 성공 시 메인 페이지로 이동
        alert('메시지가 등록되었습니다!');
        navigate('/main');
    };

    return (
        <div className="write-message-container">
            <div className="write-message-content">
                <h1>방명록 작성</h1>

                {/* 작성자 */}
                <div className="form-group">
                    <label>작성자</label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="이름 또는 닉네임 입력"
                        className="input-field"
                    />
                </div>

                {/* 메시지 입력 */}
                <div className="form-group">
                    <label>메시지 입력</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="소중한 추억이나 축하의 말을 자유롭게 남겨주세요."
                        className="textarea-field"
                        rows="10"
                    />
                </div>

                {/* 등록하기 버튼 */}
                <button className="submit-button" onClick={handleSubmit}>
                    등록하기
                </button>
            </div>
        </div>
    );
}

export default WriteMessage;
