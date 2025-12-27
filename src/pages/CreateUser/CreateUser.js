import React, { useState } from 'react';
import './CreateUser.css';

function CreateUser() {
  const [pageTitle, setPageTitle] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [eventDate, setEventDate] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTargetPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    console.log({
      pageTitle,
      targetName,
      targetPhoto,
      eventDate
    });
    // TODO: API 호출
  };

  return (
    <div className="create-user-container">
      <div className="create-user-content">
        <div className="page-header">
          <h2 className="header-question">
            누구를 위한 <span className="highlight">특별한 페이지</span>인가요?
          </h2>
          <p className="header-description">
            기본 정보를 입력하면 맞춤형 템플릿을 추천해드려요
          </p>
        </div>

        {/* 페이지 제목 */}
        <div className="form-group">
          <label>페이지 제목</label>
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder="ex. 지수야 생일 축하해"
            className="input-field"
          />
        </div>

        {/* 축하 대상 */}
        <div className="form-group">
          <label>축하 대상</label>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="ex. 김지수"
            className="input-field"
          />
        </div>

        {/* 축하대상 사진 */}
        <div className="form-group">
          <label>축하대상 사진</label>
          <div className="photo-upload-area">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="photo-upload" className="photo-upload-button">
              {targetPhoto ? (
                <img src={targetPhoto} alt="업로드된 사진" className="uploaded-photo" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">사진 업로드</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 이벤트 날짜 */}
        <div className="form-group">
          <label>이벤트 날짜</label>
          <div className="date-input-wrapper">
            <span className="calendar-icon">📅</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>

        {/* 완성 버튼 */}
        <button className="submit-button" onClick={handleSubmit}>
          완성
        </button>
      </div>
    </div>
  );
}

export default CreateUser;
