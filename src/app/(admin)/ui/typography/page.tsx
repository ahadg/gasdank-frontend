import ComponentContainerCard from '@/components/ComponentContainerCard'
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'

export const metadata: Metadata = { title: 'Typography' }

const Typography = () => {
  return (
    <>
      <PageTitle title="Typography" subTitle='Base UI' />
      <div>
        <Row>
          <Col xs={12}>
            <ComponentContainerCard title='Display Headings' description={<>Traditional heading elements are designed to work best in the meat
              of your page content. When you need a heading to stand out, consider using a display
              heading—a larger, slightly more opinionated heading style.</>}>
              <h1 className="display-1">Display 1</h1>
              <p className="text-muted">Suspendisse vel quam malesuada, aliquet sem sit
                amet, fringilla elit. Morbi
                tempor tincidunt tempor. Etiam id turpis viverra, vulputate sapien
                nec,
                varius sem. Curabitur ullamcorper fringilla eleifend. In ut eros
                hendrerit
                est consequat posuere et at velit.</p>
              <div className="clearfix" />
              <h1 className="display-2">Display 2</h1>
              <p className="text-muted">In nec rhoncus eros. Vestibulum eu mattis nisl.
                Quisque viverra viverra magna
                nec pulvinar. Maecenas pellentesque porta augue, consectetur
                facilisis diam
                porttitor sed. Suspendisse tempor est sodales augue rutrum
                tincidunt.
                Quisque a malesuada purus.</p>
              <div className="clearfix" />
              <h1 className="display-3">Display 3</h1>
              <p className="text-muted">Vestibulum auctor tincidunt semper. Phasellus ut
                vulputate lacus. Suspendisse
                ultricies mi eros, sit amet tempor nulla varius sed. Proin nisl
                nisi,
                feugiat quis bibendum vitae, dapibus in tellus.</p>
              <div className="clearfix" />
              <h1 className="display-4">Display 4</h1>
              <p className="text-muted mb-0">Nulla et mattis nunc. Curabitur scelerisque
                commodo condimentum. Mauris
                blandit, velit a consectetur egestas, diam arcu fermentum justo,
                eget
                ultrices arcu eros vel erat.</p>
              <div className="clearfix" />
              <h1 className="display-5">Display 5</h1>
              <p className="text-muted mb-0">Nulla et mattis nunc. Curabitur scelerisque
                commodo condimentum. Mauris
                blandit, velit a consectetur egestas, diam arcu fermentum justo,
                eget.</p>
              <div className="clearfix" />
              <h1 className="display-6">Display 6</h1>
              <p className="text-muted mb-0">Nulla et mattis nunc. Curabitur scelerisque
                commodo condimentum. Mauris
                blandit, velit a consectetur egestas.</p>
            </ComponentContainerCard>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <ComponentContainerCard title='Headings' description={<>All HTML headings, <code>&lt;h1&gt;</code>&nbsp;through&nbsp;
              <code>&lt;h6&gt;</code>, are available. <code>.h1</code> through <code>.h6</code>&nbsp;
              classes are also available, for when you want to match the font styling of a heading
              but still want your text to be displayed inline.</>}>
              <h1>This is a Heading 1</h1>
              <p className="text-muted">Suspendisse vel quam malesuada, aliquet sem sit
                amet, fringilla elit. Morbi
                tempor tincidunt tempor. Etiam id turpis viverra, vulputate sapien
                nec,
                varius sem. Curabitur ullamcorper fringilla eleifend. In ut eros
                hendrerit
                est consequat posuere et at velit.</p>
              <div className="clearfix" />
              <h2>This is a Heading 2</h2>
              <p className="text-muted">In nec rhoncus eros. Vestibulum eu mattis nisl.
                Quisque viverra viverra magna
                nec pulvinar. Maecenas pellentesque porta augue, consectetur
                facilisis diam
                porttitor sed. Suspendisse tempor est sodales augue rutrum
                tincidunt.
                Quisque a malesuada purus.</p>
              <div className="clearfix" />
              <h3>This is a Heading 3</h3>
              <p className="text-muted">Vestibulum auctor tincidunt semper. Phasellus ut
                vulputate lacus. Suspendisse
                ultricies mi eros, sit amet tempor nulla varius sed. Proin nisl
                nisi,
                feugiat quis bibendum vitae, dapibus in tellus.</p>
              <div className="clearfix" />
              <h4>This is a Heading 4</h4>
              <p className="text-muted">Nulla et mattis nunc. Curabitur scelerisque
                commodo condimentum. Mauris
                blandit, velit a consectetur egestas, diam arcu fermentum justo,
                eget
                ultrices arcu eros vel erat.</p>
              <div className="clearfix" />
              <h5>This is a Heading 5</h5>
              <p className="text-muted">Quisque nec turpis at urna dictum luctus.
                Suspendisse convallis dignissim
                eros at volutpat. In egestas mattis dui. Aliquam mattis dictum
                aliquet.
                Nulla sapien mauris, eleifend et sem ac, commodo dapibus odio.
                Vivamus
                pretium nec odio cursus elementum. Suspendisse molestie ullamcorper
                ornare.</p>
              <div className="clearfix" />
              <h6>This is a Heading 6</h6>
              <p className="text-muted mb-0">Donec ultricies, lacus id tempor condimentum, orci
                leo faucibus sem, a
                molestie libero lectus ac justo. ultricies mi eros, sit amet tempor
                nulla
                varius sed. Proin nisl nisi, feugiat quis bibendum vitae, dapibus in
                tellus.</p>
            </ComponentContainerCard>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <ComponentContainerCard title='Inline Text Elements' description={<>Styling for common inline HTML5 elements.</>}>
              <p className="lead">
                Your title goes here
              </p>
              <p>You can use the mark tag to <mark>highlight</mark> text.</p>
              <p><del>This line of text is meant to be treated as deleted text.</del></p>
              <p><s>This line of text is meant to be treated as no longer accurate.</s></p>
              <p><ins>This line of text is meant to be treated as an addition to the
                document.</ins></p>
              <p><u>This line of text will render as underlined</u></p>
              <p><small>This line of text is meant to be treated as fine print.</small></p>
              <p><strong>This line rendered as bold text.</strong></p>
              <p><em>This line rendered as italicized text.</em></p>
              Nulla <abbr title="attribute">attr</abbr> vitae elit libero, a pharetra augue.
            </ComponentContainerCard>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <ComponentContainerCard title='Naming a Source' description={<>A well-known quote, contained in a blockquote element.</>}>
              <figure>
                <blockquote className="blockquote">
                  <p>A well-known quote, contained in a blockquote element.</p>
                </blockquote>
                <figcaption className="blockquote-footer">
                  Someone famous in <cite title="Source Title">Source Title</cite>
                </figcaption>
              </figure>
            </ComponentContainerCard>
          </Col>
        </Row>
        <Row>
          <Col xl={4}>
            <ComponentContainerCard title='Unordered' description={<>A list of items in which the order does not explicitly matter.</>}>
              <ul>
                <li>
                  Lorem ipsum dolor sit amet
                </li>
                <li>
                  Consectetur adipiscing elit
                </li>
                <li>
                  Integer molestie lorem at massa
                </li>
                <li>
                  Facilisis in pretium nisl aliquet
                </li>
                <li>
                  Nulla volutpat aliquam velit
                  <ul>
                    <li>
                      Phasellus iaculis neque
                    </li>
                    <li>
                      Purus sodales ultricies
                    </li>
                    <li>
                      Vestibulum laoreet porttitor sem
                    </li>
                    <li>
                      Ac tristique libero volutpat at
                    </li>
                  </ul>
                </li>
                <li>
                  Faucibus porta lacus fringilla vel
                </li>
                <li>
                  Aenean sit amet erat nunc
                </li>
                <li>
                  Eget porttitor lorem
                </li>
              </ul>
            </ComponentContainerCard>
          </Col>

          <Col xl={4}>
            <ComponentContainerCard title='Ordered' description={<>A list of items in which the order does explicitly matter.</>}>
              <ol>
                <li>
                  Lorem ipsum dolor sit amet
                </li>
                <li>
                  Consectetur adipiscing elit
                </li>
                <li>
                  Integer molestie lorem at massa
                </li>
                <li>
                  Facilisis in pretium nisl aliquet
                </li>
                <li>
                  Nulla volutpat aliquam velit
                  <ol>
                    <li>
                      Phasellus iaculis neque
                    </li>
                    <li>
                      Purus sodales ultricies
                    </li>
                    <li>
                      Vestibulum laoreet porttitor sem
                    </li>
                    <li>
                      Ac tristique libero volutpat at
                    </li>
                  </ol>
                </li>
                <li>
                  Faucibus porta lacus fringilla vel
                </li>
                <li>
                  Aenean sit amet erat nunc
                </li>
                <li>
                  Eget porttitor lorem
                </li>
              </ol>
            </ComponentContainerCard>
          </Col>
          <Col xl={4}>
            <ComponentContainerCard title='Unstyled' description={<><strong>This only applies to immediate children
              list items</strong>, meaning you will need to add the class for any nested lists
              as well.</>}>
              <ul className="list-unstyled">
                <li>
                  Lorem ipsum dolor sit amet
                </li>
                <li>
                  Integer molestie lorem at massa
                  <ul>
                    <li>
                      Phasellus iaculis neque
                    </li>
                  </ul>
                </li>
                <li>
                  Faucibus porta lacus fringilla vel
                </li>
                <li>
                  Eget porttitor lorem
                </li>
              </ul>
              <h5>Inline</h5>
              <p className="text-muted m-b-15">
                Place all list items on a single line with <code>
                  display: inline-block;</code>
                and some light padding.
              </p>
              <ul className="list-inline">
                <li className="list-inline-item">
                  Lorem ipsum
                </li>
                <li className="list-inline-item">
                  Phasellus iaculis
                </li>
                <li className="list-inline-item">
                  Nulla volutpat
                </li>
              </ul>
            </ComponentContainerCard>
          </Col>
        </Row>
      </div >
      <Row>
        <Col xl={4}>
          <ComponentContainerCard title='Abbreviations' description={<>Add .initialism to an abbreviation for a slightly smaller
            font-size.</>}>
            <p><abbr title="attribute">attr</abbr></p>
            <p><abbr title="HyperText Markup Language" className="initialism">HTML</abbr></p>
          </ComponentContainerCard>
        </Col>
        <Col xl={4}>
          <ComponentContainerCard title='Alignment' description={<>Use text utilities as needed to change the alignment of your
            blockquote.</>}>
            <figure className="text-center">
              <blockquote className="blockquote">
                <p>A well-known quote, contained in a blockquote element.</p>
              </blockquote>
              <figcaption className="blockquote-footer">
               &nbsp;Someone famous in <cite title="Source Title">Source Title</cite>
              </figcaption>
            </figure>
            <figure className="text-end">
              <blockquote className="blockquote">
                <p>A well-known quote, contained in a blockquote element.</p>
              </blockquote>
              <figcaption className="blockquote-footer">
              &nbsp;Someone famous in <cite title="Source Title">Source Title</cite>
              </figcaption>
            </figure>
          </ComponentContainerCard>
        </Col>
        <Col xl={4}>
          <ComponentContainerCard title='Inline' description={<>Remove a list&apos;s bullets and apply some light margin with a combination of two classes, .list-inline and .list-inline-item.</>}>
            <ul className="list-inline">
              <li className="list-inline-item">This is a list item.</li>
              <li className="list-inline-item">And another one.</li>
              <li className="list-inline-item">But they&apos;re displayed inline.</li>
            </ul>
          </ComponentContainerCard>
        </Col>
      </Row>
      <Row>
        <Col xl={6}>
          <ComponentContainerCard title='Blockquotes' description={<>For quoting blocks of content from another source within your
            document. Wrap <code>&lt;blockquote class=&quot;blockquote&quot;&gt;</code> around any <abbr title="PacesText Markup Language">HTML</abbr> as the quote.</>}>
            <blockquote className="blockquote">
              <p className="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Integer posuere erat a ante.</p>
            </blockquote>
            <figcaption className="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></figcaption>
            <p className="text-muted m-b-15">
              Use text utilities as needed to change the alignment of your blockquote.
            </p>
            <blockquote className="blockquote text-center">
              <p className="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Integer posuere erat a ante.</p>
            </blockquote>
            <figcaption className="blockquote-footer text-center">Someone famous in <cite title="Source Title">Source Title</cite></figcaption>
            <blockquote className="blockquote text-end">
              <p className="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Integer posuere erat a ante.</p>
            </blockquote>
            <figcaption className="blockquote-footer text-end">Someone famous in <cite title="Source Title">Source Title</cite></figcaption>
          </ComponentContainerCard>
        </Col>
        <Col xl={6}>
          <ComponentContainerCard title='Description List Alignment' description={<>Align terms and descriptions horizontally by using our grid
            system’s predefined classes (or semantic mixins). For longer terms, you can
            optionally add a <code>.text-truncate</code> class to truncate the text with an
            ellipsis.</>}>
            <dl className="row mb-0">
              <dt className="col-sm-3">Description lists</dt>
              <dd className="col-sm-9">A description list is perfect for defining terms.</dd>
              <dt className="col-sm-3">Euismod</dt>
              <dd className="col-sm-9">
                <p>Vestibulum id ligula porta felis euismod semper eget lacinia odio sem
                  nec elit.</p>
                <p>Donec id elit non mi porta gravida at eget metus.</p>
              </dd>
              <dt className="col-sm-3">Malesuada porta</dt>
              <dd className="col-sm-9">Etiam porta sem malesuada magna mollis euismod.</dd>
              <dt className="col-sm-3 text-truncate">Truncated term is truncated</dt>
              <dd className="col-sm-9">Fusce dapibus, tellus ac cursus commodo, tortor mauris
                condimentum nibh, ut fermentum massa justo sit amet risus.</dd>
              <dt className="col-sm-3">Nesting</dt>
              <dd className="col-sm-9">
                <dl className="row mb-0">
                  <dt className="col-sm-4">Nested definition list</dt>
                  <dd className="col-sm-8">Aenean posuere, tortor sed cursus feugiat, nunc
                    augue blandit nunc.</dd>
                </dl>
              </dd>
            </dl>
          </ComponentContainerCard>
        </Col>
      </Row>
    </>
  )
}

export default Typography