import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Main.css';
import GreyCard from './components/GreyCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function Main() {
  const navigate = useNavigate();
  const { id } = useParams(); // URL에서 celebration ID 가져오기

  const [images, setImages] = useState([]); // 빈 배열로 시작
  const [currentIndex, setCurrentIndex] = useState(0);

  // GET 요청으로 받을 데이터
  const [celebrationData, setCelebrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 페이지 로드 시 celebration 데이터 가져오기
  useEffect(() => {
    if (id) {
      fetchCelebration();
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

      // 페이지 제목 변경
      if (data.pageContent && data.pageContent.title) {
        document.title = `${data.pageContent.title}의 페이지`;
      }

      // 받은 데이터에 사진이 있으면 이미지 배열에 추가
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

  // 이미지 추가
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImages((prevImages) => [...prevImages, imageUrl]);
      // 첫 이미지 추가 시 currentIndex를 0으로 설정
      if (images.length === 0) {
        setCurrentIndex(0);
      }
    }
  };

  // 이전 이미지
  const handlePrevious = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // 다음 이미지
  const handleNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 인디케이터 클릭
  const onClickIndicator = (idx) => {
    setCurrentIndex(idx);
  };

  // 방명록 작성 페이지로 이동
  const goToWriteMessage = () => {
    navigate('/write');
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="main-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  // 에러 발생 시
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

        {/* 받은 데이터 표시 (테스트용 - 나중에 삭제 가능) */}
        {celebrationData && celebrationData.pageContent && (
          <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
            <h2>{celebrationData.pageContent.title}</h2>
            <p>대상: {celebrationData.pageContent.recipientName}</p>
            <p>날짜: {celebrationData.pageContent.eventDate}</p>
            <p>만료일: {celebrationData.expiredAt}</p>
          </div>
        )}

        {/* 이미지 슬라이더 */}
        <div className="image-slider-section">
          <div className="slider-container">
            {/* 이미지가 있을 때만 버튼 표시 */}
            {images.length > 0 ? (
              <>
                <button
                  className="slider-button prev"
                  onClick={handlePrevious}
                >
                  ‹
                </button>

                <div className="slider-img-container">
                  <img
                    src={images[currentIndex]}
                    alt={`슬라이드 ${currentIndex + 1}`}
                    className="slider-image"
                  />
                  {/* <div className="slider-indicator">
                    {currentIndex + 1} / {images.length}
                  </div> */}
                </div>

                <button
                  className="slider-button next"
                  onClick={handleNext}
                >
                  ›
                </button>
              </>
            ) : (
              /* 이미지가 없을 때 빈 상태 표시 */
              <div className="empty-slider">
                <div className="empty-message">
                  <span className="empty-icon">🖼️</span>
                  <p>이미지를 추가해주세요</p>
                </div>
              </div>
            )}
          </div>

          {/* 인디케이터 (이미지가 2개 이상일 때만 표시) */}
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

          {/* 이미지 등록 버튼 */}
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

        {/* 방명록 작성하기 버튼 */}
        <button className="write-message-button" onClick={goToWriteMessage}>
          방명록 작성하기
        </button>

        {/* GreyCard 예시 */}
        <GreyCard
          name="테스트 카드"
          contents="이것은 회색 카드의 내용입니다."
        />
        <GreyCard
          name="테스트 카드"
          contents="이것은 회색 카드의 내용입니다."
        />
        <GreyCard
          name="두 번째 카드"
          contents="여러 개의 카드를 추가할 수 있습니다."
        />

      </div>
    </div>
  );
}

export default Main;
