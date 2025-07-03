import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './customer.reducer';

export const CustomerDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const customerEntity = useAppSelector(state => state.customer.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="customerDetailsHeading">Customer</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{customerEntity.id}</dd>
          <dt>
            <span id="fullName">Full Name</span>
          </dt>
          <dd>{customerEntity.fullName}</dd>
          <dt>
            <span id="dob">Dob</span>
          </dt>
          <dd>{customerEntity.dob ? <TextFormat value={customerEntity.dob} type="date" format={APP_LOCAL_DATE_FORMAT} /> : null}</dd>
          <dt>
            <span id="address">Address</span>
          </dt>
          <dd>{customerEntity.address}</dd>
          <dt>
            <span id="phone">Phone</span>
          </dt>
          <dd>{customerEntity.phone}</dd>
          <dt>
            <span id="idNumber">Id Number</span>
          </dt>
          <dd>{customerEntity.idNumber}</dd>
          <dt>
            <span id="kycStatus">Kyc Status</span>
          </dt>
          <dd>{customerEntity.kycStatus}</dd>
          <dt>
            <span id="createdAt">Created At</span>
          </dt>
          <dd>{customerEntity.createdAt ? <TextFormat value={customerEntity.createdAt} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
          <dt>Partner</dt>
          <dd>{customerEntity.partner ? customerEntity.partner.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/customer" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/customer/${customerEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default CustomerDetail;
