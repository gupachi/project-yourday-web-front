import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateUser.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function CreateUser() {
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState('');
  const [targetName, setTargetName] = useState('');
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [targetPhotoFile, setTargetPhotoFile] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTargetPhoto(URL.createObjectURL(file));
      setTargetPhotoFile(file);
    }
  };

  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/celebrations/profile`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const photoUrl = await res.text();
    return photoUrl;
  };

  const handleSubmit = async () => {
    if (!pageTitle || !targetName || !eventDate || !adminPassword) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let photoUrl = null;

      // 1. 이미지 업로드
      if (targetPhotoFile) {
        photoUrl = await uploadProfileImage(targetPhotoFile);
      }

      // 2. 축하 페이지 생성
      const requestBody = {
        title: pageTitle,
        recipientName: targetName,
        recipientPhoto: photoUrl || "",
        eventDate,
        adminPassword,
      };

      const apiResponse = await fetch(`${API_BASE_URL}/api/celebrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!apiResponse.ok) {
        throw new Error(await apiResponse.text());
      }

      const data = await apiResponse.json();

      alert('축하 페이지가 생성되었습니다!');

      // 3. 생성된 페이지로 이동 (link 값만 사용)
      // 예: data.link = "b4e8f833-43e8-4ccb-b259-f106c9efd4b4"
      navigate(`/${data.link}`);

    } catch (err) {
      setError(err.message || '페이지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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
          <label>축하대상 사진 (선택)</label>
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

        {/* 관리자 비밀번호 */}
        <div className="form-group">
          <label>관리자 비밀번호</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="페이지 관리를 위한 비밀번호"
            className="input-field"
          />
          <p className="field-description">
            이 비밀번호로 나중에 페이지를 수정하거나 삭제할 수 있습니다.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && <div className="error-message">{error}</div>}

        {/* 완성 버튼 */}
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? '생성 중...' : '완성'}
        </button>
      </div>
    </div>
  );
}

export default CreateUser;