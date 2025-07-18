import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './document.reducer';

export const DocumentDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const documentEntity = useAppSelector(state => state.document.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="documentDetailsHeading">Document</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{documentEntity.id}</dd>
          <dt>
            <span id="fileUrl">File Url</span>
          </dt>
          <dd>
            {documentEntity.fileUrl ? (
              <a href={documentEntity.fileUrl} target="_blank" rel="noopener noreferrer">
                {documentEntity.fileUrl}
              </a>
            ) : null}
          </dd>
          <dt>
            <span id="qualityScore">Quality Score</span>
          </dt>
          <dd>{documentEntity.qualityScore}</dd>
          <dt>
            <span id="issues">Issues</span>
          </dt>
          <dd>{documentEntity.issues}</dd>
          <dt>
            <span id="createdAt">Created At</span>
          </dt>
          <dd>{documentEntity.createdAt ? <TextFormat value={documentEntity.createdAt} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
          <dt>Customer</dt>
          <dd>{documentEntity.customer ? documentEntity.customer.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/document" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/document/${documentEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default DocumentDetail;
