import { Ionicons } from '@expo/vector-icons'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import BackButton from '../../components/BackButton'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ScreenWrapper from '../../components/ScreenWrapper'
import { colors } from '../../constants/theme'
import { TouchableOpacity } from 'react-native'

const Register = () => {
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

                            <View className='gap-4'>
                                <Input
                                    icon={<Ionicons name="person" size={20} color={colors.neutral700} />}
                                    placeholder="Enter your name"
                                />
                                <Input
                                    icon={<Ionicons name="mail" size={20} color={colors.neutral700} />}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <Input
                                    icon={<Ionicons name="lock-closed" size={20} color={colors.neutral700} />}
                                    placeholder="Enter your password"
                                    secureTextEntry
                                />
                            </View>

                            <View className='mt-8 items-center'>
                                <Button title="Sign Up" onPress={() => { }} buttonStyle={{ width: '100%' }} />
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

