import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import ChatItem from '../../components/ChatItem';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiFetch } from '../../utils/api';
import { getSocket } from '../../utils/socket';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// const DUMMY_CHATS = [
//     { id: '1', name: 'John Doe', lastMessage: 'Hey, UI looks great!', time: '10:30 AM', unreadCount: 2, avatar: 'https://i.pravatar.cc/150?img=11' },
//     { id: '2', name: 'Jane Smith', lastMessage: 'Are we still meeting today?', time: '09:45 AM', unreadCount: 0, avatar: 'https://i.pravatar.cc/150?img=5' },
//     { id: '3', name: 'Michael Boss', lastMessage: 'Please send me the files.', time: 'Yesterday', unreadCount: 5, avatar: 'https://i.pravatar.cc/150?img=8' },
//     { id: '4', name: 'Sarah Connor', lastMessage: 'I will be back.', time: 'Yesterday', unreadCount: 0, avatar: null },
// ];


const DirectMessages = () => {
    const [conversations , setConversations] = useState([])
    const [showAiText , setShowAiText]= useState(true)
    const router = useRouter();

  useEffect(() => {
  const timer = setTimeout(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAiText(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
    const socket = getSocket();

    if (socket) {
        socket.on("newMessage", (data) => {
            const messageConvId = data.conversation_id || data.conversationId;
            
            setConversations(prev => {
                const exists = prev.some(c => Number(c.id) === Number(messageConvId));
                
                if (exists) {
                    const updated = prev.map(c => {
                        if (Number(c.id) === Number(messageConvId)) {
                            return {
                                ...c,
                                lastMessage: data.content,
                                time: new Date(data.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                unreadCount: (c.unreadCount || 0) + 1
                            };
                        }
                        return c;
                    });
                    
                    // Sort the conversations so the newly updated one is at the top
                    return [...updated].sort((a, b) => {
                        if (Number(a.id) === Number(messageConvId)) return -1;
                        if (Number(b.id) === Number(messageConvId)) return 1;
                        return 0;
                    });
                } else {
                    // Refetch list since it's a new conversation
                    async function refreshConversations() {
                        try {
                            const response = await apiFetch('/api/conversation');
                            const resData = await response.json();
                            if (resData.success && resData.conversations) {
                                setConversations(resData.conversations);
                            }
                        } catch (error) {
                            console.error('Error refreshing conversations:', error);
                        }
                    }
                    refreshConversations();
                    return prev;
                }
            });
        });
    }

    return () => {
        if (socket) {
            socket.off("newMessage");
        }
    };
  }, []);

    useFocusEffect(
        useCallback(() => {
            async function fetchConversations() {
                try {
                    const response = await apiFetch('/api/conversation');
                    const data = await response.json(); // ✅ IMPORTANT

                    console.log("API DATA:", data); // debug

                    if (data.success && data.conversations) {
                        setConversations(data.conversations);
                    }

                } catch (error) {
                    console.error('Error fetching conversations:', error);
                }
            }

            fetchConversations();
        }, [])
    );

    return (
        <ScreenWrapper>
            <View className="px-5 flex-row justify-between items-center mb-2">
                <Text className="text-3xl font-bold text-white">Chats</Text>
                <View className="flex-row gap-3 items-center">
                    <Ionicons name="add" onPress={() => router.push('/users')} size={24} color={colors.white} />
                    {/* <TouchableOpacity className="p-2 rounded-full justify-center items-center" style={{ backgroundColor: colors.primary }}>
                        <Ionicons name="add" size={24} color={colors.neutral900} />
                    </TouchableOpacity> */}
                </View>
            </View>
            
            <View className="flex-1 bg-white mt-4 rounded-t-3xl pt-2 overflow-hidden">
                <FlatList 
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ChatItem 
                            name={item.name}
                            lastMessage={item.lastMessage}
                            time={item.time}
                            unreadCount={item.unreadCount}
 avatarUrl={
                            item.avatar
      ? item.avatar.startsWith('http')
        ? item.avatar
        : `${process.env.EXPO_PUBLIC_BACKEND_URL}${item.avatar}`
      : 'https://i.pinimg.com/736x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg'
  }                            onPress={() => {
                                const avatarParam = item.avatar ? `&avatar=${encodeURIComponent(item.avatar)}` : '';
                                const receiverParam = (item.participantId || item.userId || item.receiverId) ? `&receiverId=${item.participantId || item.userId || item.receiverId}` : '';
                                router.push(`/chat/${item.id}?username=${encodeURIComponent(item.name || '')}${avatarParam}${receiverParam}`);
                            }}
                        />
                    )}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    showsVerticalScrollIndicator={false}
                />

              <TouchableOpacity
                className="absolute bottom-5 right-5 flex-row items-center justify-center rounded-2xl h-12 px-4"
                style={{ backgroundColor: colors.primary }}
                onPress={() => router.push('/chat/bubbleAI')}
                >
                {showAiText && (
                    <Text
                    style={{
                        marginRight: 8,
                        fontWeight: '600',
                        color: colors.neutral900,
                    }}
                    >
                    Bubble AI
                    </Text>
                )}

                <Ionicons
                    name="sparkles-outline"
                    size={20}
                    color={colors.neutral900}
                />
                </TouchableOpacity>
              {/* <TouchableOpacity
                className="absolute bottom-20 right-5 flex-row items-center justify-center rounded-2xl h-12 px-4"
                style={{ backgroundColor: colors.primary }}
                onPress={() => router.push('/chat/bubbleAI')}
                >
                {showAiText && (
                    <Text
                    style={{
                        marginRight: 8,
                        fontWeight: '600',
                        color: colors.neutral900,
                    }}
                    >
                    Bubble AI
                    </Text>
                )}

                <Ionicons
                    name="sparkles-outline"
                    size={20}
                    color={colors.neutral900}
                />
                </TouchableOpacity> */}

                {/* <TouchableOpacity 
                    className="rounded-full absolute bottom-5 right-5 items-center justify-center w-12 h-12" 
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => router.push('/users')}
                >
                    <Ionicons name="add" size={24} color={colors.neutral900} />
                </TouchableOpacity> */}

               
            </View>
        </ScreenWrapper>
    );
};

export default DirectMessages;
