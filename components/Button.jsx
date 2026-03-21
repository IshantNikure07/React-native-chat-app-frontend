import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '../constants/theme'

const Button = ({ title, onPress, buttonStyle, textStyle }) => {
  return (
    <TouchableOpacity 
      className='w-[80%] rounded-full p-3 py-4'
      style={[{ backgroundColor: colors.primary }, buttonStyle]}
      onPress={onPress}
    >
      <Text 
        className='text-center text-lg font-bold' 
        style={[{ color: colors.neutral900 }, textStyle]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
