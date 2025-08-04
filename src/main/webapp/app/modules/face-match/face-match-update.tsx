import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Box,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  UploadFile as UploadFileIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import dayjs from 'dayjs';

import { getEntities as getCustomers } from 'app/entities/customer/customer.reducer';
import { createEntity, getEntity, reset, updateEntity } from './face-match.reducer';

interface FaceMatchUpdateCardProps {
  faceMatchId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FaceMatchFormValues = {
  id?: string;
  customer?: string;
  idPath?: string;
  selfiePath?: string;
};

export const FaceMatchUpdateCard: React.FC<FaceMatchUpdateCardProps> = ({ faceMatchId, isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isNew = faceMatchId === null;

  const customers = useAppSelector(state => state.customer.entities);
  const faceMatchEntity = useAppSelector(state => state.faceMatch.entity);
  const loading = useAppSelector(state => state.faceMatch.loading);
  const updating = useAppSelector(state => state.faceMatch.updating);
  const updateSuccess = useAppSelector(state => state.faceMatch.updateSuccess);

  const [img1, setImg1] = useState<File | null>(null);
  const [img2, setImg2] = useState<File | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const {
    control,
    handleSubmit,
    reset: resetForm,
  } = useForm<FaceMatchFormValues>({
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: {
      id: '',
      customer: '',
      idPath: '',
      selfiePath: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(getCustomers({}));
      if (isNew) {
        dispatch(reset());
      } else if (faceMatchId) {
        dispatch(getEntity(faceMatchId));
      }
    }
  }, [isOpen, faceMatchId, isNew, dispatch]);

  useEffect(() => {
    if (updateSuccess && isOpen) {
      onSuccess?.();
      onClose();
    }
  }, [updateSuccess, isOpen, onSuccess, onClose]);

  const saveEntity = async (values: FaceMatchFormValues) => {
    try {
      const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newFileUrl = response.data.fileUrl;
        const url = new URL(newFileUrl);
        return url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
      };

      const [idPhotoUrl, selfieUrl] = await Promise.all([
        img1 ? uploadImage(img1) : Promise.resolve(faceMatchEntity.idPath),
        img2 ? uploadImage(img2) : Promise.resolve(faceMatchEntity.selfiePath),
      ]);
      const entity = {
        ...faceMatchEntity,
        ...values,
        selfieUrl,
        idPhotoUrl,
        createdAt: isNew ? dayjs() : faceMatchEntity.createdAt,
        customer: customers.find(c => c.id.toString() === values.customer),
        match: true,
      };

      if (isNew) {
        dispatch(createEntity(entity));
      } else {
        dispatch(updateEntity(entity));
      }
    } catch (error) {
      console.error('Error uploading or saving entity:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (!img1 || !img2) {
      alert('Please upload both ID and Selfie images.');
      return;
    }

    const formData = new FormData();
    formData.append('img1', img1);
    formData.append('img2', img2);

    setOpenModal(true);
    setVerifying(true);
    setVerifyResult(null); // Clear previous result

    try {
      const response = await axios.post('/api/verify_face_match', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVerifyResult(response.data);
    } catch (error: any) {
      setVerifyResult({
        error: error.response?.data?.error || error.message || 'Unknown error occurred',
      });
    } finally {
      setVerifying(false);
    }
  };

  const DropZone = ({ onDrop, label }: { onDrop: (files: File[]) => void; label: string }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: acceptedFiles => onDrop(acceptedFiles),
      multiple: false,
      accept: {
        'image/*': [],
      },
    });

    return (
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${theme.palette.primary.main}`,
          borderRadius: 2,
          padding: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? theme.palette.primary.light : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <UploadFileIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        <Typography variant="body1">{label}</Typography>
      </Box>
    );
  };

  return (
    <>
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
              {isNew ? 'Create New Face Match' : 'Edit Face Match'}
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
            <form key={isNew ? 'create-form' : `edit-form-${faceMatchId}`} onSubmit={handleSubmit(saveEntity)}>
              <Stack spacing={3}>
                {!isNew && (
                  <Controller
                    name="id"
                    control={control}
                    render={({ field }) => <TextField {...field} label="ID" fullWidth InputProps={{ readOnly: true }} />}
                  />
                )}
                <Controller
                  name="customer"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Customer" fullWidth SelectProps={{ native: true }}>
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.fullName}
                        </option>
                      ))}
                    </TextField>
                  )}
                />

                <DropZone onDrop={files => setImg1(files[0])} label={img1 ? img1.name : 'Drop or click to upload ID image'} />
                <DropZone onDrop={files => setImg2(files[0])} label={img2 ? img2.name : 'Drop or click to upload Selfie image'} />

                <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                  <Button variant="outlined" onClick={onClose} startIcon={<CancelIcon />} disabled={updating}>
                    Cancel
                  </Button>
                  {verifying ? (
                    <Box display="flex" alignItems="center" justifyContent="center" px={2}>
                      <CircularProgress size={24} color="secondary" />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        Verifying...
                      </Typography>
                    </Box>
                  ) : (
                    <Button variant="contained" onClick={handleVerify} disabled={!img1 || !img2} color="secondary">
                      Verify
                    </Button>
                  )}
                </Stack>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {verifying ? (
            <Box display="flex" alignItems="center" justifyContent="center" px={2}>
              <CircularProgress size={24} color="secondary" />
            </Box>
          ) : verifyResult?.verified ? (
            <>
              <Box display="flex" alignItems="center" mb={2} gap={1} flexDirection="column" justifyContent="center">
                <CheckCircleIcon fontSize="large" sx={{ color: 'success.light' }} />
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  Face Match Verified
                </Typography>
              </Box>
              {
                // <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(verifyResult.verified, null, 2)}</pre>//
              }
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  onClick={handleSubmit(saveEntity)}
                  startIcon={<SaveIcon />}
                  disabled={updating}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {updating ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box display="flex" alignItems="center" mb={2} gap={1} flexDirection="column" justifyContent="center">
                <CancelIcon fontSize="large" sx={{ color: 'error.light' }} />
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  Faces do not match please try to upload other files
                </Typography>
              </Box>
              {verifyResult?.error && (
                <Typography variant="body2" color="textSecondary">
                  {verifyResult.error}
                </Typography>
              )}
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="outlined" color="error" onClick={() => setOpenModal(false)} startIcon={<CancelIcon />}>
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
