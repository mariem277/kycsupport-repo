import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './partner.reducer';

export const PartnerDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const partnerEntity = useAppSelector(state => state.partner.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="partnerDetailsHeading">Partner</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{partnerEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{partnerEntity.name}</dd>
          <dt>
            <span id="realmName">Realm Name</span>
          </dt>
          <dd>{partnerEntity.realmName}</dd>
          <dt>
            <span id="clientId">Client Id</span>
          </dt>
          <dd>{partnerEntity.clientId}</dd>
        </dl>
        <Button tag={Link} to="/partner" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/partner/${partnerEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default PartnerDetail;
