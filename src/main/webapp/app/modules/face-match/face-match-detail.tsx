import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './face-match.reducer';

export const FaceMatchDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const faceMatchEntity = useAppSelector(state => state.faceMatch.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="faceMatchDetailsHeading">Face Match</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{faceMatchEntity.id}</dd>
          <dt>
            <span id="selfieUrl">Selfie Url</span>
          </dt>
          <dd>{faceMatchEntity.selfieUrl}</dd>
          <dt>
            <span id="idPhotoUrl">Id Photo Url</span>
          </dt>
          <dd>{faceMatchEntity.idPhotoUrl}</dd>
          <dt>
            <span id="match">Match</span>
          </dt>
          <dd>{faceMatchEntity.match ? 'true' : 'false'}</dd>
          <dt>
            <span id="score">Score</span>
          </dt>
          <dd>{faceMatchEntity.score}</dd>
          <dt>
            <span id="createdAt">Created At</span>
          </dt>
          <dd>
            {faceMatchEntity.createdAt ? <TextFormat value={faceMatchEntity.createdAt} type="date" format={APP_DATE_FORMAT} /> : null}
          </dd>
          <dt>Customer</dt>
          <dd>{faceMatchEntity.customer ? faceMatchEntity.customer.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/face-match" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/face-match/${faceMatchEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default FaceMatchDetail;
