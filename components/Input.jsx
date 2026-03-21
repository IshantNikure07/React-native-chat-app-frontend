import { TextInput, View, Platform } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../constants/theme'

const Input = ({ icon, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View 
      className={`flex-row items-center p-4 rounded-2xl bg-neutral-100 border gap-3 ${isFocused ? '' : 'border-neutral-300'}`}
      style={isFocused ? { borderColor: colors.primary } : {}}
    >
      {icon && icon}
      <TextInput 
        className="flex-1 text-base text-neutral-900 flex-shrink"
        placeholderTextColor={'gray'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
        style={[props.style, Platform.OS === 'web' && { outlineStyle: 'none' }]}
      />
    </View>
  )
}

export default Input
