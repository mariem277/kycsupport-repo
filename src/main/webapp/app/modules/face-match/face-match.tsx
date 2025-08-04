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
  TextField,
  Drawer,
  GlobalStyles,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { JhiItemCount, JhiPagination, TextFormat, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'date-fns';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './face-match.reducer';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { FaceMatchUpdateCard } from './face-match-update';
import Modal from '@mui/material/Modal';
import Pagination from '@mui/material/Pagination';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const FaceMatch = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedFaceMatchIdForEdit, setSelectedFaceMatchIdForEdit] = useState<string | null>(null);
  const [selectedFaceMatchId, setSelectedFaceMatchId] = useState<string | null>(null);
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [showDetailsCard, setShowDetailsCard] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const faceMatchList = useAppSelector(state => state.faceMatch.entities);
  const loading = useAppSelector(state => state.faceMatch.loading);
  const totalItems = useAppSelector(state => state.faceMatch.totalItems);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState({
    idNumber: '',
    createdAtStart: null,
    createdAtEnd: null,
  });

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

  const normalizeDateOnly = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleViewFaceMatch = (faceMatchId: string) => {
    setSelectedFaceMatchId(faceMatchId);
    setShowDetailsCard(true);
  };
  const handleCloseDetailsCard = () => {
    setShowDetailsCard(false);
    setSelectedFaceMatchId(null);
  };
  const handleEditFaceMatch = (faceMatchId: string) => {
    setSelectedFaceMatchIdForEdit(faceMatchId);
    setShowUpdateCard(true);
  };
  const handleCreateFaceMatch = () => {
    setSelectedFaceMatchIdForEdit(null); // null means create new
    setShowUpdateCard(true);
  };
  const handleCloseUpdateCard = () => {
    setShowUpdateCard(false);
    setSelectedFaceMatchIdForEdit(null);
  };
  const handleOpenImageModal = (url: string) => {
    setModalImageUrl(url);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setModalImageUrl('');
  };
  const handleUpdateSuccess = () => {
    getAllEntities();
  };
  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };
  const filteredFaceMatches = faceMatchList.filter(faceMatch => {
    const matchesIdNumber = (faceMatch.customer?.idNumber?.toString().toLowerCase() ?? '').includes(filters.idNumber.toLowerCase());
    const createdAtDate = normalizeDateOnly(faceMatch.createdAt);
    const createdAtStart = normalizeDateOnly(filters.createdAtStart);
    const createdAtEnd = normalizeDateOnly(filters.createdAtEnd);

    const matchesCreatedAt =
      (!createdAtStart || (createdAtDate && createdAtDate >= createdAtStart)) &&
      (!createdAtEnd || (createdAtDate && createdAtDate <= createdAtEnd));

    return matchesIdNumber && matchesCreatedAt;
  });
  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
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
            Face Matches
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => setShowFilterDrawer(true)}
              disabled={loading}
              startIcon={<SearchIcon />}
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
              {!isMobile && 'Search'}
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateFaceMatch}
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
              {!isMobile && 'Add Face Match'}
            </Button>
          </Stack>
        </Stack>
        <Drawer
          anchor="right"
          open={showFilterDrawer}
          onClose={() => setShowFilterDrawer(false)}
          hideBackdrop
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              top: '130px',
              height: 'calc(100% - 130px)',
            },
          }}
        >
          <Box sx={{ width: 300, padding: 2 }}>
            <Typography variant="h6" sx={{ padding: 1, color: theme.palette.primary.main }}>
              Filter Face Match
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="ID Number"
                value={filters.idNumber}
                onChange={e => setFilters({ ...filters, idNumber: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': {
                    height: 40,
                    fontSize: '0.75rem',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.75rem',
                    padding: '10px 12px', // tweak if needed
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem',
                  },
                }}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Created After"
                  value={filters.createdAtStart}
                  onChange={newDate => setFilters({ ...filters, createdAtStart: newDate })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          height: 40,
                          fontSize: '0.75rem',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '0.75rem',
                          padding: '10px 12px',
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.75rem',
                        },
                      },
                    },
                  }}
                />
                <DatePicker
                  label="Created Before"
                  value={filters.createdAtEnd}
                  onChange={newDate => setFilters({ ...filters, createdAtEnd: newDate })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          height: 40,
                          fontSize: '0.75rem',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '0.75rem',
                          padding: '10px 12px',
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.75rem',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilters({
                      idNumber: '',
                      createdAtStart: null,
                      createdAtEnd: null,
                    });
                    setShowFilterDrawer(false);
                  }}
                >
                  Clear
                </Button>
                <Button variant="contained" onClick={() => setShowFilterDrawer(false)}>
                  Apply
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Drawer>
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
              <FaceMatchUpdateCard
                faceMatchId={selectedFaceMatchIdForEdit}
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
                {['id', 'selfieUrl', 'idPhotoUrl', 'score', 'customer', 'createdAt'].map(col => (
                  <TableCell key={col} sx={{ whiteSpace: 'nowrap' }}>
                    <TableSortLabel
                      active={paginationState.sort === col}
                      direction={getSortDirection(paginationState.order)}
                      onClick={sort(col)}
                    >
                      {col === 'createdAt' ? 'Created At' : col.charAt(0).toUpperCase() + col.slice(1)}
                      {paginationState.sort === col &&
                        (paginationState.order === DESC ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : faceMatchList && faceMatchList.length > 0 ? (
                filteredFaceMatches.map((faceMatch, i) => {
                  // eslint-disable-next-line
                  console.log(`FaceMatch ${i}:`, faceMatch);
                  // eslint-disable-next-line
                  console.log(`→ Customer:`, faceMatch.customer);
                  return (
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
                          to={`/face-match/${faceMatch.id}`}
                          sx={{ textTransform: 'none', color: theme.palette.primary.main, fontSize: 16 }}
                        >
                          {faceMatch.id}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleOpenImageModal(faceMatch.selfieUrl)}
                          disabled={!faceMatch.selfieUrl}
                          variant="outlined"
                        >
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleOpenImageModal(faceMatch.idPhotoUrl)}
                          disabled={!faceMatch.idPhotoUrl}
                          variant="outlined"
                        >
                          View
                        </Button>
                      </TableCell>
                      <TableCell>{faceMatch.score}</TableCell>
                      <TableCell>
                        {faceMatch.customer ? (
                          <Button
                            component={Link}
                            to={`/customer/${faceMatch.customer.id}`}
                            sx={{ textTransform: 'none', color: theme.palette.primary.main, fontSize: 16 }}
                          >
                            {faceMatch.customer.name || faceMatch.customer.idNumber}
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No customer
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{faceMatch.createdAt ? formatDate(faceMatch.createdAt, 'dd/MM/yyyy HH:mm') : null}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton
                            component={Link}
                            to={`/face-match/${faceMatch.id}`}
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

                          <IconButton
                            component={Link}
                            to={`/face-match/${faceMatch.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                            size="small"
                            color="default"
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10}>
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
                      No customers found
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalItems ? (
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
                onChange={(event, value) => handlePagination(value)}
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
        ) : null}
        <Modal
          open={openImageModal}
          onClose={handleCloseImageModal}
          aria-labelledby="image-modal"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 2,
              boxShadow: 24,
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
            }}
          >
            <img src={`/api/files/${modalImageUrl}`} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
          </Box>
        </Modal>
      </Box>
    </Paper>
  );
};
