import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pageId, setPageId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleCreatePage = () => {
    navigate('/create-user');
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setPageId('');
    setPassword('');
  };

  const handlePasswordSubmit = () => {
    if (!pageId.trim()) {
      setErrorMessage('페이지 ID를 입력해주세요.');
      setShowErrorModal(true);
      return;
    }

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.');
      setShowErrorModal(true);
      return;
    }

    // 비밀번호 입력 완료하면 확인 팝업 표시
    setShowDeleteModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);

    try {
      // DELETE 요청으로 페이지 삭제 (password 포함)
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setErrorMessage('비밀번호가 일치하지 않습니다.');
        } else if (response.status === 404) {
          setErrorMessage('해당 페이지를 찾을 수 없습니다.');
        } else {
          setErrorMessage('페이지 삭제 중 오류가 발생했습니다.');
        }
        setShowConfirmModal(false);
        setShowErrorModal(true);
        return;
      }

      // 삭제 성공
      setShowConfirmModal(false);
      setErrorMessage('페이지가 성공적으로 삭제되었습니다.');
      setShowErrorModal(true);
      setPageId('');
      setPassword('');
    } catch (error) {
      console.error('페이지 삭제 오류:', error);
      setErrorMessage('네트워크 오류가 발생했습니다.');
      setShowConfirmModal(false);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAllModals = () => {
    setShowDeleteModal(false);
    setShowConfirmModal(false);
    setShowErrorModal(false);
    setPageId('');
    setPassword('');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>특별한 날을 더 특별하게</h1>

        <div className="button-group">
          <button className="create-button" onClick={handleCreatePage}>
            페이지 만들기 →
          </button>
          <button className="delete-link" onClick={handleDeleteClick}>
            페이지 삭제
          </button>
        </div>
      </div>

      {/* Page ID와 비밀번호 입력 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>페이지 삭제</h2>
            <p>삭제할 페이지의 정보를 입력해주세요</p>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="페이지 ID 입력"
              className="page-id-input"
              disabled={isLoading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="page-id-input"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handlePasswordSubmit();
                }
              }}
            />
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={closeAllModals}
                disabled={isLoading}
              >
                취소
              </button>
              <button
                className="modal-button confirm"
                onClick={handlePasswordSubmit}
                disabled={isLoading}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>삭제 확인</h2>
            <p>정말 이 페이지를 삭제하시겠습니까?</p>
            <p className="warning-text">이 작업은 되돌릴 수 없습니다.</p>
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={closeAllModals}
                disabled={isLoading}
              >
                아니오
              </button>
              <button
                className="modal-button confirm danger"
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? '삭제 중...' : '예, 삭제합니다'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오류/성공 메시지 모달 */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{errorMessage.includes('성공') ? '성공' : '알림'}</h2>
            <p>{errorMessage}</p>
            <div className="modal-buttons">
              <button
                className="modal-button confirm"
                onClick={closeAllModals}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;
