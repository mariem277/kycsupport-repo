import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Stack, IconButton, CircularProgress, Box, MenuItem, Button, TextField } from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getCustomers } from 'app/modules/customer/customer.reducer';
import { createEntity, getEntity, reset, updateEntity } from './document.reducer';
import axios from 'axios';

interface DocumentUpdateCardProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type DocumentFormValues = {
  id?: string;
  fileUrl?: string;
  qualityScore?: string;
  issues?: string;
  customer?: string;
  createdAt?: string;
};

const DocumentUpdateCard: React.FC<DocumentUpdateCardProps> = ({ documentId, isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isNew = documentId === null;

  const customers = useAppSelector(state => state.customer.entities);
  const documentEntity = useAppSelector(state => state.document.entity);
  const loading = useAppSelector(state => state.document.loading);
  const updating = useAppSelector(state => state.document.updating);
  const updateSuccess = useAppSelector(state => state.document.updateSuccess);

  const [fileUrl, setFileUrl] = useState('');

  const {
    control,
    handleSubmit,
    reset: resetForm,
    setValue,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: {
      fileUrl: '',
      qualityScore: '',
      issues: '',
      customer: '',
      createdAt: displayDefaultDateTime(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(getCustomers({}));

      if (isNew) {
        dispatch(reset());
        resetForm({
          fileUrl: '',
          qualityScore: '',
          issues: '',
          customer: '',
          createdAt: displayDefaultDateTime(),
        });
      } else if (documentId) {
        dispatch(getEntity(documentId));
      }
    }
  }, [isOpen, documentId, isNew, dispatch, resetForm]);

  useEffect(() => {
    if (!isNew && documentEntity?.id) {
      resetForm({
        ...documentEntity,
        createdAt: convertDateTimeFromServer(documentEntity.createdAt),
        customer: documentEntity.customer?.id?.toString() || '',
      });
      setFileUrl(documentEntity.fileUrl);
    }
  }, [documentEntity, isNew, resetForm]);

  useEffect(() => {
    if (updateSuccess && isOpen) {
      onSuccess?.();
      onClose();
    }
  }, [updateSuccess, isOpen, onSuccess, onClose]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newFileUrl = uploadResponse.data.fileUrl;
        const objectName = new URL(newFileUrl).pathname.substring(new URL(newFileUrl).pathname.lastIndexOf('/') + 1);
        setFileUrl(objectName);
        setValue('fileUrl', objectName);

        const analysisResponse = await axios.post('/api/image-analysis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setValue('qualityScore', analysisResponse.data.qualityScore);
        setValue('issues', analysisResponse.data.issues.join(','));
      } catch (error) {
        console.error('Error during file upload or analysis:', error);
        setValue('qualityScore', 'Error');
        setValue('issues', 'Could not process file');
      }
    }
  };

  const saveEntity = (values: DocumentFormValues) => {
    const entity = {
      ...documentEntity,
      ...values,
      createdAt: convertDateTimeToServer(values.createdAt),
      fileUrl,
      customer: customers.find(c => c.id.toString() === values.customer),
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
            {isNew ? 'Create New Document' : 'Edit Document'}
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
          <form key={isNew ? 'create-form' : `edit-form-${documentId}`} onSubmit={handleSubmit(saveEntity)}>
            <Stack spacing={3}>
              {!isNew && (
                <Controller
                  name="id"
                  control={control}
                  render={({ field }) => <TextField {...field} label="ID" fullWidth InputProps={{ readOnly: true }} />}
                />
              )}

              <TextField type="file" label="Upload Image" InputLabelProps={{ shrink: true }} onChange={handleFileChange} />

              <Controller
                name="qualityScore"
                control={control}
                render={({ field }) => <TextField {...field} label="Quality Score" fullWidth InputProps={{ readOnly: true }} />}
              />

              <Controller
                name="issues"
                control={control}
                render={({ field }) => <TextField {...field} label="Issues" fullWidth InputProps={{ readOnly: true }} />}
              />

              <Controller
                name="customer"
                control={control}
                rules={{ required: 'This field is required.' }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Customer"
                    select
                    fullWidth
                    // Explicitly handle value and onChange instead of spreading {...field}
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)} // <--- THE FIX
                    onBlur={field.onBlur} // Good practice to keep onBlur
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="">
                      <em>None</em> {/* Using <em> makes it look like a placeholder */}
                    </MenuItem>
                    {customers.map(c => (
                      <MenuItem key={c.id} value={c.id.toString()}>
                        {c.id} {/* Or c.name, or whatever you want to display */}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="createdAt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Created At"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: true }}
                  />
                )}
              />

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

export default DocumentUpdateCard;
