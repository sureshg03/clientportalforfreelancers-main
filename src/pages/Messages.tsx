import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMessagesForUser, subscribeToMessagesForUser, getMessagesBetween, sendMessage as sendMessageApi } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  MessageSquare,
  Send,
  Search,
  User,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Image,
  File,
} from "lucide-react";

interface Conversation {
  id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type: "text" | "image" | "file";
}

export function Messages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      loadConversations();
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Messages page safety timeout reached, setting loading to false');
      setLoading(false);
    }, 10000); // 10 seconds

    return () => {
      try {
        channel.unsubscribe();
      } catch (err) {
        console.log('Error unsubscribing from messages channel:', err);
      }
      clearTimeout(timeout);
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
      for (const m of msgs) {
        // determine conversation id: prefer project_id, otherwise counterpart user id
        const convId = m.project_id || (m.sender_id === profile.id ? m.receiver_id || '' : m.sender_id);
        if (!convId) continue;
        const existing = map.get(convId);
        const participantName = convId; // placeholder; frontend can fetch profile for nicer name
        const last_message_time = m.created_at || new Date().toISOString();
        const last_message = m.content;
        const unread_count = existing ? existing.unread_count : (m.is_read ? 0 : 1);
        map.set(convId, {
          id: convId,
          participant_name: participantName,
          participant_avatar: undefined,
          last_message,
          last_message_time,
          unread_count,
          is_online: false,
        });
      }

      setConversations(Array.from(map.values()));
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
        content: m.content,
        created_at: m.created_at || new Date().toISOString(),
        is_read: m.is_read,
        message_type: 'text',
      })));
    } catch (err) {
      console.error('loadMessages error', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !profile) return;

    const messageToSend = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      const msg = await sendMessageApi({
        sender_id: profile.id,
        receiver_id: selectedConversation,
        project_id: undefined,
        content: messageToSend,
      });

      if (msg) {
        // Add message to local state immediately for instant UI update
        const newMessageObj = {
          id: msg.id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at || new Date().toISOString(),
          is_read: msg.is_read,
          message_type: 'text' as const,
        };

        setMessages((prev) => [...prev, newMessageObj]);

        // Update conversation list to show latest message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  last_message: messageToSend,
                  last_message_time: new Date().toISOString(),
                  unread_count: 0, // Since we're sending, no unread for us
                }
              : conv
          )
        );
      }
    } catch (err) {
      console.error('sendMessage error', err);
      // Restore the message if sending failed
      setNewMessage(messageToSend);
      // Could add a toast notification here
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
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender_id === profile?.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
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
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Image className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="rounded-full"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="rounded-full"
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
