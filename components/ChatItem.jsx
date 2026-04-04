import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const ChatItem = ({ name, lastMessage, time, unreadCount, avatarUrl, onPress }) => {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="flex-row items-center py-3 px-4 bg-white border-b border-neutral-100"
        >
            <View className="relative">
                {avatarUrl ? (
                    <Image 
                        source={{ uri: avatarUrl }} 
                        className="w-14 h-14 rounded-full"
                    />
                ) : (
                    <View className="w-14 h-14 rounded-full bg-neutral-200 justify-center items-center">
                        <Ionicons name="person" size={24} color={colors.neutral500} />
                    </View>
                )}
            </View>
            
            <View className="flex-1 ml-4 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-base font-bold text-neutral-900" numberOfLines={1}>
                        {name}
                    </Text>
                    <Text className="text-xs text-neutral-500">{time}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text 
                        className="text-sm text-neutral-500 flex-1 mr-4" 
                        numberOfLines={1}
                    >
                        {lastMessage}
                    </Text>
                    {unreadCount > 0 && (
                        <View 
                            className="rounded-full justify-center items-center px-2 py-1"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <Text className="text-xs font-bold text-white">
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ChatItem;
