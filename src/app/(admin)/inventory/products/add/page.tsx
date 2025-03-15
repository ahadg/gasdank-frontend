import PageTitle from "@/components/PageTitle"
import AddProducts from "./components/AddProducts"
import { Metadata } from "next"

export const metadata: Metadata = { title: 'Add Patients' }

const AddProductsPage = () => {
  return (
    <>
      {/* <PageTitle title='Add Patients' subTitle="Hospital" /> */}
      <AddProducts />
    </>
  )
}

export default AddProductsPage