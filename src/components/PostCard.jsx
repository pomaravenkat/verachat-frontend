import { useState } from 'react';
import { toggleLike, deletePost } from '../api';
import CommentSection from './CommentSection';

export default function PostCard({ post, currentUserId, onDelete, onLikeToggle }) {
    const [showComments, setShowComments] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [liking, setLiking] = useState(false);

    const isOwner = post.user_id === currentUserId;

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
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        return `${months}mo ago`;
    }

    async function handleLike() {
        if (liking) return;
        setLiking(true);
        try {
            const { liked } = await toggleLike(post.id);
            onLikeToggle(post.id, liked);
        } catch (err) {
            console.error(err);
        } finally {
            setLiking(false);
        }
    }

    async function handleDelete() {
        if (!confirm('Delete this post?')) return;
        setDeleting(true);
        try {
            await deletePost(post.id);
            onDelete(post.id);
        } catch (err) {
            console.error(err);
            setDeleting(false);
        }
    }

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author">
                    <div className="author-avatar">
                        {post.author?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <span className="author-name">{post.author}</span>
                        <span className="post-time">{timeAgo(post.created_at)}</span>
                    </div>
                </div>
                {isOwner && (
                    <button
                        className="btn-icon btn-delete-post"
                        onClick={handleDelete}
                        disabled={deleting}
                        title="Delete post"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                )}
            </div>

            {post.content && <p className="post-content">{post.content}</p>}

            {post.image_url && (
                <div className="post-image">
                    <img src={post.image_url} alt="Post" loading="lazy" />
                </div>
            )}

            <div className="post-stats">
                {post.like_count > 0 && (
                    <span className="stat-likes">
                        ❤️ {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                    </span>
                )}
                {post.comment_count > 0 && (
                    <span
                        className="stat-comments"
                        onClick={() => setShowComments(!showComments)}
                    >
                        {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                    </span>
                )}
            </div>

            <div className="post-actions">
                <button
                    className={`btn-action btn-like ${post.liked_by_me ? 'liked' : ''}`}
                    onClick={handleLike}
                    disabled={liking}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={post.liked_by_me ? '#e74c6f' : 'none'} stroke={post.liked_by_me ? '#e74c6f' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{post.liked_by_me ? 'Loved' : 'Love'}</span>
                </button>
                <button
                    className="btn-action btn-comment"
                    onClick={() => setShowComments(!showComments)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Comment</span>
                </button>
            </div>

            {showComments && <CommentSection postId={post.id} />}
        </div>
    );
}
