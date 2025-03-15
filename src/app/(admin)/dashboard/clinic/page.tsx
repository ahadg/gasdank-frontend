import { Col, Row } from 'react-bootstrap'
import AppointmentCard from './components/AppointmentCard'
import Calendar from './components/Calendar'
import ClinicPageTitle from './components/ClinicPageTitle'
import GenderChart from './components/GenderChart'
import PatientsChart from './components/PatientsChart'
import Stat from './components/Stat'
import TopDoctors from './components/TopDoctors'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = { title: 'Clinic' }

const ClinicPage = () => {
  return (
    <>
      <ClinicPageTitle />
      <Stat />
      <Row>
        <Calendar />
        <PatientsChart />
      </Row>
      <Row>
        <TopDoctors />
        <GenderChart />
      </Row>
      <Row>
        <Col xs={12}>
          <AppointmentCard />
        </Col>
      </Row>
    </>

  )
}

export default ClinicPage
