import PageTitle from "@/components/PageTitle"
import { Metadata } from "next"
import FIleManager from "./components/FIleManager"


export const metadata: Metadata = { title: 'File Manager' }

const FileManagerPage = () => {
  return (
    <>
      <PageTitle title='File Manager' subTitle="Apps" />
      <FIleManager />
    </>

  )
}

export default FileManagerPage