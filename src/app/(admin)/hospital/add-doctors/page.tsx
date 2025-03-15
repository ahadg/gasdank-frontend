import PageTitle from '@/components/PageTitle'
import AddDoctors from './components/AddDoctors'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Doctor' }

const AddDoctorsPage = () => {

  return (
    <>
      <PageTitle title='Add Doctors' subTitle="Hospital" />
      <AddDoctors />
    </>

  )
}

export default AddDoctorsPage