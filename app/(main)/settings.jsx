import React from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SettingItem = ({ icon, title, isSwitch, value, onToggle }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-neutral-100">
        <View className="flex-row items-center">
            <View className="p-2 bg-neutral-100 rounded-lg">
                <Ionicons name={icon} size={20} color={colors.neutral700} />
            </View>
            <Text className="ml-4 text-base font-medium text-neutral-800">{title}</Text>
        </View>
        {isSwitch ? (
            <Switch 
                value={value} 
                onValueChange={onToggle}
                trackColor={{ false: colors.neutral300, true: colors.primary }}
            />
        ) : (
            <Ionicons name="chevron-forward" size={20} color={colors.neutral400} />
        )}
    </View>
);

const SettingsScreen = () => {
    const [notificationsOn, setNotificationsOn] = React.useState(true);
    const [darkModeOn, setDarkModeOn] = React.useState(false);

    return (
        <ScreenWrapper>
            <View className="px-5 flex-row justify-between items-center mb-2">
                <Text className="text-3xl font-bold text-white">Settings</Text>
            </View>

            <View className="flex-1 bg-white mt-4 rounded-t-3xl pt-2 overflow-hidden">
                <ScrollView className="px-5 mt-2" showsVerticalScrollIndicator={false}>
                    <Text className="text-sm font-semibold text-neutral-500 uppercase mt-4 mb-2 tracking-wider">Preferences</Text>
                    
                    <SettingItem 
                        icon="notifications-outline" 
                        title="Push Notifications" 
                        isSwitch 
                        value={notificationsOn} 
                        onToggle={setNotificationsOn} 
                    />
                    <SettingItem 
                        icon="moon-outline" 
                        title="Dark Mode" 
                        isSwitch 
                        value={darkModeOn} 
                        onToggle={setDarkModeOn} 
                    />
                    <SettingItem 
                        icon="language-outline" 
                        title="Language" 
                    />

                    <Text className="text-sm font-semibold text-neutral-500 uppercase mt-8 mb-2 tracking-wider">Support</Text>
                    
                    <TouchableOpacity>
                        <SettingItem icon="help-circle-outline" title="Help Center" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <SettingItem icon="document-text-outline" title="Terms of Service" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <SettingItem icon="information-circle-outline" title="About App" />
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

export default SettingsScreen;
