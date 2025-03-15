import PageTitle from '@/components/PageTitle'
import AllDataTable from './components/AllDataTable'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Grid Js Tables' }

const GridJs = async () => {

  return (
    <>
      <PageTitle title="Grid Js Tables" subTitle="Tables" />
      <AllDataTable />
    </>
  )
}

export default GridJs