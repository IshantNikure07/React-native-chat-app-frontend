import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { getSocket } from '../../utils/socket';
import { apiFetch } from '../../utils/api';

// const DUMMY_MESSAGES = [
//     { id: '1', text: 'Hey there!', sender: 'other', time: '10:00 AM' },
//     { id: '2', text: 'Hi! How are you doing?', sender: 'me', time: '10:05 AM' },
//     { id: '3', text: 'I am doing great, just checking out this new app layout. It looks awesome!', sender: 'other', time: '10:08 AM' },
// ];

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

const ChatInterface = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [sender, setSender] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const isGroup = id.startsWith('g');

    const toggleEmojiPicker = () => {
        if (!showEmojiPicker) {
            Keyboard.dismiss();
        }
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
    };

    useEffect(() => {
        async function fetchMessages() {
            try {
                const response = await apiFetch(`/api/messages/${id}`);
                const data = await response.json();

                if (data.success && data.messages) {
                    setMessages(data.messages);
                    setSender(data?.sender);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }

        if (id) {
            fetchMessages();
        }
    }, [id]);

    useEffect(() => {
        const socket = getSocket();

        if (socket) {
            // Request the initial list of online users
            socket.emit("requestOnlineUsers");

            // Listen for incoming messages dynamically from backend
            socket.on("newMessage", (data) => {
                // Determine if this is a message we should append
                // If backend savedMessage contains senderId, we will adjust sender logically.
                // Assuming `senderId` corresponds to you or 'other'. We'll fallback to checking if it's our own
                const newIncoming = {
                    id: data.id || data._id || Date.now().toString(),
                    text: data.content,
                    sender: data.senderId === socket.data?.userId ? 'me' : 'other',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, newIncoming]);
            });

            // Listen for online users list
            socket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });
            
            socket.on("messageError", (errorData) => {
                console.error("Socket Error:", errorData);
            });
        }

        return () => {
            if (socket) {
                socket.off("newMessage");
                socket.off("getOnlineUsers");
                socket.off("messageError");
            }
        };
    }, []);

    const sendMessage = () => {
        if (message.trim().length > 0) {
            const socket = getSocket();
            const messageData = {
                content: message,
                receiverId: isGroup ? null : id, // For direct messages
                conversationId: id, // Assuming `id` acts as the active conversation/room pointer
                isGroup: isGroup
            };

            // Assuming optimistic local update for better UX
            // const localMessage = {
            //     id: Date.now().toString() + "_temp",
            //     text: message,
            //     sender: 'me',
            //     time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            // };
            // setMessages(prev => [...prev, localMessage]);
            setMessage('');

            if (socket) {
                socket.emit("sendMessage", messageData, (response) => {
                    if (response.status === "error") {
                        console.error("Failed to send message:", response.error);
                        // Optional: remove local optimistically added message here
                    } else if (response.status === "ok") {
                        // The server successfully processed the sent message.
                        // We rely on the newMessage socket callback to update chat for everyone else.
                        // Typically, you might want to replace the local temp ID with the real ID from DB!
                    }
                });
            } else {
                console.warn("Socket is null. Trying to send without active connection.");
            }
        }
    };

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
                        source={{ uri: isGroup ? 'https://i.pravatar.cc/150?img=21' :  (sender?.avatar ? process.env.EXPO_PUBLIC_BACKEND_URL+sender?.avatar : 'https://i.pravatar.cc/150?img=11') }} 
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-white">{isGroup ? 'Group Chat' : (sender?.username ? sender?.username : 'Chat')}</Text>
                        <Text 
                            className="text-xs font-semibold"
                            style={{ color: isGroup ? colors.neutral300 : (onlineUsers.includes(Number(id)) ? colors.green : colors.neutral400) }}
                        >
                            {isGroup ? 'Group Chat' : (onlineUsers.includes(Number(id)) ? 'Online' : 'Offline')}
                        </Text>
                    </View>
                    
                    <TouchableOpacity className="ml-2">
                        <Ionicons name="call" size={22} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity className="ml-4">
                        <Ionicons name="videocam" size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Chat Area */}
                <View className="flex-1 bg-neutral-50 rounded-t-3xl overflow-hidden pt-4">
                    <FlatList
                        data={messages}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
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
                                placeholder="Message..."
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
                            disabled={message.trim().length === 0}
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

export default ChatInterface;
