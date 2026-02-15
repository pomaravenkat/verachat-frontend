import { useState, useRef } from 'react';
import { createTextPost, createImagePost } from '../api';

export default function CreatePost({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be smaller than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    }

    function removeImage() {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!content.trim() && !imageFile) return;

        setLoading(true);
        setError('');

        try {
            if (imageFile) {
                await createImagePost(content, imageFile);
            } else {
                await createTextPost(content);
            }
            setContent('');
            removeImage();
            onPostCreated();
        } catch (err) {
            setError(err.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="create-post-card">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="create-post-input"
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                />

                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button type="button" className="remove-image-btn" onClick={removeImage}>
                            ✕
                        </button>
                    </div>
                )}

                {error && <div className="create-post-error">{error}</div>}

                <div className="create-post-actions">
                    <button
                        type="button"
                        className="btn btn-attach"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Photo
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                    />
                    <button
                        type="submit"
                        className="btn btn-primary btn-post"
                        disabled={loading || (!content.trim() && !imageFile)}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
