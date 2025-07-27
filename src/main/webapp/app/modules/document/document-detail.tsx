import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CircularProgress, Divider, Stack, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './document.reducer';
import { APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const documentEntity = useAppSelector(state => state.document.entity);
  const loading = useAppSelector(state => state.document.loading);

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
              Document Details
            </Typography>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : documentEntity ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Document Information
                </Typography>
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <DetailItem
                    label="File URL"
                    value={
                      documentEntity.fileUrl ? (
                        <a href={`/api/files/${documentEntity.fileUrl}`} target="_blank" rel="noopener noreferrer">
                          {documentEntity.fileUrl}
                        </a>
                      ) : (
                        'N/A'
                      )
                    }
                  />
                  <DetailItem label="Quality Score" value={documentEntity.qualityScore} />
                  <DetailItem label="Issues" value={documentEntity.issues} />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                  System Information
                </Typography>
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <DetailItem
                    label="Created At"
                    value={documentEntity.createdAt ? formatDate(documentEntity.createdAt, 'dd/MM/yyyy HH:mm') : 'N/A'}
                  />
                  <DetailItem label="Customer ID" value={documentEntity.customer?.id || 'N/A'} />
                  <DetailItem label="Document ID" value={documentEntity.id} />
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No document data available
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

export default DocumentDetail;
