import { useState, useEffect, useCallback } from 'react';
import { fetchPosts } from '../api';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

export default function FeedPage({ session }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userId = session?.user?.id;

    const loadPosts = useCallback(async () => {
        try {
            setError('');
            const data = await fetchPosts(userId);
            setPosts(data);
        } catch (err) {
            setError('Failed to load posts. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    function handlePostCreated() {
        loadPosts();
    }

    function handlePostDeleted(postId) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    }

    function handleLikeToggled(postId, liked) {
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? {
                        ...p,
                        liked_by_me: liked,
                        like_count: liked ? p.like_count + 1 : p.like_count - 1,
                    }
                    : p
            )
        );
    }

    return (
        <div className="app-layout">
            <Navbar session={session} />
            <main className="feed-container">
                <CreatePost onPostCreated={handlePostCreated} />

                {loading && (
                    <div className="feed-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading posts...</p>
                    </div>
                )}

                {error && <div className="feed-error">{error}</div>}

                {!loading && !error && posts.length === 0 && (
                    <div className="feed-empty">
                        <div className="empty-icon">📝</div>
                        <h3>No posts yet</h3>
                        <p>Be the first to share something!</p>
                    </div>
                )}

                <div className="posts-list">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={userId}
                            onDelete={handlePostDeleted}
                            onLikeToggle={handleLikeToggled}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
