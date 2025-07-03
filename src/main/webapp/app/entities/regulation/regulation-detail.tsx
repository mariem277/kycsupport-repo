import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './regulation.reducer';

export const RegulationDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const regulationEntity = useAppSelector(state => state.regulation.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="regulationDetailsHeading">Regulation</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{regulationEntity.id}</dd>
          <dt>
            <span id="title">Title</span>
          </dt>
          <dd>{regulationEntity.title}</dd>
          <dt>
            <span id="content">Content</span>
          </dt>
          <dd>{regulationEntity.content}</dd>
          <dt>
            <span id="sourceUrl">Source Url</span>
          </dt>
          <dd>{regulationEntity.sourceUrl}</dd>
          <dt>
            <span id="status">Status</span>
          </dt>
          <dd>{regulationEntity.status}</dd>
          <dt>
            <span id="createdAt">Created At</span>
          </dt>
          <dd>
            {regulationEntity.createdAt ? <TextFormat value={regulationEntity.createdAt} type="date" format={APP_DATE_FORMAT} /> : null}
          </dd>
        </dl>
        <Button tag={Link} to="/regulation" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/regulation/${regulationEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default RegulationDetail;
