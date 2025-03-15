import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import AppointmentCard from './components/AppointmentCard'
import AppointmentListCard from './components/AppointmentListCard'
import PersonalInformation from './components/PersonalInformation'
import ProfileCard from './components/ProfileCard'
import SkillsChart from './components/SkillsChart'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile' }

const DoctorsDetailsPage = () => {
  return (
    <>
      <PageTitle title="Doctor Profile" subTitle="Hospital" />
      <Row>
        <Col xl={4} lg={12}>
          <ProfileCard />
          <AppointmentCard />
        </Col>
        <Col xl={8} lg={12}>
          <PersonalInformation />
          <SkillsChart />
          <Row>
            <Col lg={12}>
              <AppointmentListCard />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default DoctorsDetailsPage