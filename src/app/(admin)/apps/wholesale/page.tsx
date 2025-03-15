import PageTitle from '@/components/PageTitle'
import AccountsList from './components/AccountsList'
import { Card } from 'react-bootstrap'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inbox' }

const EmailPage = () => {
  return (
    <div>
      {/* <PageTitle title='Inbox' /> */}
      <AccountsList />
    </div>
  )
}

export default EmailPage