import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Comments.css';
import GreyCard from '../Main/components/GreyCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function Comments() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}/comments?page=0&size=10&sort=createdAt,desc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`방명록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('받은 전체 방명록 데이터:', data);

      // 페이지네이션 응답인 경우 content 필드에서 가져오기
      if (data.content) {
        setComments(data.content);
      } else if (Array.isArray(data)) {
        setComments(data);
      }

    } catch (err) {
      console.error('Comments Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(`/main/${id}`);
  };

  if (loading) {
    return (
      <div className="comments-container">
        <div className="loading">방명록 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comments-container">
        <div className="error" style={{ color: 'red', padding: '20px' }}>
          에러: {error}
        </div>
        <button onClick={goBack} className="back-button">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="comments-container">
      <div className="comments-content">
        <div className="comments-header">
          <button onClick={goBack} className="back-button">
            ← 돌아가기
          </button>
          <h1>방명록 전체보기</h1>
          <div className="comments-count">
            총 {comments.length}개의 메시지
          </div>
        </div>

        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((msg, index) => (
              <GreyCard
                key={msg.id || index}
                name={msg.name}
                contents={msg.content}
              />
            ))
          ) : (
            <div className="empty-message">
              아직 작성된 방명록이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comments;
