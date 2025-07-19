import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getCustomers } from 'app/entities/customer/customer.reducer';
import { createEntity, getEntity, reset, updateEntity } from './face-match.reducer';

export const FaceMatchUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const customers = useAppSelector(state => state.customer.entities);
  const faceMatchEntity = useAppSelector(state => state.faceMatch.entity);
  const loading = useAppSelector(state => state.faceMatch.loading);
  const updating = useAppSelector(state => state.faceMatch.updating);
  const updateSuccess = useAppSelector(state => state.faceMatch.updateSuccess);

  const handleClose = () => {
    navigate(`/face-match${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getCustomers({}));
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
    if (values.score !== undefined && typeof values.score !== 'number') {
      values.score = Number(values.score);
    }
    values.createdAt = convertDateTimeToServer(values.createdAt);

    const entity = {
      ...faceMatchEntity,
      ...values,
      customer: customers.find(it => it.id.toString() === values.customer?.toString()),
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
          ...faceMatchEntity,
          createdAt: convertDateTimeFromServer(faceMatchEntity.createdAt),
          customer: faceMatchEntity?.customer?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="kycsupportApp.faceMatch.home.createOrEditLabel" data-cy="FaceMatchCreateUpdateHeading">
            Create or edit a Face Match
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="face-match-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Selfie Url"
                id="face-match-selfieUrl"
                name="selfieUrl"
                data-cy="selfieUrl"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Id Photo Url"
                id="face-match-idPhotoUrl"
                name="idPhotoUrl"
                data-cy="idPhotoUrl"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Match" id="face-match-match" name="match" data-cy="match" check type="checkbox" />
              <ValidatedField label="Score" id="face-match-score" name="score" data-cy="score" type="text" />
              <ValidatedField
                label="Created At"
                id="face-match-createdAt"
                name="createdAt"
                data-cy="createdAt"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField id="face-match-customer" name="customer" data-cy="customer" label="Customer" type="select">
                <option value="" key="0" />
                {customers
                  ? customers.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/face-match" replace color="info">
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

export default FaceMatchUpdate;
