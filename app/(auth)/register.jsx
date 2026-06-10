import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ScreenWrapper from '../../components/ScreenWrapper'
import { colors } from '../../constants/theme'
import { useRouter } from 'expo-router'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import * as SecureStore from 'expo-secure-store'
import * as ImagePicker from 'expo-image-picker'
import { connectSocket } from '../../utils/socket'

const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

const Register = () => {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)

    const formik = useFormik({
        initialValues: { username: '', email: '', password: '', avatar: null },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                formData.append('username', values.username);
                formData.append('email', values.email);
                formData.append('password', values.password);

                if (values.avatar) {
                    formData.append('avatar', {
                        uri: values.avatar.uri,
                        name: values.avatar.fileName || 'avatar.jpg',
                        type: values.avatar.mimeType || 'image/jpeg'
                    });
                }

                // Register the user
                const registerRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'accept': '*/*'
                    },
                    body: formData
                });

                const registerData = await registerRes.json();

                if (registerData?.success === false || registerRes.status >= 400) {
                    Alert.alert('Registration Failed', registerData?.message || 'Something went wrong');
                    return;
                }

                if (registerData?.success === true) {
                    // Auto login on success
                    try {
                        const loginRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: values.email,
                                password: values.password
                            })
                        });

                        const loginData = await loginRes.json();
                        
                        if (loginData?.success === true) {
                            if (Platform.OS === 'web') {
                                localStorage.setItem('token', loginData.token);
                                localStorage.setItem('user', JSON.stringify(loginData.user));
                                localStorage.setItem('refreshToken', loginData.refreshToken);
                            } else {
                                await SecureStore.setItemAsync('token', loginData.token);
                                await SecureStore.setItemAsync('user', JSON.stringify(loginData.user));
                                await SecureStore.setItemAsync('refreshToken', loginData.refreshToken);
                            }

                            connectSocket(loginData.token); // Initialize socket with user auth token
                            Alert.alert('Success', 'Registered and logged in successfully!', [
                                { text: 'OK', onPress: () => router.replace('/(main)/direct') }
                            ]);
                        } else {
                            Alert.alert('Registration Successful', 'User registered successfully. Please log in.', [
                                { text: 'OK', onPress: () => router.replace('/login') }
                            ]);
                        }
                    } catch (loginErr) {
                        console.error("Auto login error:", loginErr);
                        Alert.alert('Registration Successful', 'User registered successfully. Please log in.', [
                            { text: 'OK', onPress: () => router.replace('/login') }
                        ]);
                    }
                } else {
                    Alert.alert('Registration Failed', registerData?.message || 'An unexpected error occurred');
                }
            } catch (error) {
                console.error("Register Error:", error);
                Alert.alert('Registration Error', error?.message || 'Failed to connect to the server');
            }
        }
    })

    const handlePickAvatar = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "Permission to access photos is required to select an avatar.");
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!pickerResult.canceled && pickerResult.assets?.[0]) {
                formik.setFieldValue('avatar', pickerResult.assets[0]);
            }
        } catch (error) {
            console.error("Avatar selection error:", error);
        }
    };

    return (
        <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScreenWrapper>
                <View className='flex-row justify-between items-center px-4'>
                    <BackButton color={colors.white} />
                    <Text className='font-bold text-gray-500'>
                        need some help ?
                    </Text>
                </View>

                <View className='flex-1 bg-white mt-10 rounded-t-3xl pt-8 px-6'>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className='mb-6'>
                            <Text className='text-3xl font-bold mb-8 text-neutral-900'>Register</Text>

                            <View>
                                {/* Profile Picture Picker */}
                                <View className="items-center mb-6">
                                    <TouchableOpacity onPress={handlePickAvatar} className="relative">
                                        {formik.values.avatar ? (
                                            <Image
                                                source={{ uri: formik.values.avatar.uri }}
                                                className="w-24 h-24 rounded-full border border-neutral-300"
                                            />
                                        ) : (
                                            <View className="w-24 h-24 rounded-full bg-neutral-200 items-center justify-center border border-neutral-300">
                                                <Ionicons name="person" size={48} color={colors.neutral400} />
                                            </View>
                                        )}
                                        <View className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-neutral-200 shadow-sm">
                                            <Ionicons name="camera" size={16} color={colors.primary} />
                                        </View>
                                    </TouchableOpacity>
                                    <Text className="text-neutral-500 mt-2 text-sm font-semibold">Add profile picture (optional)</Text>
                                </View>

                                <View className='gap-4'>
                                    <View>
                                        <Input
                                            icon={<Ionicons name="person" size={20} color={colors.neutral700} />}
                                            placeholder="Enter your username"
                                            onChangeText={formik.handleChange('username')}
                                            onBlur={formik.handleBlur('username')}
                                            value={formik.values.username}
                                        />
                                        {formik.touched.username && formik.errors.username && <Text className="text-red-500 text-sm mt-1 ml-2">{formik.errors.username}</Text>}
                                    </View>
                                    <View>
                                        <Input
                                            icon={<Ionicons name="mail" size={20} color={colors.neutral700} />}
                                            placeholder="Enter your email"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            onChangeText={formik.handleChange('email')}
                                            onBlur={formik.handleBlur('email')}
                                            value={formik.values.email}
                                        />
                                        {formik.touched.email && formik.errors.email && <Text className="text-red-500 text-sm mt-1 ml-2">{formik.errors.email}</Text>}
                                    </View>
                                    <View>
                                        <Input
                                            icon={<Ionicons name="lock-closed" size={20} color={colors.neutral700} />}
                                            placeholder="Enter your password"
                                            secureTextEntry={!showPassword}
                                            onChangeText={formik.handleChange('password')}
                                            onBlur={formik.handleBlur('password')}
                                            value={formik.values.password}
                                            rightIcon={
                                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={colors.neutral700} />
                                                </TouchableOpacity>
                                            }
                                        />
                                        {formik.touched.password && formik.errors.password && <Text className="text-red-500 text-sm mt-1 ml-2">{formik.errors.password}</Text>}
                                    </View>
                                </View>

                                <View className='mt-8 items-center'>
                                    <Button title="Sign Up" onPress={formik.handleSubmit} buttonStyle={{ width: '100%' }} />
                                </View>
                            </View>

                            <View className='flex-row justify-center items-center mt-6'>
                                <Text className='text-neutral-600'>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/login')}>
                                    <Text className='font-bold' style={{ color: colors.primary }}>Login</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </View>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    )
}

export default Register


