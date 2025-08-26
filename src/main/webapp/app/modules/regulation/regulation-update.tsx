import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { Card, CardContent, Typography, Stack, IconButton, CircularProgress, Box, MenuItem, Button, TextField } from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { RegulationStatus } from 'app/shared/model/enumerations/regulation-status.model';
import { createEntity, getEntity, reset, updateEntity } from './regulation.reducer';
import { useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { getEntities as getPartners } from 'app/entities/partner/partner.reducer';

interface RegulationUpdateCardProps {
  regulationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type RegulationFormValues = {
  id?: number;
  title?: string;
  content?: string;
  sourceUrl?: string;
  status?: string;
  createdAt?: string;
};

export const RegulationUpdateCard: React.FC<RegulationUpdateCardProps> = ({ regulationId, isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isNew = regulationId === null;

  const regulationEntity = useAppSelector(state => state.regulation.entity);
  const loading = useAppSelector(state => state.regulation.loading);
  const updating = useAppSelector(state => state.regulation.updating);
  const updateSuccess = useAppSelector(state => state.regulation.updateSuccess);

  const regulationStatusValues = Object.keys(RegulationStatus);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<RegulationFormValues>({
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: {
      title: '',
      content: '',
      sourceUrl: '',
      status: '',
      createdAt: displayDefaultDateTime(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(getPartners({}));

      if (isNew) {
        dispatch(reset());

        setTimeout(() => {
          resetForm({
            title: '',
            content: '',
            sourceUrl: '',
            status: '',
            createdAt: displayDefaultDateTime(),
          });
        }, 0);
      } else if (regulationId) {
        dispatch(getEntity(regulationId));
      }
    }
  }, [isOpen, regulationId, isNew, dispatch, resetForm]);

  useEffect(() => {
    if (!isNew && regulationEntity?.id) {
      resetForm({
        ...regulationEntity,
        createdAt: convertDateTimeFromServer(regulationEntity.createdAt),
      });
    }
  }, [regulationEntity, isNew, resetForm]);

  useEffect(() => {
    if (updateSuccess && isOpen) {
      onSuccess?.();
      onClose();
    }
  }, [updateSuccess, isOpen, onSuccess, onClose]);

  const saveEntity = values => {
    const entity = {
      ...regulationEntity,
      ...values,
      createdAt: convertDateTimeToServer(values.createdAt),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  return (
    <Card
      elevation={6}
      sx={{
        position: 'absolute',
        top: '10%',
        left: '35%',
        width: '30%',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            {isNew ? 'Create New Regulation' : 'Edit Regulation'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <form key={isNew ? 'create-form' : `edit-form-${regulationId}`} onSubmit={handleSubmit(saveEntity)}>
            <Stack spacing={3}>
              {!isNew && (
                <Controller
                  name="id"
                  control={control}
                  render={({ field }) => <TextField {...field} label="ID" fullWidth InputProps={{ readOnly: true }} />}
                />
              )}

              <Stack direction="row" spacing={2}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Title"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                    />
                  )}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Content"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                    />
                  )}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Controller
                  name="sourceUrl"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Source Url"
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Status"
                      select
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      {regulationStatusValues.map(status => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                <Button variant="outlined" color="inherit" onClick={onClose} startIcon={<CancelIcon />} disabled={updating}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={updating}
                  startIcon={<SaveIcon />}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {updating ? 'Saving...' : 'Save'}
                </Button>
              </Stack>
            </Stack>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default RegulationUpdateCard;
