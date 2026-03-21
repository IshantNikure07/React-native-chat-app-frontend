import { Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { colors } from '../../constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import Button from '../../components/Button'

const Welcome = () => {
  const router = useRouter()
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.7}>
      <View className="flex-1 justify-around items-center">

        <Text className='text-5xl font-bold text-center ' style={{ color: colors.white }}>Chat App</Text>

        <Animated.Image
          source={require("../../assets/images/welcome.png")}
          entering={FadeInDown.delay(100).springify()}
          style={{
            width: "90%",
            height: "50%",
            resizeMode: "contain",
          }}
        />

        <View className="flex justify-start items-start px-4">
          <Text className='text-4xl font-bold  ' style={{ color: colors.white }}>Stay connected</Text>
          <Text className='text-4xl font-bold  ' style={{ color: colors.white }}>with your friends & family</Text>
        </View>

        <Button 
          title="Get Started" 
          onPress={() => router.push('/register')} 
        />

      </View>
    </ScreenWrapper>
  )
}

export default Welcome

