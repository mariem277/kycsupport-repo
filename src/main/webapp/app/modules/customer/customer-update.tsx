import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Stack, IconButton, CircularProgress, Box, MenuItem, Button, TextField } from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getPartners } from 'app/entities/partner/partner.reducer';
import { KycStatus } from 'app/shared/model/enumerations/kyc-status.model';
import { createEntity, getEntity, reset, updateEntity } from './customer.reducer';
import dayjs from 'dayjs';

interface CustomerUpdateCardProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type CustomerFormValues = {
  id?: string;
  fullName: string;
  phone?: string;
  dob?: string;
  idNumber?: string;
  address?: string;
  kycStatus?: string;
  partner?: string;
  createdAt?: string;
};

const CustomerUpdateCard: React.FC<CustomerUpdateCardProps> = ({ customerId, isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isNew = customerId === null;

  const partners = useAppSelector(state => state.partner.entities);
  const customerEntity = useAppSelector(state => state.customer.entity);
  const loading = useAppSelector(state => state.customer.loading);
  const updating = useAppSelector(state => state.customer.updating);
  const updateSuccess = useAppSelector(state => state.customer.updateSuccess);

  const kycStatusValues = Object.keys(KycStatus);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: {
      fullName: '',
      phone: '',
      dob: '',
      idNumber: '',
      address: '',
      kycStatus: '',
      partner: '',
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
            fullName: '',
            phone: '',
            dob: '',
            idNumber: '',
            address: '',
            kycStatus: '',
            partner: '',
            createdAt: displayDefaultDateTime(),
          });
        }, 0);
      } else if (customerId) {
        dispatch(getEntity(customerId));
      }
    }
  }, [isOpen, customerId, isNew, dispatch, resetForm]);

  useEffect(() => {
    if (!isNew && customerEntity?.id) {
      resetForm({
        ...customerEntity,
        createdAt: convertDateTimeFromServer(customerEntity.createdAt),
        partner: customerEntity.partner?.id?.toString() || '',
      });
    }
  }, [customerEntity, isNew, resetForm]);

  useEffect(() => {
    if (updateSuccess && isOpen) {
      onSuccess?.();
      onClose();
    }
  }, [updateSuccess, isOpen, onSuccess, onClose]);

  const saveEntity = (values: CustomerFormValues) => {
    // eslint-disable-next-line no-console
    console.log('SUBMITTED VALUES:', values);
    const entity = {
      ...customerEntity,
      ...values,
      createdAt: isNew ? dayjs() : customerEntity.createdAt,
      partner: partners.find(p => p.id.toString() === values.partner),
    };
    if (isNew) {
      dispatch(createEntity(entity));
      // eslint-disable-next-line no-console
      console.log('Submitted values:', values);
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
            {isNew ? 'Create New Customer' : 'Edit Customer'}
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
          <form key={isNew ? 'create-form' : `edit-form-${customerId}`} onSubmit={handleSubmit(saveEntity)}>
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
                  name="fullName"
                  control={control}
                  rules={{ required: 'Name is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Full Name"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                    />
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Phone"
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
                  name="dob"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="idNumber"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="ID Number"
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

              <Controller
                name="address"
                control={control}
                rules={{ required: 'This field is required.' }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Address"
                    multiline
                    rows={2}
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    inputRef={field.ref}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Stack direction="row" spacing={2}>
                <Controller
                  name="kycStatus"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="KYC Status"
                      select
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      {kycStatusValues.map(status => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="partner"
                  control={control}
                  rules={{ required: 'This field is required.' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Partner"
                      select
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      inputRef={field.ref}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value="">None</MenuItem>
                      {partners.map(p => (
                        <MenuItem key={p.id} value={p.id.toString()}>
                          {p.id}
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

export default CustomerUpdateCard;
