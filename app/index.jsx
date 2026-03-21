import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useEffect } from 'react'
import { colors } from '../constants/theme'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useRouter } from 'expo-router'

const SplashScreen = () => {
  const router = useRouter()
  useEffect( ()=>{
    setTimeout(()=>{
      router.replace("/(auth)/welcome")
    },3500)
  },[])


  return (
    <View 
      className="flex-1 items-center justify-center" 
      style={{ backgroundColor: colors.neutral900 }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.neutral900}
      />
      <Animated.Image 
      source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBluDJpms3WLcIaV5NhB6ZYUbOmNd7USqdaQ&s"}}
      style={{
        width: 200,
        height: 200,
      }}
      entering={FadeIn.delay(500).duration(1000)}
      />
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({})