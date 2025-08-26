import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Cancel as CancelIcon, Close as CloseIcon } from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity } from './customer.reducer';

export const CustomerDeleteDialog = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(getEntity(id));
    setOpen(true);
  }, [dispatch, id]);

  const customerEntity = useAppSelector(state => state.customer.entity);
  const updateSuccess = useAppSelector(state => state.customer.updateSuccess);
  const deleting = useAppSelector(state => state.customer.updating);

  const handleClose = () => {
    navigate(`/customer${pageLocation.search}`);
  };

  useEffect(() => {
    if (updateSuccess && open) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    dispatch(deleteEntity(customerEntity.id));
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
          Are you sure you want to delete Face Match <strong>{customerEntity.id}</strong>?
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

export default CustomerDeleteDialog;
