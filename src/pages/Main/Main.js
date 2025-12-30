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

    setDeleteLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}/comments/${deleteCommentId}`, {
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

      // 삭제 성공
      alert('댓글이 삭제되었습니다.');
      setShowDeleteModal(false);
      setDeletePassword('');
      setDeleteCommentId(null);

      // 댓글 목록 새로고침
      fetchComments();
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

    setEditLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/celebrations/${id}/comments/${editCommentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          content: editContent,
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

      // 수정 성공
      alert('댓글이 수정되었습니다.');
      setShowEditModal(false);
      setEditPassword('');
      setEditName('');
      setEditContent('');
      setEditCommentId(null);

      // 댓글 목록 새로고침
      fetchComments();
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
    </div>
  );
}

export default Main;
