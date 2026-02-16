import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
}

async function request(endpoint, options = {}) {
    const token = await getToken();
    const headers = { ...options.headers };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser does it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
    }

    return res.json();
}

// ---- Posts ----

export async function fetchPosts(userId) {
    const query = userId ? `?user_id=${userId}` : '';
    return request(`/api/posts${query}`);
}

export async function createTextPost(content) {
    return request('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
}

export async function createImagePost(content, imageFile) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', imageFile);
    return request('/api/posts/upload', {
        method: 'POST',
        body: formData,
    });
}

export async function deletePost(postId) {
    return request(`/api/posts/${postId}`, { method: 'DELETE' });
}

export async function updatePost(postId, content, removeImage, imageFile) {
    const formData = new FormData();
    formData.append('content', content);
    if (removeImage) formData.append('remove_image', 'true');
    if (imageFile) formData.append('image', imageFile);

    return request(`/api/posts/${postId}`, {
        method: 'PUT',
        body: formData,
    });
}

// ---- Likes ----

export async function toggleLike(postId) {
    return request(`/api/posts/${postId}/like`, { method: 'POST' });
}

// ---- Comments ----

export async function fetchComments(postId) {
    return request(`/api/posts/${postId}/comments`);
}

export async function addComment(postId, content, parentId = null) {
    return request(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, parent_id: parentId }),
    });
}

export async function deleteComment(commentId) {
    return request(`/api/comments/${commentId}`, { method: 'DELETE' });
}

export async function updateComment(commentId, content) {
    return request(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
    });
}

// ---- Profile ----

export async function fetchProfile() {
    return request('/api/profile');
}
