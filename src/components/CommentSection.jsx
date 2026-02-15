import { useState, useEffect } from 'react';
import { fetchComments, addComment } from '../api';

export default function CommentSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [postId]);

    async function loadComments() {
        try {
            const data = await fetchComments(postId);
            setComments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const comment = await addComment(postId, newComment);
            setComments((prev) => [...prev, comment]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    function timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    return (
        <div className="comment-section">
            {loading ? (
                <div className="comments-loading">Loading comments...</div>
            ) : (
                <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                {comment.author?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="comment-body">
                                <div className="comment-meta">
                                    <span className="comment-author">{comment.author}</span>
                                    <span className="comment-time">{timeAgo(comment.created_at)}</span>
                                </div>
                                <p className="comment-text">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="comment-form">
                <input
                    type="text"
                    className="comment-input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                    type="submit"
                    className="btn btn-send"
                    disabled={submitting || !newComment.trim()}
                >
                    {submitting ? '...' : '➤'}
                </button>
            </form>
        </div>
    );
}
