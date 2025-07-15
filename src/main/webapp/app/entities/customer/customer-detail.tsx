import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Chip, CircularProgress, Divider, IconButton, Stack, Typography, Button } from '@mui/material';
import { Close as CloseIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './customer.reducer';
import { APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const customer = useAppSelector(state => state.customer.entity);
  const loading = useAppSelector(state => state.customer.loading);

  useEffect(() => {
    if (id) {
      dispatch(getEntity(id));
    }
  }, [id, dispatch]);

  const formatDate = (date: string, formatString: string) => {
    try {
      const safeFormat = formatString.replace(/DD/g, 'dd').replace(/YYYY/g, 'yyyy');
      return format(new Date(date), safeFormat);
    } catch {
      return format(new Date(date), 'dd/MM/yyyy');
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return 'success';
      case 'PENDING':
        return 'secondary';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Button
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        sx={{ mb: 3, textTransform: 'none', borderRadius: '12px' }}
      >
        Back
      </Button>

      <Card
        elevation={6}
        sx={{
          borderRadius: 3,

          backgroundColor: theme.palette.primary.light + '10',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Customer Details
            </Typography>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : customer ? (
            <Stack spacing={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Basic Information
                </Typography>
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <DetailItem label="Full Name" value={customer.fullName} />
                  <DetailItem label="Phone" value={customer.phone} />
                  <DetailItem label="ID Number" value={customer.idNumber} />
                </Stack>
              </Box>

              <Divider />

              {/* Personal Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Personal Details
                </Typography>
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <DetailItem label="Date of Birth" value={customer.dob ? formatDate(customer.dob, APP_LOCAL_DATE_FORMAT) : 'N/A'} />
                  <DetailItem label="Address" value={customer.address} />
                  <DetailItem
                    label="KYC Status"
                    value={
                      <Chip
                        label={customer.kycStatus || 'Unknown'}
                        size="small"
                        color={getKycStatusColor(customer.kycStatus)}
                        variant="outlined"
                      />
                    }
                  />
                </Stack>
              </Box>

              <Divider />

              {/* System Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  System Information
                </Typography>
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <DetailItem label="Created At" value={customer.createdAt ? formatDate(customer.createdAt, 'dd/MM/yyyy HH:mm') : 'N/A'} />
                  <DetailItem label="Partner ID" value={customer.partner?.id || 'N/A'} />
                  <DetailItem label="Customer ID" value={customer.id} />
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No customer data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ minWidth: 200 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
      {value || '—'}
    </Typography>
  </Box>
);

export default CustomerDetail;
