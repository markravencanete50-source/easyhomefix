// ============================================================
// easyhomefix — Communication Center
// Ticket-based messaging between tenants, managers, contractors
// ============================================================

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_TICKETS, MOCK_MESSAGES } from '@/lib/mockData';
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_ICONS, timeAgo, formatDate } from '@/lib/utils';
import type { MaintenanceTicket, Message } from '@/types';
import {
  MessageSquare, Send, Search, AlertTriangle, Paperclip, Image as ImageIcon,
  CheckCheck, Check, Clock,
} from 'lucide-react';

export default function Messages() {
  const { currentUser } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(MOCK_TICKETS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ticketMessages = messages.filter(m => m.ticketId === selectedTicket?.id);

  const filteredTickets = MOCK_TICKETS.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketMessages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedTicket || !currentUser) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      ticketId: selectedTicket.id,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'You',
      senderRole: currentUser.role,
      content: newMessage.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = (ticketId: string) =>
    messages.filter(m => m.ticketId === ticketId && !m.isRead && m.senderId !== currentUser?.uid).length;

  return (
    <DashboardLayout
      title="Messages"
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Messages' }]}
    >
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Ticket List Sidebar */}
        <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {filteredTickets.map(ticket => {
                const lastMsg = messages.filter(m => m.ticketId === ticket.id).slice(-1)[0];
                const unread = unreadCount(ticket.id);
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="text-lg shrink-0 mt-0.5">{CATEGORY_ICONS[ticket.category]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-mono text-primary/80 shrink-0">{ticket.ticketNumber}</span>
                          {unread > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0 h-4 shrink-0">
                              {unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-medium text-foreground truncate mt-0.5">{ticket.title}</p>
                        {lastMsg && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg.content}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className={`status-badge text-xs ${STATUS_COLORS[ticket.status]}`}>
                            {STATUS_LABELS[ticket.status]}
                          </span>
                          {lastMsg && (
                            <span className="text-xs text-muted-foreground/60">{timeAgo(lastMsg.createdAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedTicket ? (
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{CATEGORY_ICONS[selectedTicket.category]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="ticket-number text-primary text-xs">{selectedTicket.ticketNumber}</span>
                        {selectedTicket.isEmergency && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                        <span className={`status-badge ${STATUS_COLORS[selectedTicket.status]}`}>
                          {STATUS_LABELS[selectedTicket.status]}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{selectedTicket.title}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{selectedTicket.tenantName}</p>
                    <p>{selectedTicket.propertyName}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {ticketMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
                    </div>
                  ) : (
                    ticketMessages.map((msg, i) => {
                      const isOwn = msg.senderId === currentUser?.uid;
                      const showAvatar = i === 0 || ticketMessages[i - 1].senderId !== msg.senderId;
                      return (
                        <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {showAvatar ? (
                            <Avatar className="w-7 h-7 shrink-0 mt-1">
                              <AvatarFallback className={`text-xs font-bold ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-7 shrink-0" />
                          )}
                          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            {showAvatar && (
                              <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <span className="text-xs font-medium text-foreground">{msg.senderName}</span>
                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 capitalize">
                                  {msg.senderRole.replace('_', ' ')}
                                </Badge>
                              </div>
                            )}
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                  : 'bg-muted text-foreground rounded-tl-sm'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                              <span className="text-xs text-muted-foreground/60">{timeAgo(msg.createdAt)}</span>
                              {isOwn && (
                                msg.isRead
                                  ? <CheckCheck className="w-3 h-3 text-primary" />
                                  : <Check className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t border-border bg-card/80 backdrop-blur-sm">
                <div className="flex items-end gap-2 max-w-2xl mx-auto">
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pr-10 h-9 text-sm"
                    />
                  </div>
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/60 text-center mt-1.5">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a ticket to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
