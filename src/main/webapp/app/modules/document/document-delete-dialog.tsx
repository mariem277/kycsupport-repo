import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Modal, Box, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity } from './document.reducer';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const DocumentDeleteDialog = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(getEntity(id));
    setOpen(true);
  }, []);

  const documentEntity = useAppSelector(state => state.document.entity);
  const updateSuccess = useAppSelector(state => state.document.updateSuccess);

  const handleClose = () => {
    setOpen(false);
    navigate(`/document${pageLocation.search}`);
  };

  useEffect(() => {
    if (updateSuccess && !open) {
      handleClose();
    }
  }, [updateSuccess, open]);

  const confirmDelete = () => {
    dispatch(deleteEntity(documentEntity.id));
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Confirm delete operation
        </Typography>
        <Typography id="modal-description" sx={{ mt: 2 }}>
          Are you sure you want to delete Document {documentEntity.id}?
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="error" onClick={confirmDelete} sx={{ ml: 1 }}>
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DocumentDeleteDialog;
