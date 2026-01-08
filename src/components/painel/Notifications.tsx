import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, UserPlus, Check } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Notification {
  id: number;
  type: 'new_lead' | 'new_registration';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsProps {
  userEmail: string;
  onNavigate: (path: string) => void;
}

const Notifications = ({ userEmail, onNavigate }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get(`/api/notifications?email=${encodeURIComponent(userEmail)}`);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await apiClient.post(`/api/notifications/${notification.id}/read`, {
          email: userEmail
        });

        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.type === 'new_lead') {
      onNavigate('/painel?tab=primeirinho');
    } else if (notification.type === 'new_registration') {
      onNavigate('/painel?tab=inscricoes');
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.post('/api/notifications/read-all', {
        email: userEmail
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_lead':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      case 'new_registration':
        return <Users className="w-4 h-4 text-green-400" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-soft-white hover:bg-neon-purple/10 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-dark-bg border-neon-purple/30 text-soft-white"
      >
        <div className="p-3 border-b border-neon-purple/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-text-gray hover:text-soft-white"
              >
                <Check className="w-3 h-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-text-gray text-sm">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 cursor-pointer hover:bg-neon-purple/10 ${
                  !notification.isRead ? 'bg-neon-purple/5' : ''
                }`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.isRead ? 'text-soft-white' : 'text-text-gray'
                      }`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-text-gray ml-2">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    <p className={`text-xs mt-1 ${
                      !notification.isRead ? 'text-soft-white' : 'text-text-gray'
                    }`}>
                      {notification.message}
                    </p>

                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-neon-purple rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-neon-purple/20" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onNavigate('/painel?tab=notifications');
                  setIsOpen(false);
                }}
                className="w-full text-xs text-text-gray hover:text-soft-white"
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
