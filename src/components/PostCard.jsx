import { useState, useRef } from 'react';
import { toggleLike, deletePost, updatePost } from '../api';
import CommentSection from './CommentSection';

export default function PostCard({ post, currentUserId, onDelete, onLikeToggle }) {
    const [showComments, setShowComments] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content || '');
    const [removeImage, setRemoveImage] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [liking, setLiking] = useState(false);
    const [saving, setSaving] = useState(false);

    // Image upload state
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Local state for optimistic updates
    const [currentContent, setCurrentContent] = useState(post.content);
    const [currentImageUrl, setCurrentImageUrl] = useState(post.image_url);

    const isOwner = post.user_id === currentUserId;

    function timeAgo(dateStr) {
        // ... (keep existing timeAgo logic, implicitly included if not replaced)
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

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setRemoveImage(false); // Reset remove flag if new image selected
    }

    async function handleSaveEdit() {
        setSaving(true);
        try {
            await updatePost(post.id, editContent, removeImage, selectedFile);

            // Optimistic update
            setCurrentContent(editContent);
            if (removeImage) {
                setCurrentImageUrl(null);
            } else if (previewUrl) {
                // We can't know the real URL immediately without refetching or returning it from backend
                // But for now, showing the blob URL is a decent optimistic update, 
                // though it won't persist on reload until we fetch or get response.
                // ideally backend returns the new post object.
                // Let's assume for now we might need to refresh or just accept the blob
                setCurrentImageUrl(previewUrl);
            }

            setIsEditing(false);
            // Cleanup checks
            if (previewUrl && !currentImageUrl) {
                // If we had a blob, keep it until refresh or maybe replace with real url if we parsed response
            }
        } catch (err) {
            alert('Failed to update post');
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    function handleCancelEdit() {
        setIsEditing(false);
        setEditContent(currentContent || '');
        setRemoveImage(false);
        setSelectedFile(null);
        setPreviewUrl(null);
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
                {isOwner && !isEditing && (
                    <div className="post-owner-actions">
                        <button
                            className="btn-icon btn-edit-post"
                            onClick={() => setIsEditing(true)}
                            title="Edit post"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
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
                    </div>
                )}
            </div>

            <div className="post-body">
                {isEditing ? (
                    <div className="edit-post-form">
                        <textarea
                            className="edit-post-textarea"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                        />

                        {/* Image Preview Area */}
                        {(previewUrl || (currentImageUrl && !removeImage)) && (
                            <div className="edit-image-preview">
                                <img src={previewUrl || currentImageUrl} alt="Post" />
                                <button
                                    type="button"
                                    className="btn-remove-image"
                                    onClick={() => {
                                        setRemoveImage(true);
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                    }}
                                    title="Remove Image"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {removeImage && !previewUrl && (
                            <div className="image-removed-msg">Image will be removed</div>
                        )}

                        <div className="edit-media-actions">
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {currentImageUrl || previewUrl ? 'Change Photo' : 'Add Photo'}
                            </button>
                        </div>

                        <div className="edit-actions">
                            <button className="btn btn-secondary" onClick={handleCancelEdit} disabled={saving}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveEdit} disabled={saving}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {currentContent && <p className="post-content">{currentContent}</p>}

                        {currentImageUrl && (
                            <div className="post-image">
                                <img src={currentImageUrl} alt="Post" loading="lazy" />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="post-stats">
                {post.like_count > 0 && (
                    <span className="stat-likes">
                        ❤️ {post.like_count} {post.like_count === 1 ? 'Loved' : 'Loved'}
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

            {showComments && (
                <CommentSection
                    postId={post.id}
                    currentUserId={currentUserId}
                    isPostOwner={isOwner}
                />
            )}
        </div>
    );
}
