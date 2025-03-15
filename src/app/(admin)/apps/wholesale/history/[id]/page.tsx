import PageTitle from '@/components/PageTitle'
import AccountHistory from '../../components/AccountHistory'
import { Card } from 'react-bootstrap'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inbox' }

const EmailPage = () => {
  return (
    <div>
      <AccountHistory />
    </div>
  )
}

export default EmailPage