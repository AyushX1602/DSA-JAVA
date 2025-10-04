import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { authUserAtom } from '@/lib/auth.atoms';
import {
  useCommunityMessages,
  useCreateCommunityMessage,
} from '@/hooks/react-query/use-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CommunityChat = () => {
  const [message, setMessage] = useState('');
  const user = useAtomValue(authUserAtom);
  const { data: messagesData, isLoading, error } = useCommunityMessages();
  const createMessage = useCreateCommunityMessage();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledUp = scrollTop + clientHeight < scrollHeight - 100;
    setShowScrollButton(isScrolledUp);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData?.messages?.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await createMessage.mutateAsync({ content: message.trim() });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading community messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">Failed to load community messages</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const messages = messagesData?.messages || [];

  return (
    <div className="container mx-auto px-4 pt-6 max-w-4xl h-[calc(100vh-120px)]">
      <Card className="flex flex-col h-full overflow-y-auto py-0">
        <CardHeader className="sticky top-0 bg-background z-10 border-b pb-0 py-6">
          <CardTitle className="flex items-center gap-2">
            <span>Community Chat</span>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages List */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scroll-smooth relative flex flex-col-reverse"
            onScroll={handleScroll}
          >
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No messages yet. Be the first to say something!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = user?.userId === msg.userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-6">
                        <AvatarFallback>
                          {msg.user.name
                            ? msg.user.name
                                .split(' ')
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join('')
                            : msg.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col ${
                        isCurrentUser ? 'items-end' : 'items-start'
                      } max-w-[70%]`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="font-medium text-sm">
                          {msg.user.name || msg.user.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <Alert
                        variant={isCurrentUser ? 'default' : 'destructive'}
                        className={`mt-1 ${
                          isCurrentUser
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-muted text-primary'
                        }`}
                      >
                        <AlertDescription className="text-sm break-words">
                          {msg.content}
                        </AlertDescription>
                      </Alert>
                    </div>
                    {isCurrentUser && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-6">
                        <AvatarFallback>
                          {msg.user.name
                            ? msg.user.name
                                .split(' ')
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join('')
                            : msg.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
            {/* <div ref={messagesEndRef} /> */}

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <Button
                onClick={scrollToBottom}
                size="sm"
                className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 shadow-lg"
                variant="secondary"
              >
                ↓
              </Button>
            )}
          </div>

          {/* Message Input */}
          <div className="sticky bottom-0 left-0 right-0 bg-background border-t px-6 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                maxLength={1000}
              />
              <Button
                type="submit"
                disabled={!message.trim() || createMessage.isPending}
                size="sm"
              >
                {createMessage.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityChat;
