import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import ChatItem from '../../components/ChatItem';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DUMMY_GROUPS = [
    { id: 'g1', name: 'Frontend Team', lastMessage: 'Alex: Pushed the new UI updates.', time: '11:20 AM', unreadCount: 12, avatar: 'https://i.pravatar.cc/150?img=21' },
    { id: 'g2', name: 'Design Sync', lastMessage: 'Figma link updated.', time: '09:00 AM', unreadCount: 0, avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: 'g3', name: 'General', lastMessage: 'Lunch at 1?', time: 'Yesterday', unreadCount: 1, avatar: 'https://i.pravatar.cc/150?img=15' },
];

const GroupMessages = () => {
    const router = useRouter();

    return (
        <ScreenWrapper>
            <View className="px-5 flex-row justify-between items-center mb-2">
                <Text className="text-3xl font-bold text-white">Groups</Text>
                <View className="flex-row gap-3 items-center">
                    <Ionicons name="search" size={24} color={colors.white} />
                    <TouchableOpacity className="p-2 rounded-full justify-center items-center" style={{ backgroundColor: colors.primary }}>
                        <Ionicons name="add" size={24} color={colors.neutral900} />
                    </TouchableOpacity>
                </View>
            </View>
            
            <View className="flex-1 bg-white mt-4 rounded-t-3xl pt-2 overflow-hidden">
                <FlatList 
                    data={DUMMY_GROUPS}
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

export default GroupMessages;
