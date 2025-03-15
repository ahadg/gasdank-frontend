import PageTitle from "@/components/PageTitle"
import AddPatients from "./components/AddPatients"
import { Metadata } from "next"

export const metadata: Metadata = { title: 'Add Patients' }

const AddPatientsPage = () => {
  return (
    <>
      <PageTitle title='Add Patients' subTitle="Hospital" />
      <AddPatients />
    </>
  )
}

export default AddPatientsPage