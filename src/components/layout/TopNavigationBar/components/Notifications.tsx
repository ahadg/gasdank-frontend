"use client"
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import Image from 'next/image'
import { timeSince } from '@/utils/date'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import api from '@/utils/axiosInstance'

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
      await api.put(`/api/notification/${notificationId}/read`, 
      //   {
      //   method: 'PUT',
      // }
    );
      
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
    if (!user?.id) return;
    
    try {
      await api.put(`/api/notification/${user.id}/mark-all-read`, {
        method: 'PUT',
      });
      
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
      await api.delete(`/api/notification/${notificationId}`, {
        method: 'DELETE',
      });
      
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
    if (!user?.id) return;
    
    try {
      await api.delete(`/api/notification/${user.id}/delete-all`, {
        method: 'DELETE',
      });
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  // Handle notification click - mark as read automatically
  const handleNotificationClick = (notification: NotificationType) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    // Add any additional click handling here (e.g., navigation)
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
  }, [user?.id]);

  return (
    <div className="topbar-item">
      <Dropdown align={'end'} onToggle={handleDropdownToggle}>
        <DropdownToggle 
          as={'a'} 
          className="topbar-link drop-arrow-none" 
          data-bs-toggle="dropdown" 
          data-bs-offset="0,25" 
          data-bs-auto-close="outside" 
          aria-haspopup="false" 
          aria-expanded="false"
        >
          <IconifyIcon icon='tabler:bell' className="animate-ring fs-22" />
          {unreadCount > 0 && (
            <span className="noti-icon-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
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
                    <DropdownItem onClick={deleteAllNotifications}>
                      Delete All
                    </DropdownItem>
                    <DropdownItem>Do not Disturb</DropdownItem>
                    <DropdownItem>Other Settings</DropdownItem>
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
          
          {/* {notifications.length > 0 && (
            <Link 
              href="/notifications" 
              className="dropdown-item notification-item position-fixed z-2 bottom-0 text-center text-reset text-decoration-underline link-offset-2 fw-bold notify-item border-top border-light py-2"
            >
              View All
            </Link>
          )} */}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default Notifications