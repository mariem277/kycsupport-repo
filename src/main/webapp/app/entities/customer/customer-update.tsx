import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getPartners } from 'app/entities/partner/partner.reducer';
import { KycStatus } from 'app/shared/model/enumerations/kyc-status.model';
import { createEntity, getEntity, reset, updateEntity } from './customer.reducer';

export const CustomerUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const partners = useAppSelector(state => state.partner.entities);
  const customerEntity = useAppSelector(state => state.customer.entity);
  const loading = useAppSelector(state => state.customer.loading);
  const updating = useAppSelector(state => state.customer.updating);
  const updateSuccess = useAppSelector(state => state.customer.updateSuccess);
  const kycStatusValues = Object.keys(KycStatus);

  const handleClose = () => {
    navigate(`/customer${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getPartners({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }
    values.createdAt = convertDateTimeToServer(values.createdAt);

    const entity = {
      ...customerEntity,
      ...values,
      partner: partners.find(it => it.id.toString() === values.partner?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          createdAt: displayDefaultDateTime(),
        }
      : {
          kycStatus: 'PENDING',
          ...customerEntity,
          createdAt: convertDateTimeFromServer(customerEntity.createdAt),
          partner: customerEntity?.partner?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="kycsupportApp.customer.home.createOrEditLabel" data-cy="CustomerCreateUpdateHeading">
            Create or edit a Customer
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="customer-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Full Name"
                id="customer-fullName"
                name="fullName"
                data-cy="fullName"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Dob" id="customer-dob" name="dob" data-cy="dob" type="date" />
              <ValidatedField label="Address" id="customer-address" name="address" data-cy="address" type="text" />
              <ValidatedField label="Phone" id="customer-phone" name="phone" data-cy="phone" type="text" />
              <ValidatedField label="Id Number" id="customer-idNumber" name="idNumber" data-cy="idNumber" type="text" />
              <ValidatedField label="Kyc Status" id="customer-kycStatus" name="kycStatus" data-cy="kycStatus" type="select">
                {kycStatusValues.map(kycStatus => (
                  <option value={kycStatus} key={kycStatus}>
                    {kycStatus}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField
                label="Created At"
                id="customer-createdAt"
                name="createdAt"
                data-cy="createdAt"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField id="customer-partner" name="partner" data-cy="partner" label="Partner" type="select">
                <option value="" key="0" />
                {partners
                  ? partners.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/customer" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CustomerUpdate;
