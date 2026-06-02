import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import ChatItem from '../components/ChatItem';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiFetch, getStorageItem } from '../utils/api';

const UsersScreen = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await apiFetch('/api/users');
                const data = await response.json();

                if (data.success && data.users) {
                    // Filter out the logged-in user
                    const loggedInUserStr = await getStorageItem('user');
                    const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
                    
                    const filteredUsers = data.users.filter(
                        (u) => u.id !== loggedInUser?.id
                    );
                    setUsers(filteredUsers);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="px-4 flex-row items-center mb-4">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="chevron-back" size={28} color={colors.white} />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white">Start a Chat</Text>
            </View>
            
            <View className="flex-1 bg-white mt-4 rounded-t-3xl pt-2 overflow-hidden">
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : users.length === 0 ? (
                    <View className="flex-1 justify-center items-center px-6">
                        <Ionicons name="people-outline" size={64} color={colors.neutral400} />
                        <Text className="text-lg font-semibold text-neutral-600 mt-4">No users found</Text>
                        <Text className="text-sm text-neutral-400 text-center mt-2">
                            Invite your friends or register other accounts to start chatting!
                        </Text>
                    </View>
                ) : (
                    <FlatList 
                        data={users}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <ChatItem 
                                name={item.username}
                                lastMessage={item.email}
                                avatarUrl={item.avatar ? `${process.env.EXPO_PUBLIC_BACKEND_URL}${item.avatar}` : null}
                                onPress={() => router.push(`/chat/${item.id}`)}
                            />
                        )}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default UsersScreen;
