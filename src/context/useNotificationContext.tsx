import { createContext, useContext, useState } from 'react'
import { ToastBody, ToastHeader } from 'react-bootstrap'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { BootstrapVariantType, ChildrenType } from '../types/component-props'


type ShowNotificationType = {
  title?: string
  message: string
  variant?: BootstrapVariantType
  delay?: number
  autohide?: boolean
}

type ToastrProps = {
  show: boolean
  onClose?: () => void
} & ShowNotificationType

type NotificationContextType = {
  showNotification: (config: ShowNotificationType) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

function Toastr({ show, title, message, onClose, variant = 'light', delay, autohide = true }: Readonly<ToastrProps>) {
  return (
    <ToastContainer className="p-3 position-fixed" position="top-end" style={{ zIndex: 9999 }}>
      <Toast bg={variant} delay={delay} show={show} onClose={onClose} autohide={autohide}>
        <ToastBody className={['dark', 'danger', 'success', 'primary'].includes(variant) ? 'text-white' : ''}>
          {message}
        </ToastBody>
      </Toast>
    </ToastContainer>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within an NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: ChildrenType) {
  const defaultConfig = {
    show: false,
    message: '',
    title: '',
    delay: 2000,
  }

  const [config, setConfig] = useState<ToastrProps>(defaultConfig)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const hideNotification = () => {
    setConfig(prev => ({ ...prev, show: false }))
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }

  const showNotification = ({ title, message, variant, delay, autohide }: ShowNotificationType) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const isDanger = variant === 'danger'
    const finalAutoHide = autohide ?? !isDanger // Danger notifications don't autohide by default
    const finalDelay = delay ?? (isDanger ? 10000 : 3000)

    setConfig({
      show: true,
      title,
      message,
      variant: variant ?? 'light',
      onClose: hideNotification,
      delay: finalDelay,
      autohide: finalAutoHide
    })

    if (finalAutoHide) {
      const id = setTimeout(() => {
        setConfig(prev => ({ ...prev, show: false }))
        setTimeoutId(null)
      }, finalDelay)
      setTimeoutId(id)
    }
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <Toastr {...config} />
      {children}
    </NotificationContext.Provider>
  )
}
