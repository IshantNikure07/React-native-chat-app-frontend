import { ImageBackground, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../constants/theme'
import { Dimensions } from 'react-native'

const {height} = Dimensions.get("window")

const ScreenWrapper = ({
    style,
    children,
    showPattern = false,
    isModal = false,  
    bgOpacity = 0
    
}) => {
  let paddingTop = Platform.OS == 'ios' ? height * 0.06 : 40;
  let paddingBottom = 0 ;

  if(isModal){
    paddingTop = Platform.OS == 'ios' ? height * 0.02 : 45;
    paddingBottom = height * 0.02
  }
  return (
    <ImageBackground
    source={require("../assets/images/bgPattern.png")}
    style={{flex:1,
      backgroundColor: isModal ? colors.white: colors.neutral900,
      
    }}
    imageStyle={{opacity: showPattern ? bgOpacity : 0}}
    >
    <View style={[{
      paddingTop,
      paddingBottom,
      flex:1
    },
    style
    ]}>
      <StatusBar
      backgroundColor={'transparent'}
      barStyle={'light-content'}
      />
      {children}
    </View>
    </ImageBackground>
  )
}

export default ScreenWrapper

const styles = StyleSheet.create({})