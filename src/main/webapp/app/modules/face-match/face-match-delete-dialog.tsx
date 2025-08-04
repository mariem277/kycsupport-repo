import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Cancel as CancelIcon, Close as CloseIcon } from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity } from './face-match.reducer';

export const FaceMatchDeleteDialog = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(getEntity(id));
    setOpen(true);
  }, [dispatch, id]);

  const faceMatchEntity = useAppSelector(state => state.faceMatch.entity);
  const updateSuccess = useAppSelector(state => state.faceMatch.updateSuccess);
  const deleting = useAppSelector(state => state.faceMatch.updating);

  const handleClose = () => {
    setOpen(false);
    navigate(`/face-match${pageLocation.search}`);
  };

  useEffect(() => {
    if (updateSuccess && open) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    dispatch(deleteEntity(faceMatchEntity.id));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="primary">
          Confirm Delete
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Are you sure you want to delete Face Match <strong>{faceMatchEntity.id}</strong>?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose} startIcon={<CancelIcon />} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={confirmDelete} startIcon={<DeleteIcon />} disabled={deleting}>
          {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FaceMatchDeleteDialog;
