import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './Main.css';
import GreyCard from './components/GreyCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function Main() {
  const navigate = useNavigate();
  const { link } = useParams();
  const [searchParams] = useSearchParams();

  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [celebrationData, setCelebrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 방명록 데이터
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // 삭제 모달 관련
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 수정 모달 관련
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // 페이지 삭제 관련
  const [showPageDeleteModal, setShowPageDeleteModal] = useState(false);
  const [pageDeletePassword, setPageDeletePassword] = useState('');
  const [pageDeleteLoading, setPageDeleteLoading] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteResultModal, setShowDeleteResultModal] = useState(false);
  const [deleteResultMessage, setDeleteResultMessage] = useState('');

  // 페이지 수정 관련
  const [showPageEditModal, setShowPageEditModal] = useState(false);
  const [pageEditPassword, setPageEditPassword] = useState('');
  const [pageEditLoading, setPageEditLoading] = useState(false);
  const [pageEditTitle, setPageEditTitle] = useState('');
  const [pageEditRecipientName, setPageEditRecipientName] = useState('');
  const [pageEditEventDate, setPageEditEventDate] = useState('');

  useEffect(() => {
    if (link) {
      fetchCelebrationByLink(link);
    }
  }, [link]);

  const fetchCelebrationByLink = async (linkId) => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = `${API_BASE_URL}/api/celebrations?link=${linkId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`조회 실패: ${response.status}`);
      }

      const data = await response.json();
      setCelebrationData(data);

      if (data.pageContent && data.pageContent.recipientName) {
        document.title = `${data.pageContent.recipientName}님의 페이지`;
      }

      if (data.pageContent && data.pageContent.recipientPhoto) {
        setImages([data.pageContent.recipientPhoto]);
        setCurrentIndex(0);
      }

      // 방명록 조회
      if (data.id) {
        fetchComments(data.id);
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (celebrationId) => {
    setCommentsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${celebrationId}/comments?page=0&size=3&sort=createdAt,desc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`방명록 조회 실패: ${response.status}`);
      }

      const data = await response.json();

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
    const celebrationId = celebrationData?.id;
    navigate(`/comments/${link}?celebrationId=${celebrationId}&link=${link}`);
  };

  const goToWriteMessage = () => {
    const celebrationId = celebrationData?.id;
    const recipientName = celebrationData?.pageContent?.recipientName || '';
    const recipientPhoto = celebrationData?.pageContent?.recipientPhoto || '';
    navigate(`/write/?celebrationId=${celebrationId}&link=${link}&recipientName=${encodeURIComponent(recipientName)}&recipientPhoto=${encodeURIComponent(recipientPhoto)}`);
  };

  const handleEditComment = (commentId, currentName, currentContent) => {
    setEditCommentId(commentId);
    setEditPassword('');
    setEditName(currentName);
    setEditContent(currentContent);
    setShowEditModal(true);
  };

  const handleDeleteComment = (commentId) => {
    setDeleteCommentId(commentId);
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!deletePassword.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const celebrationId = celebrationData?.id;
    if (!celebrationId) {
      alert('페이지 정보를 찾을 수 없습니다.');
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${celebrationId}/comments/${deleteCommentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('비밀번호가 일치하지 않습니다.');
        } else if (response.status === 404) {
          alert('해당 댓글을 찾을 수 없습니다.');
        } else {
          alert('댓글 삭제 중 오류가 발생했습니다.');
        }
        return;
      }

      alert('댓글이 삭제되었습니다.');
      setShowDeleteModal(false);
      setDeletePassword('');
      setDeleteCommentId(null);

      fetchComments(celebrationId);
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteCommentId(null);
  };

  const confirmEditComment = async () => {
    if (!editPassword.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (!editName.trim()) {
      alert('작성자를 입력해주세요.');
      return;
    }

    if (!editContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const celebrationId = celebrationData?.id;
    if (!celebrationId) {
      alert('페이지 정보를 찾을 수 없습니다.');
      return;
    }

    setEditLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${celebrationId}/comments/${editCommentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          content: editContent,
          password: editPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('비밀번호가 일치하지 않습니다.');
        } else if (response.status === 404) {
          alert('해당 댓글을 찾을 수 없습니다.');
        } else {
          alert('댓글 수정 중 오류가 발생했습니다.');
        }
        return;
      }

      alert('댓글이 수정되었습니다.');
      setShowEditModal(false);
      setEditPassword('');
      setEditName('');
      setEditContent('');
      setEditCommentId(null);

      fetchComments(celebrationId);
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditPassword('');
    setEditName('');
    setEditContent('');
    setEditCommentId(null);
  };

  // 페이지 삭제 핸들러
  const handlePageDelete = () => {
    setShowPageDeleteModal(true);
    setPageDeletePassword('');
  };

  const handlePageDeleteSubmit = () => {
    if (!pageDeletePassword.trim()) {
      setDeleteResultMessage('비밀번호를 입력해주세요.');
      setShowPageDeleteModal(false);
      setShowDeleteResultModal(true);
      return;
    }

    setShowPageDeleteModal(false);
    setShowDeleteConfirmModal(true);
  };

  const confirmPageDelete = async () => {
    const celebrationId = celebrationData?.id;
    if (!celebrationId) {
      alert('페이지 정보를 찾을 수 없습니다.');
      return;
    }

    setPageDeleteLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${celebrationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: pageDeletePassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setDeleteResultMessage('비밀번호가 일치하지 않습니다.');
        } else if (response.status === 404) {
          setDeleteResultMessage('해당 페이지를 찾을 수 없습니다.');
        } else {
          setDeleteResultMessage('페이지 삭제 중 오류가 발생했습니다.');
        }
        setShowDeleteConfirmModal(false);
        setShowDeleteResultModal(true);
        return;
      }

      setShowDeleteConfirmModal(false);
      setDeleteResultMessage('페이지가 성공적으로 삭제되었습니다.');
      setShowDeleteResultModal(true);
      setPageDeletePassword('');

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('페이지 삭제 오류:', error);
      setDeleteResultMessage('네트워크 오류가 발생했습니다.');
      setShowDeleteConfirmModal(false);
      setShowDeleteResultModal(true);
    } finally {
      setPageDeleteLoading(false);
    }
  };

  const closePageDeleteModal = () => {
    setShowPageDeleteModal(false);
    setPageDeletePassword('');
  };

  const closeAllDeleteModals = () => {
    setShowPageDeleteModal(false);
    setShowDeleteConfirmModal(false);
    setShowDeleteResultModal(false);
    setPageDeletePassword('');
  };

  // 페이지 수정 핸들러
  const handlePageEdit = () => {
    if (celebrationData && celebrationData.pageContent) {
      setPageEditTitle(celebrationData.pageContent.title || '');
      setPageEditRecipientName(celebrationData.pageContent.recipientName || '');
      setPageEditEventDate(celebrationData.pageContent.eventDate || '');
    }
    setShowPageEditModal(true);
    setPageEditPassword('');
  };

  const confirmPageEdit = async () => {
    if (!pageEditPassword.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (!pageEditTitle.trim()) {
      alert('페이지 제목을 입력해주세요.');
      return;
    }

    if (!pageEditRecipientName.trim()) {
      alert('축하 대상을 입력해주세요.');
      return;
    }

    if (!pageEditEventDate.trim()) {
      alert('이벤트 날짜를 입력해주세요.');
      return;
    }

    const celebrationId = celebrationData?.id;
    if (!celebrationId) {
      alert('페이지 정보를 찾을 수 없습니다.');
      return;
    }

    setPageEditLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${celebrationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: pageEditPassword,
          title: pageEditTitle,
          recipientName: pageEditRecipientName,
          eventDate: pageEditEventDate,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('비밀번호가 일치하지 않습니다.');
        } else if (response.status === 404) {
          alert('해당 페이지를 찾을 수 없습니다.');
        } else {
          alert('페이지 수정 중 오류가 발생했습니다.');
        }
        return;
      }

      alert('페이지가 수정되었습니다.');
      setShowPageEditModal(false);
      setPageEditPassword('');

      // 페이지 정보 새로고침
      if (link) {
        fetchCelebrationByLink(link);
      }
    } catch (error) {
      console.error('페이지 수정 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setPageEditLoading(false);
    }
  };

  const closePageEditModal = () => {
    setShowPageEditModal(false);
    setPageEditPassword('');
    setPageEditTitle('');
    setPageEditRecipientName('');
    setPageEditEventDate('');
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

        {/* 페이지 관리 링크 */}
        <div className="page-management-links">
          <button className="page-link" onClick={handlePageEdit}>
            페이지 수정
          </button>
          <button className="page-link" onClick={handlePageDelete}>
            페이지 삭제
          </button>
        </div>

        {celebrationData && celebrationData.pageContent && (
          <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
            <h2>{celebrationData.pageContent.title}</h2>
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

        {/* 방명록 리스트 */}
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
              onEdit={() => handleEditComment(comment.id, comment.name, comment.content)}
              onDelete={() => handleDeleteComment(comment.id)}
            />
          ))
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
            아직 작성된 방명록이 없습니다.
          </div>
        )}

      </div>

      {/* 댓글 수정 모달 */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>댓글 수정</h2>
            <div className="edit-form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="edit-input"
                disabled={editLoading}
              />
            </div>
            <div className="edit-form-group">
              <label>작성자</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="작성자 입력"
                className="edit-input"
                disabled={editLoading}
              />
            </div>
            <div className="edit-form-group">
              <label>내용</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="내용 입력"
                className="edit-textarea"
                rows="6"
                disabled={editLoading}
              />
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={closeEditModal}
                disabled={editLoading}
              >
                취소
              </button>
              <button
                className="modal-button confirm"
                onClick={confirmEditComment}
                disabled={editLoading}
              >
                {editLoading ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>댓글 삭제</h2>
            <p>댓글을 삭제하려면 비밀번호를 입력해주세요.</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="password-input"
              disabled={deleteLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !deleteLoading) {
                  confirmDeleteComment();
                }
              }}
            />
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                취소
              </button>
              <button
                className="modal-button confirm danger"
                onClick={confirmDeleteComment}
                disabled={deleteLoading}
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 페이지 삭제 모달 */}
      {showPageDeleteModal && (
        <div className="modal-overlay" onClick={closeAllDeleteModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>페이지 삭제</h2>
            <p>삭제할 페이지의 비밀번호를 입력해주세요</p>
            <input
              type="password"
              value={pageDeletePassword}
              onChange={(e) => setPageDeletePassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="password-input"
              disabled={pageDeleteLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !pageDeleteLoading) {
                  handlePageDeleteSubmit();
                }
              }}
            />
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={closeAllDeleteModals}
                disabled={pageDeleteLoading}
              >
                취소
              </button>
              <button
                className="modal-button confirm"
                onClick={handlePageDeleteSubmit}
                disabled={pageDeleteLoading}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirmModal && (
        <div className="modal-overlay" onClick={closeAllDeleteModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>삭제 확인</h2>
            <p>정말 이 페이지를 삭제하시겠습니까?</p>
            <p className="warning-text" style={{ color: '#f44336', fontWeight: 'bold' }}>이 작업은 되돌릴 수 없습니다.</p>
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={closeAllDeleteModals}
                disabled={pageDeleteLoading}
              >
                아니오
              </button>
              <button
                className="modal-button confirm danger"
                onClick={confirmPageDelete}
                disabled={pageDeleteLoading}
              >
                {pageDeleteLoading ? '삭제 중...' : '예, 삭제합니다'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오류/성공 메시지 모달 */}
      {showDeleteResultModal && (
        <div className="modal-overlay" onClick={closeAllDeleteModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{deleteResultMessage.includes('성공') ? '성공' : '알림'}</h2>
            <p>{deleteResultMessage}</p>
            <div className="modal-buttons">
              <button
                className="modal-button confirm"
                onClick={closeAllDeleteModals}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 페이지 수정 모달 */}
      {showPageEditModal && (
        <div className="modal-overlay" onClick={closePageEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>페이지 수정</h2>
            <div className="edit-form-group">
              <label>관리자 비밀번호</label>
              <input
                type="password"
                value={pageEditPassword}
                onChange={(e) => setPageEditPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="edit-input"
                disabled={pageEditLoading}
              />
            </div>
            <div className="edit-form-group">
              <label>페이지 제목</label>
              <input
                type="text"
                value={pageEditTitle}
                onChange={(e) => setPageEditTitle(e.target.value)}
                placeholder="페이지 제목 입력"
                className="edit-input"
                disabled={pageEditLoading}
              />
            </div>
            <div className="edit-form-group">
              <label>축하 대상</label>
              <input
                type="text"
                value={pageEditRecipientName}
                onChange={(e) => setPageEditRecipientName(e.target.value)}
                placeholder="축하 대상 입력"
                className="edit-input"
                disabled={pageEditLoading}
              />
            </div>
            <div className="edit-form-group">
              <label>이벤트 날짜</label>
              <input
                type="date"
                value={pageEditEventDate}
                onChange={(e) => setPageEditEventDate(e.target.value)}
                className="edit-input"
                disabled={pageEditLoading}
              />
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={closePageEditModal}
                disabled={pageEditLoading}
              >
                취소
              </button>
              <button
                className="modal-button confirm"
                onClick={confirmPageEdit}
                disabled={pageEditLoading}
              >
                {pageEditLoading ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;