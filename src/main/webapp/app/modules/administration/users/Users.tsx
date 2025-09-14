import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Alert,
  Modal,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { getAllUsers, deleteUser } from './UsersApi';
import UserUpdateCard from './UserUpdateCard';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

const Users: React.FC = () => {
  const theme = useTheme();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUserIdForEdit, setSelectedUserIdForEdit] = useState<string | null>(null);
  const [showUpdateCard, setShowUpdateCard] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleEditUser = (userId: string) => {
    setSelectedUserIdForEdit(userId);
    setShowUpdateCard(true);
  };

  const handleCreateUser = () => {
    setSelectedUserIdForEdit(null); // null means create
    setShowUpdateCard(true);
  };

  const handleCloseUpdateCard = () => {
    setShowUpdateCard(false);
    setSelectedUserIdForEdit(null);
  };

  const handleUpdateSuccess = () => {
    loadUsers();
  };

  return (
    <Paper variant="elevation" sx={{ px: 2, paddingRight: '5%', paddingLeft: '5%' }}>
      <Box sx={{ paddingTop: '2%', paddingBottom: '2%' }}>
        {/* Header with Add button */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Users
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            startIcon={<AddIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              backgroundColor: theme.palette.primary.main,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Add User
          </Button>
        </Stack>

        <Modal
          open={showUpdateCard}
          onClose={handleCloseUpdateCard}
          disableEnforceFocus
          sx={{
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box>
            {showUpdateCard && (
              <UserUpdateCard
                userId={selectedUserIdForEdit}
                isOpen={showUpdateCard}
                onClose={handleCloseUpdateCard}
                onSuccess={handleUpdateSuccess}
              />
            )}
          </Box>
        </Modal>

        {/* Users Table */}
        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Table size="small" sx={{ '& td, & th': { padding: '6px 8px', fontSize: '0.75rem' } }}>
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map(user => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      transition: 'background-color 0.2s ease',
                      '&:hover': { backgroundColor: theme.palette.grey[100] },
                    }}
                  >
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(user.id)} size="small" color="default">
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Alert
                      severity="info"
                      variant="outlined"
                      sx={{
                        backgroundColor: 'transparent',
                        borderColor: theme.palette.grey[300],
                        color: theme.palette.text.secondary,
                        fontSize: 14,
                      }}
                    >
                      No users found
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default Users;
