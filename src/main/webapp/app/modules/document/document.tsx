import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  TableSortLabel,
  IconButton,
  CircularProgress,
  Alert,
  Modal,
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

import { GlobalStyles, useMediaQuery } from '@mui/material';
import { getPaginationState } from 'react-jhipster';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from './document.reducer';
import { APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import DocumentUpdateCard from './document-update';

export const Document = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [selectedDocumentIdForEdit, setSelectedDocumentIdForEdit] = useState<string | null>(null);

  const documentList = useAppSelector(state => state.document.entities);
  const loading = useAppSelector(state => state.document.loading);
  const totalItems = useAppSelector(state => state.document.totalItems);

  const getAllEntities = () => {
    dispatch(
      getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(pageLocation.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [pageLocation.search]);

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = (event, value) =>
    setPaginationState({
      ...paginationState,
      activePage: value,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const handleCreateDocument = () => {
    setSelectedDocumentIdForEdit(null);
    setShowUpdateCard(true);
  };

  const handleEditDocument = (documentId: string) => {
    setSelectedDocumentIdForEdit(documentId);
    setShowUpdateCard(true);
  };

  const handleCloseUpdateCard = () => {
    setShowUpdateCard(false);
    setSelectedDocumentIdForEdit(null);
  };

  const handleUpdateSuccess = () => {
    getAllEntities();
  };

  const getSortDirection = order => (order === DESC ? 'desc' : 'asc');

  const formatDate = (date, formatString) => {
    try {
      const safeFormat = formatString.replace(/DD/g, 'dd').replace(/YYYY/g, 'yyyy');
      return format(new Date(date), safeFormat);
    } catch (error) {
      return format(new Date(date), 'dd/MM/yyyy');
    }
  };

  return (
    <Paper variant="elevation" sx={{ px: 2, paddingRight: '5%', paddingLeft: '5%' }}>
      <Box sx={{ boxShadow: '12px', paddingTop: '2%', paddingBottom: '2%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Documents
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleSyncList}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: '12px',
                borderColor: theme.palette.grey[300],
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.light,
                  borderColor: theme.palette.grey[400],
                },
                '& .MuiSvgIcon-root': {
                  animation: loading ? 'spin 2s linear infinite' : 'none',
                },
              }}
            >
              {!isMobile && 'Refresh'}
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateDocument}
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
              {!isMobile && 'Add Document'}
            </Button>
          </Stack>
        </Stack>

        <Modal
          open={showUpdateCard}
          onClose={handleCloseUpdateCard}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
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
              <DocumentUpdateCard
                documentId={selectedDocumentIdForEdit}
                isOpen={showUpdateCard}
                onClose={handleCloseUpdateCard}
                onSuccess={handleUpdateSuccess}
              />
            )}
          </Box>
        </Modal>

        <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Table size="small" sx={{ '& td, & th': { padding: '6px 8px', fontSize: '0.75rem' } }}>
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                {['id', 'fileUrl', 'qualityScore', 'issues', 'createdAt'].map(col => (
                  <TableCell key={col} sx={{ whiteSpace: 'nowrap' }}>
                    <TableSortLabel
                      active={paginationState.sort === col}
                      direction={getSortDirection(paginationState.order)}
                      onClick={sort(col)}
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                      {paginationState.sort === col &&
                        (paginationState.order === DESC ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Customer</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : documentList && documentList.length > 0 ? (
                documentList.map((document, i) => (
                  <TableRow
                    key={`entity-${i}`}
                    hover
                    sx={{
                      transition: 'background-color 0.2s ease',
                      '&:hover': { backgroundColor: theme.palette.grey[100] },
                    }}
                  >
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/document/${document.id}`}
                        sx={{ textTransform: 'none', color: theme.palette.primary.main, fontSize: 16 }}
                      >
                        {document.id}
                      </Button>
                    </TableCell>
                    <TableCell>{document.fileUrl}</TableCell>
                    <TableCell>{document.qualityScore}</TableCell>
                    <TableCell>{document.issues}</TableCell>
                    <TableCell>{document.createdAt ? formatDate(document.createdAt, APP_LOCAL_DATE_FORMAT) : null}</TableCell>
                    <TableCell>
                      {document.customer ? <Link to={`/customer/${document.customer.id}`}>{document.customer.id}</Link> : ''}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          component={Link}
                          to={`/document/${document.id}`}
                          size="small"
                          color="primary"
                          sx={{
                            '&:hover': {
                              backgroundColor: theme.palette.primary.light + '20',
                            },
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton onClick={() => handleEditDocument(document.id.toString())} size="small" color="default">
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/document/${document.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                          size="small"
                          color="default"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
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
                      No documents found
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalItems > 0 && (
          <>
            <GlobalStyles
              styles={{
                '.MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                },
                '.MuiPaginationItem-root.Mui-selected:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalItems / paginationState.itemsPerPage)}
                page={paginationState.activePage}
                onChange={handlePagination}
                color="primary"
                variant="outlined"
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default Document;
