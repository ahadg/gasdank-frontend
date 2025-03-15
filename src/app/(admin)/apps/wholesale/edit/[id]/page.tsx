import PageTitle from '@/components/PageTitle'
import AccountEdit from '../../components/AccountEdit'
import { Card } from 'react-bootstrap'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inbox' }

const EmailPage = () => {
  return (
    <div>
      <PageTitle title='Account History' />
      <AccountEdit />
    </div>
  )
}

export default EmailPage