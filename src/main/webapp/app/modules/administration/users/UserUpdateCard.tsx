import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Stack, IconButton, CircularProgress, Box, Button, TextField } from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

interface UserUpdateCardProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type UserFormValues = {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  password?: string;
};

const UserUpdateCard: React.FC<UserUpdateCardProps> = ({ userId, isOpen, onClose, onSuccess }) => {
  const theme = useTheme();
  const isNew = userId === null;

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<UserFormValues>({
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      enabled: true,
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isNew) {
        resetForm({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          enabled: true,
        });
      } else if (userId) {
        setLoading(true);
        axios
          .get(`/api/admin/users/${userId}`)
          .then(res => {
            resetForm(res.data);
          })
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, userId, isNew, resetForm]);

  const saveEntity = async (values: UserFormValues) => {
    setUpdating(true);
    try {
      if (isNew) {
        await axios.post('/api/admin/users', values);
      } else {
        // If you want update support, you need to add PUT in backend
        await axios.post('/api/admin/users', values); // fallback create
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error('Error saving user:', e);
    } finally {
      setUpdating(false);
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
            {isNew ? 'Create New User' : 'Edit User'}
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
          <form key={isNew ? 'create-form' : `edit-form-${userId}`} onSubmit={handleSubmit(saveEntity)}>
            <Stack spacing={3}>
              {!isNew && (
                <Controller
                  name="id"
                  control={control}
                  render={({ field }) => <TextField {...field} label="ID" fullWidth InputProps={{ readOnly: true }} />}
                />
              )}

              <Controller
                name="username"
                control={control}
                rules={{ required: 'Username is required.' }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Username"
                    value={field.value}
                    onChange={field.onChange}
                    inputRef={field.ref}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email is required.' }}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    value={field.value}
                    onChange={field.onChange}
                    inputRef={field.ref}
                  />
                )}
              />

              <Stack direction="row" spacing={2}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => <TextField label="First Name" fullWidth {...field} />}
                />
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => <TextField label="Last Name" fullWidth {...field} />}
                />
              </Stack>
              <Stack sx={{ p: 3 }}>
                {isNew && (
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: 'Password is required.' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        value={field.value}
                        onChange={field.onChange}
                        inputRef={field.ref}
                      />
                    )}
                  />
                )}
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

export default UserUpdateCard;
