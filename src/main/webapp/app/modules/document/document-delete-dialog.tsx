import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Cancel as CancelIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity } from './document.reducer';

export const DocumentDeleteDialog = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();
  const pageLocation = useLocation();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const documentEntity = useAppSelector(state => state.document.entity);
  const updateSuccess = useAppSelector(state => state.document.updateSuccess);

  const handleClose = () => {
    navigate(`/document${pageLocation.search}`);
  };

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const confirmDelete = () => {
    dispatch(deleteEntity(documentEntity.id));
  };

  return (
    <Dialog open onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        Confirm Delete Operation
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">Are you sure you want to delete document {documentEntity.id}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="outlined" startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDeleteDialog;
