import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Main.css';
import GreyCard from './components/GreyCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function Main() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [celebrationData, setCelebrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 방명록 데이터
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCelebration();
      fetchComments();
    }
  }, [id]);

  const fetchCelebration = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('받은 celebration 데이터:', data);
      setCelebrationData(data);

      if (data.pageContent && data.pageContent.title) {
        document.title = `${data.pageContent.title}의 페이지`;
      }

      if (data.pageContent && data.pageContent.recipientPhoto) {
        setImages([data.pageContent.recipientPhoto]);
        setCurrentIndex(0);
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}/comments?page=0&size=5&sort=createdAt,desc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`방명록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('받은 방명록 데이터:', data);

      // 페이지네이션 응답인 경우 content 필드에서 가져오기
      if (data.content) {
        setComments(data.content);
      } else if (Array.isArray(data)) {
        setComments(data);
      }

    } catch (err) {
      console.error('Comments Error:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImages((prevImages) => [...prevImages, imageUrl]);
      if (images.length === 0) {
        setCurrentIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onClickIndicator = (idx) => {
    setCurrentIndex(idx);
  };

  const goToComments = () => {
    navigate(`/comments/${id}`);
  };

  const goToWriteMessage = () => {
    navigate(`/write/${id}`);
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="error" style={{ color: 'red', padding: '20px' }}>
          에러: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="main-content">

        {celebrationData && celebrationData.pageContent && (
          <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
            <h2>{celebrationData.pageContent.title}</h2>
            <p>대상: {celebrationData.pageContent.recipientName}</p>
            <p>날짜: {celebrationData.pageContent.eventDate}</p>
            <p>만료일: {celebrationData.expiredAt}</p>
          </div>
        )}

        <div className="image-slider-section">
          <div className="slider-container">
            {images.length > 0 ? (
              <>
                <button className="slider-button prev" onClick={handlePrevious}>
                  ‹
                </button>

                <div className="slider-img-container">
                  <img
                    src={images[currentIndex]}
                    alt={`슬라이드 ${currentIndex + 1}`}
                    className="slider-image"
                  />
                </div>

                <button className="slider-button next" onClick={handleNext}>
                  ›
                </button>
              </>
            ) : (
              <div className="empty-slider">
                <div className="empty-message">
                  <span className="empty-icon">🖼️</span>
                  <p>이미지를 추가해주세요</p>
                </div>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="indicator-container">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => onClickIndicator(idx)}
                />
              ))}
            </div>
          )}

          <div className="upload-button-container">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload" className="upload-button">
              <span className="camera-icon">📷</span>
            </label>
          </div>
        </div>

        <button className="write-message-button" onClick={goToWriteMessage}>
          방명록 작성하기
        </button>

        <div className="comments-section-header">
          <div className="section-title">
            <span className="icon">🎉</span>
            최신 축하 메시지
          </div>
          <div className="view-all-link" onClick={goToComments}>
            방명록 전체보기 →
          </div>
        </div>
        <div className="section-divider"></div>

        {/* 방명록 리스트 (최신 5개) */}
        {commentsLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            방명록 로딩 중...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <GreyCard
              key={comment.id}
              name={comment.name}
              contents={comment.content}
            />
          ))
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
            아직 작성된 방명록이 없습니다.
          </div>
        )}

      </div>
    </div>
  );
}

export default Main;
