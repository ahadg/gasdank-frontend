import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Button, Card, CardBody, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { tablerIconData } from './data'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tabler Icons' }

const TablerIcon = () => {
  return (
    <>
      <PageTitle title="Tabler Icons" subTitle="Icons" />
      <div className="d-flex flex-wrap gap-3 justify-content-center icon-box mb-3">
        {
          tablerIconData.map((item, idx) => (
            <OverlayTrigger key={idx} placement="top" overlay={<Tooltip>{item}</Tooltip>}>
              <Card key={idx}>
                <CardBody>
                  <IconifyIcon icon={item} className="fs-2" />
                </CardBody>
              </Card>
            </OverlayTrigger>
          ))
        }
      </div>
      <div className="text-center">
        <Button variant="danger" href="https://tabler.io/icons" target="_blank">View All Icons</Button>
      </div>

    </>
  )
}

export default TablerIcon