import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getCustomers } from 'app/modules/customer/customer.reducer';
import { createEntity, getEntity, reset, updateEntity } from './document.reducer';

export const DocumentUpdate = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();

  const isNew = id === undefined;

  const customers = useAppSelector(state => state.customer.entities);
  const documentEntity = useAppSelector(state => state.document.entity);
  const loading = useAppSelector(state => state.document.loading);
  const updating = useAppSelector(state => state.document.updating);
  const updateSuccess = useAppSelector(state => state.document.updateSuccess);

  const [analyzedData, setAnalyzedData] = useState({ qualityScore: '', issues: '' });

  const handleClose = () => {
    navigate(`/document${location.search}`);
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

  // Mise à jour manuelle des champs après analyse
  useEffect(() => {
    const inputScore = document.querySelector<HTMLInputElement>('input[name="qualityScore"]');
    const inputIssues = document.querySelector<HTMLInputElement>('input[name="issues"]');
    if (inputScore && analyzedData.qualityScore) inputScore.value = analyzedData.qualityScore;
    if (inputIssues && analyzedData.issues) inputIssues.value = analyzedData.issues;
  }, [analyzedData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/image-analysis', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setAnalyzedData({
          qualityScore: response.data.qualityScore,
          issues: response.data.issues,
        });
      } catch (error) {
        console.error('Error analyzing image:', error);
        setAnalyzedData({ qualityScore: 'Error', issues: 'Could not analyze image' });
      }
    }
  };

  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }
    if (values.qualityScore !== undefined && typeof values.qualityScore !== 'number') {
      values.qualityScore = Number(values.qualityScore);
    }
    values.createdAt = convertDateTimeToServer(values.createdAt);

    const entity = {
      ...documentEntity,
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
          qualityScore: analyzedData.qualityScore,
          issues: analyzedData.issues,
        }
      : {
          ...documentEntity,
          createdAt: convertDateTimeFromServer(documentEntity.createdAt),
          customer: documentEntity?.customer?.id,
          qualityScore: analyzedData.qualityScore || documentEntity.qualityScore,
          issues: analyzedData.issues || documentEntity.issues,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="kycsupportApp.document.home.createOrEditLabel" data-cy="DocumentCreateUpdateHeading">
            Create or edit a Document
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="document-id" label="ID" validate={{ required: true }} /> : null}
              {/* Upload fichier image */}
              <div className="mb-3">
                <label htmlFor="fileUpload">Upload Image</label>
                <input
                  id="fileUpload"
                  name="fileUpload"
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
              <ValidatedField label="Quality Score" id="document-qualityScore" name="qualityScore" data-cy="qualityScore" type="text" />
              <ValidatedField label="Issues" id="document-issues" name="issues" data-cy="issues" type="text" />
              <ValidatedField
                label="Created At"
                id="document-createdAt"
                name="createdAt"
                data-cy="createdAt"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField id="document-customer" name="customer" data-cy="customer" label="Customer" type="select">
                <option value="" key="0" />
                {customers
                  ? customers.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/document" replace color="info">
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

export default DocumentUpdate;
