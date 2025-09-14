import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Cancel as CancelIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = '/api/admin/users'; // Adjust if needed

export const UserDeleteDialog: React.FC = () => {
  const { id } = useParams<'id'>();
  const navigate = useNavigate();
  const pageLocation = useLocation();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setOpen(true);
    setLoading(true);
    axios
      .get(`${API_URL}/${id}`)
      .then(res => setUser(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClose = () => {
    navigate(`/users${pageLocation.search}`);
  };

  const confirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      handleClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Delete User
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
      <DialogContent dividers>
        {loading ? (
          <CircularProgress />
        ) : (
          <Typography>
            Are you sure you want to delete user <strong>{user?.username}</strong> (ID: {user?.id})?
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} startIcon={<CancelIcon />} disabled={deleting}>
          Cancel
        </Button>
        <Button onClick={confirmDelete} color="error" startIcon={<DeleteIcon />} disabled={deleting || loading}>
          {deleting ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDeleteDialog;
