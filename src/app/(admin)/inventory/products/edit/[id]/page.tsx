import PageTitle from "@/components/PageTitle"
import EditProducts from "../components/EditProducts"
import { Metadata } from "next"

export const metadata: Metadata = { title: 'Add Patients' }

const EditProductsPage = () => {
  return (
    <>
      {/* <PageTitle title='Add Patients' subTitle="Hospital" /> */}
      <EditProducts />
    </>
  )
}

export default EditProductsPage