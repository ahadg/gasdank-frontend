import PageTitle from "@/components/PageTitle"
import { Col, Row } from "react-bootstrap"
import CheckUpFileCard from "./components/CheckUpFileCard"
import MedicalHistoryCard from "./components/MedicalHistoryCard"
import PatientDiet from "./components/PatientDiet"
import PatientInformationCard from "./components/PatientInformationCard"
import PatientProfile from "./components/PatientProfileCard"
import TreatmentHistoryCard from "./components/TreatmentHistoryCard"
import WaterChart from "./components/WaterChart"
import { Metadata } from "next"

export const metadata: Metadata = { title: 'Patients Details' }

const PatientsDetailsPage = () => {
  return (
    <>
      <PageTitle title='Patient Details' subTitle="Hospital" />
      <Row>
        <Col xl={4} lg={12}>
          <PatientProfile />
          <CheckUpFileCard />
          <WaterChart />
        </Col>
        <Col xl={8} lg={12}>
          <PatientInformationCard />
          <MedicalHistoryCard />
          <PatientDiet />
          <TreatmentHistoryCard />
        </Col>
      </Row>
    </>

  )
}

export default PatientsDetailsPage