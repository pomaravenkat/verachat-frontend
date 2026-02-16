import { useState, useEffect } from 'react';
import { fetchComments, addComment, deleteComment } from '../api';

export default function CommentSection({ postId, currentUserId, isPostOwner }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // comment ID
    const [replyContent, setReplyContent] = useState('');
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

    async function handleSubmit(e, parentId = null) {
        e.preventDefault();
        const content = parentId ? replyContent : newComment;
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const comment = await addComment(postId, content, parentId);
            setComments((prev) => [...prev, comment]);
            if (parentId) {
                setReplyContent('');
                setReplyingTo(null);
            } else {
                setNewComment('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(commentId) {
        if (!confirm('Delete this comment?')) return;
        try {
            await deleteComment(commentId);
            // Remove comment and its children (if we had a tree structure in state, but flat list works if we filter)
            // Ideally we should reload or filter recursively, but filtering by ID works for the deleted item.
            // If DB cascades, children are gone there. Frontend state:
            setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
            // Note: This only removes direct children in frontend state. Deeply nested might remain until refresh if we don't traverse. 
            // For simple depth, this is okay or we can just reloadComments().
            loadComments();
        } catch (err) {
            console.error(err);
            alert('Failed to delete comment');
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

    // Organize comments into a tree or just render root comments and filter children
    const rootComments = comments.filter((c) => !c.parent_id);

    const CommentItem = ({ comment, depth = 0 }) => {
        const isAuthor = comment.user_id === currentUserId;
        const canDelete = isAuthor || isPostOwner;
        const replies = comments.filter((c) => c.parent_id === comment.id);

        return (
            <div className={`comment-container depth-${depth}`}>
                <div className="comment-item">
                    <div className="comment-avatar">
                        {comment.author?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="comment-body-wrapper">
                        <div className="comment-body">
                            <div className="comment-meta">
                                <span className="comment-author">{comment.author}</span>
                                <span className="comment-time">{timeAgo(comment.created_at)}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                        </div>
                        <div className="comment-actions">
                            <button
                                className="btn-reply"
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            >
                                Reply
                            </button>
                            {canDelete && (
                                <button
                                    className="btn-delete-comment-text"
                                    onClick={() => handleDelete(comment.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleSubmit(e, comment.id)} className="reply-form">
                        <input
                            type="text"
                            className="reply-input"
                            placeholder={`Reply to ${comment.author}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="btn-send-reply"
                            disabled={submitting || !replyContent.trim()}
                        >
                            ➤
                        </button>
                    </form>
                )}

                {replies.length > 0 && (
                    <div className="replies-list">
                        {replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="comment-section">
            {loading ? (
                <div className="comments-loading">Loading comments...</div>
            ) : (
                <div className="comments-list">
                    {rootComments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}

            <form onSubmit={(e) => handleSubmit(e)} className="comment-form">
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
