import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMessagesForUser, subscribeToMessagesForUser, getMessagesBetween, sendMessage as sendMessageApi, getProfile } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  MessageSquare,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Image,
  File,
  Check,
  CheckCheck,
} from "lucide-react";

interface Conversation {
  id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
  participant_id: string;
}

interface DisplayMessage {
  id: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type: "text" | "image" | "file";
  file_url?: string;
  file_name?: string;
  file_type?: string;
}

export function Messages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageChannelRef = useRef<any>(null);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    loadConversations();

    // Check for contact parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const contactId = urlParams.get('contact');
    if (contactId) {
      setSelectedConversation(contactId);
      // Clean up URL
      window.history.replaceState({}, '', '/messages');
    }

    // subscribe to realtime messages
    const channel = subscribeToMessagesForUser(profile.id, (payload) => {
      console.log('Realtime message update:', payload);
      const newMsg = payload.new;
      
      if (payload.eventType === 'INSERT' && newMsg) {
        // Real-time message received
        if (selectedConversation && 
            (newMsg.sender_id === selectedConversation || newMsg.receiver_id === selectedConversation)) {
          // Add to current conversation
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              sender_id: newMsg.sender_id,
              receiver_id: newMsg.receiver_id,
              content: newMsg.content,
              created_at: newMsg.created_at || new Date().toISOString(),
              is_read: newMsg.is_read,
              message_type: newMsg.file_url ? (newMsg.file_type?.startsWith('image/') ? 'image' : 'file') : 'text',
              file_url: newMsg.file_url,
              file_name: newMsg.file_name,
              file_type: newMsg.file_type,
            }];
          });

          // Mark as read if it's from the other user
          if (newMsg.sender_id !== profile.id) {
            setTimeout(() => markConversationAsRead(selectedConversation), 500);
          }
        }

        // Update conversations list
        loadConversations();

        // Simulate typing indicator stop
        if (newMsg.sender_id !== profile.id) {
          setOtherUserTyping(false);
        }
      }
    });

    messageChannelRef.current = channel;

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Messages page safety timeout reached, setting loading to false');
      setLoading(false);
    }, 3000); // 3 seconds

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        console.log('Error unsubscribing from messages channel:', err);
      }
      clearTimeout(timeout);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [profile]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!profile) return;

    try {
      const msgs = await getMessagesForUser(profile.id);

      // Build conversation list by deduping counterpart user or project
      const map = new Map<string, Conversation>();
      const profileCache = new Map<string, any>();

      for (const m of msgs) {
        // determine conversation id: prefer project_id, otherwise counterpart user id
        const participantId = m.sender_id === profile.id ? m.receiver_id || '' : m.sender_id;
        const convId = m.project_id || participantId;
        if (!convId) continue;

        const existing = map.get(convId);
        const last_message_time = m.created_at || new Date().toISOString();
        const last_message = m.content;
        const unread_count = existing 
          ? existing.unread_count + (m.is_read || m.sender_id === profile.id ? 0 : 1)
          : (m.is_read || m.sender_id === profile.id ? 0 : 1);

        // Try to fetch participant name
        let participantName = participantId;
        if (participantId && !profileCache.has(participantId)) {
          try {
            const participantProfile = await getProfile(participantId);
            if (participantProfile) {
              profileCache.set(participantId, participantProfile);
              participantName = participantProfile.full_name || participantId;
            }
          } catch (err) {
            console.error('Error fetching participant profile:', err);
          }
        } else if (profileCache.has(participantId)) {
          const cached = profileCache.get(participantId);
          participantName = cached.full_name || participantId;
        }

        if (!existing || new Date(last_message_time) > new Date(existing.last_message_time)) {
          map.set(convId, {
            id: convId,
            participant_id: participantId,
            participant_name: participantName,
            participant_avatar: undefined,
            last_message,
            last_message_time,
            unread_count,
            is_online: Math.random() > 0.5, // Simulated online status - implement with presence
          });
        }
      }

      setConversations(Array.from(map.values()).sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      ));
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!profile) return;
    try {
      // If conversationId looks like a uuid project id, try project-based messages first
      const msgs = await getMessagesBetween(profile.id, conversationId);
      setMessages(msgs.map((m) => ({
        id: m.id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        content: m.content,
        created_at: m.created_at || new Date().toISOString(),
        is_read: m.is_read,
        message_type: m.file_url ? (m.file_type?.startsWith('image/') ? 'image' : 'file') : 'text',
        file_url: m.file_url,
        file_name: m.file_name,
        file_type: m.file_type,
      })));

      // Mark messages as read
      setTimeout(() => {
        markConversationAsRead(conversationId);
      }, 1000);
    } catch (err) {
      console.error('loadMessages error', err);
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !profile) return;

    const messageToSend = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    setIsTyping(false);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Create optimistic message
    const optimisticMessage: DisplayMessage = {
      id: `temp-${Date.now()}`,
      sender_id: profile.id,
      receiver_id: selectedConversation,
      content: messageToSend,
      created_at: new Date().toISOString(),
      is_read: false,
      message_type: 'text',
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const msg = await sendMessageApi({
        sender_id: profile.id,
        receiver_id: selectedConversation,
        project_id: undefined,
        content: messageToSend,
        is_read: false,
      });

      if (msg) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? {
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            content: msg.content,
            created_at: msg.created_at || new Date().toISOString(),
            is_read: msg.is_read,
            message_type: msg.file_url ? (msg.file_type?.startsWith('image/') ? 'image' : 'file') : 'text',
            file_url: msg.file_url,
            file_name: msg.file_name,
            file_type: msg.file_type,
          } : m))
        );

        // Update conversation list to show latest message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  last_message: messageToSend,
                  last_message_time: new Date().toISOString(),
                }
              : conv
          ).sort((a, b) => 
            new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
          )
        );
      }
    } catch (err) {
      console.error('sendMessage error', err);
      // Remove optimistic message and restore input
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setNewMessage(messageToSend);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    } else {
      setIsTyping(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.participant_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedConversationData = conversations.find(
    (c) => c.id === selectedConversation
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id
                    ? "bg-purple-50 border-r-4 border-r-purple-600"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.participant_name.charAt(0)}
                    </div>
                    {conversation.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.participant_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          conversation.last_message_time
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {conversation.last_message}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversationData?.participant_name.charAt(0)}
                  </div>
                  {selectedConversationData?.is_online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversationData?.participant_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversationData?.is_online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === profile?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      message.sender_id === profile?.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    } rounded-2xl overflow-hidden shadow-sm`}
                  >
                    {message.message_type === 'image' && message.file_url ? (
                      <div>
                        <img 
                          src={message.file_url} 
                          alt={message.file_name || 'Image'} 
                          className="w-full h-auto max-w-sm"
                        />
                        {message.content && (
                          <p className="px-4 py-2 text-sm">{message.content}</p>
                        )}
                      </div>
                    ) : message.message_type === 'file' && message.file_url ? (
                      <div className="px-4 py-2">
                        <a 
                          href={message.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 hover:underline"
                        >
                          <File className="w-5 h-5" />
                          <span className="text-sm">{message.file_name || 'File'}</span>
                        </a>
                        {message.content && (
                          <p className="text-sm mt-2">{message.content}</p>
                        )}
                      </div>
                    ) : (
                      <p className="px-4 py-2 text-sm">{message.content}</p>
                    )}
                    <div className="flex items-center justify-between px-4 pb-2">
                      <p
                        className={`text-xs ${
                          message.sender_id === profile?.id
                            ? "text-purple-200"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {message.sender_id === profile?.id && (
                        <div className="flex items-center">
                          {message.is_read ? (
                            <CheckCheck className="w-4 h-4 text-purple-200" />
                          ) : (
                            <Check className="w-4 h-4 text-purple-200" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {isTyping && (
                <div className="text-xs text-gray-500 mb-2 px-2">
                  Typing...
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" title="Attach file">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" title="Attach image">
                  <Image className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="rounded-full"
                  />
                </div>
                <Button variant="outline" size="sm" title="Add emoji">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
