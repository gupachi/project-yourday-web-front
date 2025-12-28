import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './WriteMessage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function WriteMessage() {
    const navigate = useNavigate();
    const { id } = useParams(); // URL에서 celebration ID 가져오기
    const [author, setAuthor] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!author.trim() || !message.trim()) {
            alert('작성자와 메시지를 모두 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: author,
                    content: message,
                    password: "0000"
                })
            });

            if (!response.ok) {
                throw new Error(`등록 실패: ${response.status}`);
            }

            const data = await response.json();
            console.log('등록된 메시지:', data);

            // 성공 시 Main 페이지로 이동
            alert('메시지가 등록되었습니다!');
            navigate(`/main/${id}`);
        } catch (err) {
            console.error('Error:', err);
            alert('메시지 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
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
                        disabled={loading}
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
                        disabled={loading}
                    />
                </div>

                {/* 등록하기 버튼 */}
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? '등록 중...' : '등록하기'}
                </button>
            </div>
        </div>
    );
}

export default WriteMessage;
