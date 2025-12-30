import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './WriteMessage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function WriteMessage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const celebrationId = searchParams.get('celebrationId');
    const link = searchParams.get('link');
    const recipientName = searchParams.get('recipientName') || '';
    const recipientPhoto = searchParams.get('recipientPhoto') || '';
    const [author, setAuthor] = useState('');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async () => {
        if (!author.trim() || !message.trim()) {
            alert('작성자와 메시지를 모두 입력해주세요.');
            return;
        }

        if (!password.trim()) {
            alert('비밀번호를 입력해주세요.');
            return;
        }

        if (password.length < 4) {
            alert('비밀번호는 최소 4자리 이상 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/celebrations/${celebrationId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: author,
                    content: message,
                    password: password
                })
            });

            if (!response.ok) {
                throw new Error(`등록 실패: ${response.status}`);
            }

            const data = await response.json();
            console.log('등록된 메시지:', data);

            // 성공 시 Main 페이지로 이동
            alert('메시지가 등록되었습니다!');
            navigate(`/main/${link}?id=${celebrationId}`);
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
                {/* 상단 프로필 섹션 */}
                <div className="recipient-profile-section">
                    {recipientPhoto && (
                        <div className="recipient-photo-wrapper">
                            {recipientPhoto ? (
                                <img
                                    src={recipientPhoto}
                                    alt={recipientName}
                                    className="recipient-photo"
                                    onError={(e) => {
                                        console.error('❌ 이미지 로드 실패:', recipientPhoto);
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={() => console.log('✅ 이미지 로드 성공:', recipientPhoto)}
                                />
                            ) : (
                                <div className="recipient-photo placeholder" />
                            )}
                        </div>

                    )}
                    <h1 className="recipient-title">
                        {recipientName ? `${recipientName}님에게` : '방명록 작성'}
                    </h1>
                    <p className="recipient-subtitle">
                        {recipientName ? '축하 메시지를 남겨주세요' : '소중한 추억을 남겨주세요'}
                    </p>
                </div>

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

                {/* 비밀번호 */}
                <div className="form-group">
                    <label>비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호 입력 (4자리 이상)"
                        className="input-field"
                        disabled={loading}
                        maxLength="20"
                    />
                    <p className="helper-text">댓글 수정/삭제 시 필요합니다.</p>
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
