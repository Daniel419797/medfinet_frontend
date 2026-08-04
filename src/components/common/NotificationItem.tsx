import { Bell, FileText, Shield } from 'lucide-react';
import { Notification } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'vaccination':
        return <Shield className="h-5 w-5 text-primary-500" />;
      case 'invoice':
        return <FileText className="h-5 w-5 text-secondary-500" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-500" />;
    }
  };

  return (
    <div 
      className={`p-4 border-b border-neutral-200 ${notification.read ? 'bg-white' : 'bg-primary-50'} hover:bg-neutral-50 transition-colors duration-150`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-neutral-900 truncate">{notification.title}</h4>
          <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
          <div className="mt-2 text-xs text-neutral-500">
            {formatDistanceToNow(new Date(notification.date))} ago
          </div>
        </div>
        {!notification.read && (
          <div className="ml-3 flex-shrink-0">
            <span className="inline-block h-2 w-2 rounded-full bg-primary-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;