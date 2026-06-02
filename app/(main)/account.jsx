import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { useRouter, useFocusEffect } from 'expo-router';
import { getStorageItem, setStorageItem, apiFetch } from '../../utils/api';
import * as ImagePicker from 'expo-image-picker';

const AccountScreen = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            async function loadUser() {
                try {
                    const userStr = await getStorageItem('user');
                    if (userStr) {
                        setUser(JSON.parse(userStr));
                    }
                } catch (err) {
                    console.error("Failed to load user info from storage:", err);
                }
            }
            loadUser();
        }, [])
    );

    const handlePickAndUploadAvatar = async () => {
        if (!user?.id) {
            Alert.alert("Error", "User not logged in");
            return;
        }

        try {
            // Request media library permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "Permission to access photos is required to upload an avatar.");
                return;
            }

            // Launch Image Library
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (pickerResult.canceled) {
                return;
            }

            const asset = pickerResult.assets?.[0];
            if (!asset || !asset.uri) {
                return;
            }

            setLoading(true);

            const formData = new FormData();
            
            if (Platform.OS === 'web') {
                const response = await fetch(asset.uri);
                const blob = await response.blob();
                formData.append('avatar', blob, 'avatar.jpg');
            } else {
                formData.append('avatar', {
                    uri: asset.uri,
                    name: asset.fileName || 'avatar.jpg',
                    type: asset.mimeType || 'image/jpeg',
                });
            }

            const response = await apiFetch(`/api/users/${user.id}/upload-avatar`, {
                method: 'POST',
                body: formData,
                headers: {
                    'accept': '*/*',
                }
            });

            const data = await response.json();

            if (data.success && data.user) {
                // Update stored user details
                const updatedUser = {
                    ...user,
                    avatar: data.user.avatar
                };
                await setStorageItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                Alert.alert("Uploaded successfully", "Profile picture uploaded successfully");
            } else {
                Alert.alert("Upload Failed", data.message || "Failed to upload avatar");
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            Alert.alert("Upload Error", error.message || "An error occurred during upload");
        } finally {
            setLoading(false);
        }
    };

    const username = user?.username || 'Loading...';
    const email = user?.email || '';
    const avatarUrl = user?.avatar 
        ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.EXPO_PUBLIC_BACKEND_URL}${user.avatar}`)
        : 'https://i.pravatar.cc/300?img=11';

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
                                source={{ uri: avatarUrl }} 
                                className="w-28 h-28 rounded-full"
                            />
                            {loading && (
                                <View className="absolute inset-0 bg-black/40 rounded-full items-center justify-center">
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            )}
                            <TouchableOpacity 
                                className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-neutral-200"
                                onPress={handlePickAndUploadAvatar}
                                disabled={loading}
                            >
                                <Ionicons name="camera" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-2xl font-bold text-neutral-900 mt-4">{username}</Text>
                        <Text className="text-base text-neutral-500 mt-1">{email}</Text>
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
