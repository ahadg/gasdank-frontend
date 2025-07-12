"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import Image from 'next/image'
import { timeSince } from '@/utils/date'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'
import { useRouter } from 'next/navigation'

interface NotificationResponse {
  notifications: NotificationType[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    unreadCount: number;
  };
}

interface NotificationType {
  _id: string;
  user_id: string;
  actorId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  type: string;
  message: string;
  isRead: boolean;
  activityId?: string;
  createdAt: string;
  updated_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const router = useRouter()
  const dropdownRef = useRef<any>(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user?._id) return;
    console.log("pi/notifications",`/api/notification/${user._id}?limit=20`)
    setLoading(true);
    try {
      const response = await api.get(`/api/notification/${user._id}?limit=20`);
      const data: NotificationResponse = await response.data;
      
      setNotifications(data.notifications);
      setUnreadCount(data.pagination.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/notification/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?._id) return;
    
    try {
      await api.put(`/api/notification/${user._id}/mark-all-read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const dismissNotification = async (notificationId: string) => {
    try {
      await api.delete(`/api/notification/${notificationId}`);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      // Update unread count if it was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!user?._id) return;
    
    try {
      await api.delete(`/api/notification/${user._id}/delete-all`);
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  // Close dropdown programmatically
  const closeDropdown = () => {
    // Method 1: Try Bootstrap API if available
    if (typeof window !== 'undefined' && (window as any).bootstrap?.Dropdown && dropdownRef.current) {
      try {
        const dropdownElement = dropdownRef.current;
        const bootstrapDropdown = new (window as any).bootstrap.Dropdown(dropdownElement);
        bootstrapDropdown.hide();
      } catch (error) {
        console.log('Bootstrap dropdown hide failed:', error);
      }
    }
    
    // Method 2: Simulate click outside dropdown
    try {
      // Find and click the backdrop or body to close dropdown
      const backdrop = document.querySelector('.dropdown-backdrop');
      if (backdrop) {
        (backdrop as HTMLElement).click();
      } else {
        // Alternative: dispatch ESC key to close dropdown
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }
    } catch (error) {
      console.log('Manual dropdown close failed:', error);
    }
    
    // Always update state
    setIsOpen(false);
  };

  // Handle notification click - mark as read automatically
  const handleNotificationClick = async (notification: NotificationType) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Close dropdown first
    setIsOpen(false);
    
    // Small delay to ensure dropdown closes before navigation
    setTimeout(() => {
      // Handle navigation based on notification type
      switch (notification.type) {
        case "product":
          router.push('/inventory/products');
          break;
          
        case "sample_viewing_assigned":
          router.push('/dashboard/sampleviewingworker');
          break;
        
        case "product_low_quantity":
          router.push('/inventory/products');
          break;
          
        case "order":
        case "new_order":
          router.push('/orders');
          break;
          
        case "user":
        case "new_user":
          router.push('/users');
          break;
          
        case "activity":
          // If there's an activityId, navigate to specific activity
          if (notification.activityId) {
            router.push(`/activities/${notification.activityId}`);
          } else {
            router.push('/activities');
          }
          break;
          
        case "message":
        case "chat":
          router.push('/messages');
          break;
          
        case "report":
          router.push('/reports');
          break;
          
        case "system":
        case "announcement":
          router.push('/settings');
          break;
          
        default:
          console.log('Unknown notification type:', notification.type);
          router.push('/dashboard/sales');
          break;
      }
    }, 150);
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (isOpen) {
      fetchNotifications(); // Refresh notifications when dropdown opens
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    console.log("step_1")
    if (user?._id) {
      console.log("step_2")
      fetchNotifications();
    }
  }, [user?._id]); // Fixed dependency - was user?.id, should be user?._id

  return (
    <div className="topbar-item">
    <Dropdown ref={dropdownRef} align={'end'} onToggle={handleDropdownToggle} show={isOpen}>
      <DropdownToggle 
        as={'a'} 
        className="topbar-link drop-arrow-none position-relative" 
        data-bs-toggle="dropdown" 
        data-bs-offset="0,25" 
        aria-haspopup="false" 
        aria-expanded="false"
      >
        <IconifyIcon icon='tabler:bell' className="animate-ring fs-22" />
        {unreadCount > 0 && (
          <span className="position-absolute badge rounded-pill bg-danger" style={{
            top: '-4px',
            right: '-8px',
            fontSize: '10px',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </DropdownToggle>
      
      <DropdownMenu className="p-0 dropdown-menu-start dropdown-menu-lg" style={{ minHeight: 300 }}>
        <div className="p-3 border-bottom border-dashed">
          <Row className="align-items-center">
            <Col>
              <h6 className="m-0 fs-16 fw-semibold">
                Notifications
                {unreadCount > 0 && (
                  <span className="badge bg-danger ms-2">{unreadCount}</span>
                )}
              </h6>
            </Col>
            <Col xs={'auto'}>
              <Dropdown>
                <DropdownToggle 
                  as={'a'} 
                  className="drop-arrow-none link-dark" 
                  data-bs-toggle="dropdown" 
                  data-bs-offset="0,15" 
                  aria-expanded="false"
                >
                  <IconifyIcon icon='tabler:settings' className="fs-22 align-middle" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem onClick={markAllAsRead}>
                    Mark as Read
                  </DropdownItem>
                  {/* <DropdownItem onClick={deleteAllNotifications}>
                    Delete All
                  </DropdownItem>
                  <DropdownItem>Do not Disturb</DropdownItem>
                  <DropdownItem>Other Settings</DropdownItem> */}
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>
        </div>
        
        <SimplebarReactClient 
          className="position-relative z-2 card shadow-none rounded-0" 
          style={{ maxHeight: 300 }}
        >
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <div 
                className={`notification-item dropdown-item py-2 text-wrap ${!item.isRead ? 'bg-light' : ''}`}
                key={item._id}
                onClick={() => handleNotificationClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <span className="d-flex align-items-center">
                  {item.actorId?.avatar ? (
                    <span className="me-3 position-relative flex-shrink-0">
                      <Image 
                        src={item.actorId.avatar} 
                        className="avatar-md rounded-circle" 
                        alt={item.actorId.name}
                        width={40}
                        height={40}
                      />
                      {!item.isRead && (
                        <span className="position-absolute rounded-pill bg-primary notification-badge">
                          <span className="visually-hidden">unread</span>
                        </span>
                      )}
                    </span>
                  ) : (
                    <div className="avatar-md flex-shrink-0 me-3">
                      <span className={`avatar-title bg-primary-subtle text-primary rounded-circle fs-22`}>
                        <IconifyIcon icon="tabler:bell" />
                      </span>
                    </div>
                  )}
  
                  <span className="flex-grow-1 text-muted">
                    <div className={`${!item.isRead ? 'fw-semibold text-dark' : ''}`}>
                      {item.message || `${item.actorId?.name || 'Someone'} ${item.type}`}
                    </div>
                    <span className="fs-12">{timeSince(new Date(item.createdAt))}</span>
                  </span>
                  
                  <span className="notification-item-close">
                    <button 
                      type="button" 
                      className="btn btn-ghost-danger rounded-circle btn-sm btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(item._id);
                      }}
                    >
                      <IconifyIcon icon='tabler:x' className="fs-16" />
                    </button>
                  </span>
                </span>
              </div>
            ))
          ) : null}
        </SimplebarReactClient>
        
        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div 
            style={{ height: 300 }} 
            className="d-flex align-items-center justify-content-center text-center position-absolute top-0 bottom-0 start-0 end-0 z-1"
          >
            <div>
              <IconifyIcon 
                icon="line-md:bell-twotone-alert-loop" 
                className="fs-80 text-secondary mt-2" 
              />
              <h4 className="fw-semibold mb-0 fst-italic lh-base mt-3">
                Hey! 👋 <br />You have no notifications
              </h4>
            </div>
          </div>
        )}
      </DropdownMenu>
    </Dropdown>
  </div>
  )
}

export default Notifications