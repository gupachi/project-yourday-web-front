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

      alert('댓글이 수정되었습니다.');
      setShowEditModal(false);
      setEditPassword('');
      setEditName('');
      setEditContent('');
      setEditCommentId(null);

      fetchComments();
    } catch (error) {
      console.log(id, editCommentId);
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
                onEdit={() => handleEditComment(msg.id, msg.name, msg.content)}
                onDelete={() => handleDeleteComment(msg.id)}
              />
            ))
          ) : (
            <div className="empty-message">
              아직 작성된 방명록이 없습니다.
            </div>
          )}
        </div>
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

export default Comments;
