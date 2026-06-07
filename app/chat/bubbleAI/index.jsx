import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Alert, Keyboard, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/theme';
import ScreenWrapper from '../../../components/ScreenWrapper';
import { getStorageItem, setStorageItem } from '../../../utils/api';

const POPULAR_EMOJIS = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
    '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
    '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
    '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
    '🤗', '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠', '👍', '👎',
    '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💪',
    '✌️', '🤞', '🤙', '👋', '❤️', '🔥', '✨', '🎉', '💯', '💬'
];

// TypingDots Animation Component
const TypingDots = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animateDot = (dot, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: -6,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animation = Animated.parallel([
            animateDot(dot1, 0),
            animateDot(dot2, 150),
            animateDot(dot3, 300),
        ]);

        animation.start();

        return () => animation.stop();
    }, [dot1, dot2, dot3]);

    const dotStyle = (dot) => ({
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.neutral600,
        transform: [{ translateY: dot }],
    });

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 16, gap: 4 }}>
            <Animated.View style={dotStyle(dot1)} />
            <Animated.View style={dotStyle(dot2)} />
            <Animated.View style={dotStyle(dot3)} />
        </View>
    );
};

const AiChatInterface = () => {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const flatListRef = useRef(null);
    const activeIntervalsRef = useRef([]);

    // Get the base chatbot URL safely

    // Clean up active intervals on unmount
    useEffect(() => {
        return () => {
            activeIntervalsRef.current.forEach(clearInterval);
        };
    }, []);

    // Load user and chat history on mount
    useEffect(() => {
        async function initChat() {
            try {
                // Load user info
                const userStr = await getStorageItem('user');
                if (userStr) {
                    setUser(JSON.parse(userStr));
                }

                // Load chat history
                const historyStr = await getStorageItem('bubble_ai_history');
                if (historyStr) {
                    setMessages(JSON.parse(historyStr));
                } else {
                    // Seed with default welcome message
                    const welcomeMessage = {
                        id: 'welcome',
                        text: "Hello! I'm Bubble, your friendly assistant here to help you with any questions or issues you might have with the Bubble chatting/messaging app. How can I assist you today?",
                        sender: 'other',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages([welcomeMessage]);
                }
            } catch (error) {
                console.error('Error initializing AI Chat:', error);
            }
        }
        initChat();
    }, []);

    // Helper to save messages to local storage (removes temporary typewriter state)
    const saveMessages = async (updatedMessages) => {
        try {
            const cleanMessages = updatedMessages.map(m => {
                if (m.isTypingEffect && m.fullAnswer) {
                    return { ...m, text: m.fullAnswer, isTypingEffect: false };
                }
                return m;
            });
            await setStorageItem('bubble_ai_history', JSON.stringify(cleanMessages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    const toggleEmojiPicker = () => {
        if (!showEmojiPicker) {
            Keyboard.dismiss();
        }
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
    };

    // Clear conversation history
    const handleClearChat = () => {
        Alert.alert(
            "Clear Conversation",
            "Are you sure you want to clear your conversation history with Bubble AI?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const welcomeMessage = {
                                id: 'welcome',
                                text: "Hello! I'm Bubble, your friendly assistant here to help you with any questions or issues you might have with the Bubble chatting/messaging app. How can I assist you today?",
                                sender: 'other',
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                            setMessages([welcomeMessage]);
                            await setStorageItem('bubble_ai_history', JSON.stringify([welcomeMessage]));
                        } catch (error) {
                            console.error('Error clearing chat history:', error);
                        }
                    }
                }
            ]
        );
    };

    // Simulate typewriter effect for bot response
    const typeMessage = (answer, botMessageId) => {
        let currentText = '';
        let index = 0;

        const interval = setInterval(() => {
            if (index < answer.length) {
                currentText += answer[index];
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId ? { ...msg, text: currentText } : msg
                ));
                index++;
            } else {
                clearInterval(interval);
                activeIntervalsRef.current = activeIntervalsRef.current.filter(i => i !== interval);
                
                setMessages(prev => {
                    const finished = prev.map(msg => 
                        msg.id === botMessageId ? { ...msg, text: answer, isTypingEffect: false } : msg
                    );
                    saveMessages(finished);
                    return finished;
                });
            }
        }, 15); // 15ms per character for a smooth typing animation

        activeIntervalsRef.current.push(interval);
    };

    const sendMessage = async () => {
        if (message.trim().length === 0) return;

        const userMessageText = message.trim();
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const userMessage = {
            id: Date.now().toString(),
            text: userMessageText,
            sender: 'me',
            time: timestamp
        };

        // Update UI state with user message
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
        setMessage('');
        setIsTyping(true);

        try {
            // Prepare API call payload
            const senderId = user?.id ? user.id.toString() : '2';
            const response = await fetch(`${process.env.EXPO_PUBLIC_CHAT_BOT_AI}/chat`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessageText,
                    sender_id: senderId
                })
            });

            const data = await response.json();
            setIsTyping(false);

            if (data.success && data.answer) {
                // Initialize empty bot message for typing effect
                const botMessageId = (Date.now() + 1).toString();
                const botMessage = {
                    id: botMessageId,
                    text: '',
                    fullAnswer: data.answer,
                    sender: 'other',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isTypingEffect: true
                };

                setMessages(prev => [...prev, botMessage]);
                typeMessage(data.answer, botMessageId);
            } else {
                throw new Error(data.message || 'Failed to get answer from chatbot');
            }
        } catch (error) {
            console.error('Error communicating with AI Chatbot:', error);
            setIsTyping(false);
            
            // Add system error message
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
                sender: 'other',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            const finalMsgs = [...updatedMessages, errorMessage];
            setMessages(finalMsgs);
            saveMessages(finalMsgs);
        }
    };

    // Append typing indicator if chatbot is currently processing
    const chatData = isTyping ? [...messages, { id: 'typing_indicator', isTyping: true }] : messages;

    return (
        <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScreenWrapper>
                {/* Header */}
                <View className="px-4 flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="chevron-back" size={28} color={colors.white} />
                    </TouchableOpacity>
                    
                    <Image 
                        source={{ uri: 'https://img.magnific.com/free-vector/3d-ai-robot-character-chat-bot-wink-mascot-icon_107791-30020.jpg?semt=ais_hybrid&w=740&q=80' }} 
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-white">Bubble AI Assistant</Text>
                        <Text className="text-xs font-semibold" style={{ color: colors.green }}>
                            Online
                        </Text>
                    </View>
                    
                    <TouchableOpacity onPress={handleClearChat} className="ml-2">
                        <Ionicons name="trash-outline" size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Chat Area */}
                <View className="flex-1 bg-neutral-50 rounded-t-3xl overflow-hidden pt-4">
                    <FlatList
                        ref={flatListRef}
                        data={chatData}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        renderItem={({ item }) => {
                            if (item.isTyping) {
                                return (
                                    <View className="mb-4 max-w-[80%] self-start">
                                        <View 
                                            className="px-5 py-4 rounded-2xl rounded-tl-sm justify-center items-center"
                                            style={{ backgroundColor: colors.otherBubble, minWidth: 60, minHeight: 40 }}
                                        >
                                            <TypingDots />
                                        </View>
                                        <Text className="text-xs text-neutral-400 mt-1 ml-1">
                                            Bubble is typing...
                                        </Text>
                                    </View>
                                );
                            }

                            const isMe = item.sender === 'me';
                            return (
                                <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                                    <View 
                                        className={`px-4 py-3 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                                        style={{ backgroundColor: isMe ? colors.myBubble : colors.otherBubble }}
                                    >
                                        <Text className="text-neutral-900 text-base">{item.text}</Text>
                                    </View>
                                    <Text className={`text-xs text-neutral-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {item.time}
                                    </Text>
                                </View>
                            );
                        }}
                    />

                    {/* Input Area */}
                    <View className="px-4 py-3 bg-white border-t border-neutral-100 flex-row items-center pb-8">
                        <TouchableOpacity className="mr-3">
                            <Ionicons name="add" size={28} color={colors.neutral500} />
                        </TouchableOpacity>
                        
                        <View className="flex-1 flex-row items-center bg-neutral-100 rounded-full px-4 py-2">
                            <TextInput 
                                className="flex-1 text-base text-neutral-900 pr-2 h-10"
                                placeholder="Message Bubble AI..."
                                placeholderTextColor={colors.neutral500}
                                value={message}
                                onChangeText={setMessage}
                                onFocus={() => setShowEmojiPicker(false)}
                                multiline
                            />
                            <TouchableOpacity onPress={toggleEmojiPicker}>
                                <Ionicons 
                                    name={showEmojiPicker ? "keyboard-outline" : "happy-outline"} 
                                    size={24} 
                                    color={colors.neutral500} 
                                
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity 
                            className="ml-3 w-12 h-12 rounded-full items-center justify-center"
                            style={{ backgroundColor: message.trim().length > 0 ? colors.primary : colors.neutral200 }}
                            onPress={sendMessage}
                            disabled={message.trim().length === 0 || isTyping}
                        >
                            <Ionicons 
                                name="send" 
                                size={20} 
                                color={message.trim().length > 0 ? colors.neutral900 : colors.neutral400} 
                                style={{ marginLeft: 4 }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Emoji Picker Grid */}
                    {showEmojiPicker && (
                        <View className="h-60 bg-white border-t border-neutral-100 p-4">
                            <FlatList
                                data={POPULAR_EMOJIS}
                                keyExtractor={(item) => item}
                                numColumns={8}
                                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        className="w-10 h-10 items-center justify-center rounded-lg active:bg-neutral-100"
                                        onPress={() => handleEmojiSelect(item)}
                                    >
                                        <Text className="text-2xl">{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                </View>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
};

export default AiChatInterface;
