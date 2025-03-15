import PageTitle from '@/components/PageTitle'
import type { Metadata } from 'next'
import { Row } from 'react-bootstrap'
import CalendarPage from './components/CalendarPage'

export const metadata: Metadata = { title: 'Calender' }

const Schedule = () => {
  return (
    <>
      <PageTitle title='Calendar' />
      <Row>
        <CalendarPage />
      </Row>
    </>
  )
}

export default Schedule
