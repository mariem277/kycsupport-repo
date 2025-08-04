import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './face-match.reducer';
import { Box, Card, CardContent, CircularProgress, Paper, Stack, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { format } from 'date-fns';

export const FaceMatchDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();
  const navigate = useNavigate();
  const theme = useTheme();

  const loading = useAppSelector(state => state.customer.loading);
  const faceMatchEntity = useAppSelector(state => state.faceMatch.entity);

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const formatDate = (date: string, formatString: string) => {
    try {
      const safeFormat = formatString.replace(/DD/g, 'dd').replace(/YYYY/g, 'yyyy');
      return format(new Date(date), safeFormat);
    } catch {
      return format(new Date(date), 'dd/MM/yyyy');
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
      <Card elevation={6} sx={{ borderRadius: 3, backgroundColor: theme.palette.primary.light + '10' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Face Match Details
            </Typography>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                maxWidth: 600,
                mx: 'auto',
                bgcolor: '#fff',
              }}
            >
              {/* Top Section - Centered Circle */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.light', width: 60, height: 60 }} />
              </Box>

              {/* Card Section using Stack instead of Grid */}
              <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
                <Box sx={{ flex: 1, maxWidth: '45%', maxHeight: '50vh' }}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={`/api/files/${faceMatchEntity.selfieUrl}`}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Paper>
                </Box>
                <Box sx={{ flex: 1, maxWidth: '45%', maxHeight: '50vh' }}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={`/api/files/${faceMatchEntity.idPhotoUrl}`}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Paper>
                </Box>
              </Stack>

              {/* Bottom Section - Info Text */}
              <Box sx={{ borderTop: '1px solid black', pt: 1 }}>
                <DetailItem label="Customer ID" value={faceMatchEntity.customer ? faceMatchEntity.customer.id : ''} />
                <DetailItem
                  label="Created at:"
                  value={faceMatchEntity.createdAt ? formatDate(faceMatchEntity.createdAt, 'dd/MM/yyyy HH:mm') : 'N/A'}
                />
              </Box>
            </Box>
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
export default FaceMatchDetail;
