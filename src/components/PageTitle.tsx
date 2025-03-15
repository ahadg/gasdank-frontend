import Link from 'next/link';
import IconifyIcon from './wrappers/IconifyIcon';

const PageTitle = ({ title, subTitle }: { title: string; subTitle?: string }) => {
  return (
    <div className="page-title-head d-flex align-items-sm-center flex-sm-row flex-column gap-2">
      <div className="flex-grow-1">
        <h4 className="fs-18 fw-semibold mb-0">{title}</h4>
      </div>
     
    </div>

  )
}

export default PageTitle
