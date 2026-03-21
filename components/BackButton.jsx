import { TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { colors } from '../constants/theme'
import { Ionicons } from '@expo/vector-icons'

const BackButton = ({ size = 26, color = colors.neutral900 }) => {
  const router = useRouter()
  return (
    <TouchableOpacity 
      onPress={() => router.back()} 
      style={{ alignSelf: 'flex-start' }}
    >
       <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  )
}

export default BackButton
