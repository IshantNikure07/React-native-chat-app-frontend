import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useRouter } from 'expo-router';

const AccountScreen = () => {
    const router = useRouter();

    return (
        <ScreenWrapper>
            <View className="px-5 flex-row justify-between items-center mb-2">
                <Text className="text-3xl font-bold text-white">Account</Text>
            </View>

            <View className="flex-1 bg-neutral-50 mt-4 rounded-t-3xl overflow-hidden">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="items-center py-10 bg-white border-b border-neutral-200">
                        <View className="relative">
                            <Image 
                                source={{ uri: 'https://i.pravatar.cc/300?img=11' }} 
                                className="w-28 h-28 rounded-full"
                            />
                            <TouchableOpacity className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-neutral-200">
                                <Ionicons name="camera" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-2xl font-bold text-neutral-900 mt-4">John Doe</Text>
                        <Text className="text-base text-neutral-500 mt-1">johndoe@example.com</Text>
                    </View>

                    <View className="mt-6 px-4 gap-4">
                        <TouchableOpacity className="flex-row items-center p-4 bg-white rounded-xl shadow-sm">
                            <Ionicons name="person-circle" size={24} color={colors.neutral700} />
                            <Text className="flex-1 ml-4 text-base font-semibold text-neutral-800">Edit Profile</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.neutral400} />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center p-4 bg-white rounded-xl shadow-sm">
                            <Ionicons name="notifications" size={24} color={colors.neutral700} />
                            <Text className="flex-1 ml-4 text-base font-semibold text-neutral-800">Notifications</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.neutral400} />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center p-4 bg-white rounded-xl shadow-sm">
                            <Ionicons name="lock-closed" size={24} color={colors.neutral700} />
                            <Text className="flex-1 ml-4 text-base font-semibold text-neutral-800">Privacy & Security</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.neutral400} />
                        </TouchableOpacity>
                    </View>

                    <View className="px-4 py-8 mt-4 items-center mb-10">
                        <Button 
                            title="Log Out" 
                            onPress={() => router.replace('/login')} 
                            buttonStyle={{ width: '100%', backgroundColor: colors.rose }} 
                        />
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

export default AccountScreen;
