import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { RegulationStatus } from 'app/shared/model/enumerations/regulation-status.model';
import { createEntity, getEntity, reset, updateEntity } from './regulation.reducer';

export const RegulationUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const regulationEntity = useAppSelector(state => state.regulation.entity);
  const loading = useAppSelector(state => state.regulation.loading);
  const updating = useAppSelector(state => state.regulation.updating);
  const updateSuccess = useAppSelector(state => state.regulation.updateSuccess);
  const regulationStatusValues = Object.keys(RegulationStatus);

  const handleClose = () => {
    navigate(`/regulation${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }
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
      ...regulationEntity,
      ...values,
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
          status: 'PENDING',
          ...regulationEntity,
          createdAt: convertDateTimeFromServer(regulationEntity.createdAt),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="kycsupportApp.regulation.home.createOrEditLabel" data-cy="RegulationCreateUpdateHeading">
            Create or edit a Regulation
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="regulation-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Title"
                id="regulation-title"
                name="title"
                data-cy="title"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Content" id="regulation-content" name="content" data-cy="content" type="textarea" />
              <ValidatedField label="Source Url" id="regulation-sourceUrl" name="sourceUrl" data-cy="sourceUrl" type="text" />
              <ValidatedField label="Status" id="regulation-status" name="status" data-cy="status" type="select">
                {regulationStatusValues.map(regulationStatus => (
                  <option value={regulationStatus} key={regulationStatus}>
                    {regulationStatus}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField
                label="Created At"
                id="regulation-createdAt"
                name="createdAt"
                data-cy="createdAt"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/regulation" replace color="info">
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

export default RegulationUpdate;
