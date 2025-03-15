import PageTitle from '@/components/PageTitle'

import AllInputmask from '@/app/(admin)/forms/inputmask/components/AllInputmask'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inputmask' }

const InputmaskPage = () => {
  return (
    <>
      <PageTitle title="Form Inputmask" subTitle="Forms" />
      <AllInputmask />
    </>
  )
}

export default InputmaskPage