import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ScreenWrapper from '../../components/ScreenWrapper'
import { colors } from '../../constants/theme'
import { useRouter } from 'expo-router'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { connectSocket } from '../../utils/socket'
import * as SecureStore from 'expo-secure-store';

const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required')
})

const Login = () => {
    const router = useRouter()

    const formik = useFormik({  
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values) => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            })
            const data = await res.json()
            if (data?.success) {
                if (Platform.OS === 'web') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('refreshToken', data.refreshToken);
                } else {
                    await SecureStore.setItemAsync('token', data.token);
                    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
                    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
                }

                connectSocket(data.token) // Initialize socket with user auth token
                router.replace('/(main)/direct')
            } else {    
                Alert.alert('Login Failed', data.message)
            }
        }
    })

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
                            <Text className='text-3xl font-bold mb-8 text-neutral-900'>Login</Text>

                            <View>
                                <View className='gap-4'>
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
                                            secureTextEntry
                                            onChangeText={formik.handleChange('password')}
                                            onBlur={formik.handleBlur('password')}
                                            value={formik.values.password}
                                        />
                                        {formik.touched.password && formik.errors.password && <Text className="text-red-500 text-sm mt-1 ml-2">{formik.errors.password}</Text>}
                                    </View>

                                    <TouchableOpacity className='items-end'>
                                        <Text className='text-sm font-semibold' style={{ color: colors.neutral700 }}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className='mt-8 items-center'>
                                    <Button title="Login" onPress={formik.handleSubmit} buttonStyle={{ width: '100%' }} />
                                </View>
                            </View>

                            <View className='flex-row justify-center items-center mt-6'>
                                <Text className='text-neutral-600'>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/register')}>
                                    <Text className='font-bold' style={{ color: colors.primary }}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </View>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    )
}

export default Login
