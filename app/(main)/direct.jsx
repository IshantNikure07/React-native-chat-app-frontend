import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import ChatItem from '../../components/ChatItem';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DUMMY_CHATS = [
    { id: '1', name: 'John Doe', lastMessage: 'Hey, UI looks great!', time: '10:30 AM', unreadCount: 2, avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: '2', name: 'Jane Smith', lastMessage: 'Are we still meeting today?', time: '09:45 AM', unreadCount: 0, avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: '3', name: 'Michael Boss', lastMessage: 'Please send me the files.', time: 'Yesterday', unreadCount: 5, avatar: 'https://i.pravatar.cc/150?img=8' },
    { id: '4', name: 'Sarah Connor', lastMessage: 'I will be back.', time: 'Yesterday', unreadCount: 0, avatar: null },
];

const DirectMessages = () => {
    const router = useRouter();

    return (
        <ScreenWrapper>
            <View className="px-5 flex-row justify-between items-center mb-2">
                <Text className="text-3xl font-bold text-white">Chats</Text>
                <View className="flex-row gap-3 items-center">
                    <Ionicons name="search" size={24} color={colors.white} />
                    <TouchableOpacity className="p-2 rounded-full justify-center items-center" style={{ backgroundColor: colors.primary }}>
                        <Ionicons name="add" size={24} color={colors.neutral900} />
                    </TouchableOpacity>
                </View>
            </View>
            
            <View className="flex-1 bg-white mt-4 rounded-t-3xl pt-2 overflow-hidden">
                <FlatList 
                    data={DUMMY_CHATS}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ChatItem 
                            name={item.name}
                            lastMessage={item.lastMessage}
                            time={item.time}
                            unreadCount={item.unreadCount}
                            avatarUrl={item.avatar}
                            onPress={() => router.push(`/chat/${item.id}`)}
                        />
                    )}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ScreenWrapper>
    );
};

export default DirectMessages;
