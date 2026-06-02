import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Helper to get item from storage
export async function getStorageItem(key) {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    } else {
        return await SecureStore.getItemAsync(key);
    }
}

// Helper to set item in storage
export async function setStorageItem(key, value) {
    if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
}

// Helper to remove item from storage
export async function removeStorageItem(key) {
    if (Platform.OS === 'web') {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key);
    }
}

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

function onRefreshFailed(error) {
    refreshSubscribers.forEach((cb) => cb(null, error));
    refreshSubscribers = [];
}

/**
 * Custom fetch wrapper that automatically appends Auth token and refreshes it if expired.
 * 
 * @param {string} endpoint - API endpoint (relative e.g., '/api/conversation' or absolute)
 * @param {object} options - Standard fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || '';
    
    // Construct the absolute URL
    const url = endpoint.startsWith('http') ? endpoint : `${backendUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    // Get current access token
    let token = await getStorageItem('token');

    // Setup headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        ...options,
        headers,
    };

    try {
        let response = await fetch(url, fetchOptions);

        // If the request returns 401 Unauthorized (invalid or expired token)
        if (response.status === 401) {
            if (!isRefreshing) {
                isRefreshing = true;
                const refreshToken = await getStorageItem('refreshToken');

                if (!refreshToken) {
                    isRefreshing = false;
                    // No refresh token available, logout user
                    await removeStorageItem('token');
                    await removeStorageItem('refreshToken');
                    await removeStorageItem('user');
                    router.replace('/(auth)/login');
                    return response;
                }

                try {
                    // Call the refresh token API
                    const refreshRes = await fetch(`${backendUrl}/api/auth/refreshToken`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (refreshRes.status === 200) {
                        const refreshData = await refreshRes.json();
                        if (refreshData.success && refreshData.token) {
                            // Update tokens in storage
                            await setStorageItem('token', refreshData.token);
                            if (refreshData.refreshToken) {
                                await setStorageItem('refreshToken', refreshData.refreshToken);
                            }

                            // Notify all waiting subscribers
                            onRefreshed(refreshData.token);
                            isRefreshing = false;

                            // Retry original request with the new access token
                            const newHeaders = {
                                ...fetchOptions.headers,
                                'Authorization': `Bearer ${refreshData.token}`,
                            };
                            return await fetch(url, { ...fetchOptions, headers: newHeaders });
                        }
                    }

                    throw new Error('Refresh token invalid or expired');

                } catch (refreshErr) {
                    console.error('Token refresh process failed:', refreshErr);
                    onRefreshFailed(refreshErr);
                    isRefreshing = false;

                    // Clear storage and redirect user to login
                    await removeStorageItem('token');
                    await removeStorageItem('refreshToken');
                    await removeStorageItem('user');
                    router.replace('/(auth)/login');
                    return response;
                }
            } else {
                // If another request is already refreshing the token, subscribe to the result
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(async (newToken, error) => {
                        if (error) {
                            // If refresh failed, return the original unauthorized response
                            resolve(response);
                        } else {
                            // Retry with the newly acquired token
                            const newHeaders = {
                                ...fetchOptions.headers,
                                'Authorization': `Bearer ${newToken}`,
                            };
                            try {
                                const retriedRes = await fetch(url, { ...fetchOptions, headers: newHeaders });
                                resolve(retriedRes);
                            } catch (retryErr) {
                                reject(retryErr);
                            }
                        }
                    });
                });
            }
        }

        return response;

    } catch (error) {
        console.error(`apiFetch call failed for ${url}:`, error);
        throw error;
    }
}
