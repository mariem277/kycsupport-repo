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
  Chip,
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
  Search as SearchIcon,
} from '@mui/icons-material';
import { format, isAfter, isBefore } from 'date-fns';
import { useTheme } from '@mui/material/styles';

import { GlobalStyles, useMediaQuery } from '@mui/material';
import Modal from '@mui/material/Modal';
import { JhiPagination, getPaginationState } from 'react-jhipster';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from './customer.reducer';
import { APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import CustomerDetailsCard from './customer-detail';
import CustomerUpdateCard from './customer-update';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export const Customer = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsCard, setShowDetailsCard] = useState(false);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState({
    fullName: '',
    address: '',
    idNumber: '',
    phone: '',
    kycStatus: '',
    createdAtStart: null,
    createdAtEnd: null,
  });

  const [selectedCustomerIdForEdit, setSelectedCustomerIdForEdit] = useState<string | null>(null);

  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const customerList = useAppSelector(state => state.customer.entities);
  const loading = useAppSelector(state => state.customer.loading);
  const totalItems = useAppSelector(state => state.customer.totalItems);

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

  const filteredCustomers = customerList.filter(customer => {
    const matchesFullName = customer.fullName?.toLowerCase().includes(filters.fullName.toLowerCase());
    const matchesAddress = customer.address?.toLowerCase().includes(filters.address.toLowerCase());
    const matchesIdNumber = customer.idNumber?.toLowerCase().includes(filters.idNumber.toLowerCase());
    const matchesPhone = customer.phone?.toLowerCase().includes(filters.phone.toLowerCase());

    const matchesKyc = filters.kycStatus === '' || customer.kycStatus?.toLowerCase() === filters.kycStatus.toLowerCase();

    const createdAtDate = normalizeDateOnly(customer.createdAt);
    const createdAtStart = normalizeDateOnly(filters.createdAtStart);
    const createdAtEnd = normalizeDateOnly(filters.createdAtEnd);

    const matchesCreatedAt =
      (!createdAtStart || (createdAtDate && createdAtDate >= createdAtStart)) &&
      (!createdAtEnd || (createdAtDate && createdAtDate <= createdAtEnd));

    return matchesFullName && matchesAddress && matchesIdNumber && matchesPhone && matchesKyc && matchesCreatedAt;
  });

  // Function to handle viewing customer details
  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowDetailsCard(true);
  };

  // Function to close details card
  const handleCloseDetailsCard = () => {
    setShowDetailsCard(false);
    setSelectedCustomerId(null);
  };
  const handleEditCustomer = (customerId: string) => {
    setSelectedCustomerIdForEdit(customerId);
    setShowUpdateCard(true);
  };

  const handleCreateCustomer = () => {
    setSelectedCustomerIdForEdit(null); // null means create new
    setShowUpdateCard(true);
  };

  const handleCloseUpdateCard = () => {
    setShowUpdateCard(false);
    setSelectedCustomerIdForEdit(null);
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
    <Paper variant="elevation" sx={{ px: 2, paddingRight: '5%', paddingLeft: '5%' }}>
      <Box sx={{ boxShadow: '12px', paddingTop: '2%', paddingBottom: '2%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Customers
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
              onClick={handleCreateCustomer}
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
              {!isMobile && 'Add Customer'}
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
              Filter Customers
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Full Name"
                value={filters.fullName}
                onChange={e => setFilters({ ...filters, fullName: e.target.value })}
                sx={{
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
                }}
              />
              <TextField
                label="Address"
                value={filters.address}
                onChange={e => setFilters({ ...filters, address: e.target.value })}
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
              <TextField
                label="Phone"
                value={filters.phone}
                onChange={e => setFilters({ ...filters, phone: e.target.value })}
                sx={{
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
                }}
              />
              <TextField
                select
                label="KYC Status"
                value={filters.kycStatus}
                onChange={e => setFilters({ ...filters, kycStatus: e.target.value })}
                SelectProps={{ native: true }}
                sx={{
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
                }}
              >
                <option value=""> </option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </TextField>
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
                      fullName: '',
                      address: '',
                      idNumber: '',
                      phone: '',
                      kycStatus: '',
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
              <CustomerUpdateCard
                customerId={selectedCustomerIdForEdit}
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
                {['id', 'fullName', 'dob', 'createdAt'].map(col => (
                  <TableCell key={col} sx={{ whiteSpace: 'nowrap' }}>
                    <TableSortLabel
                      active={paginationState.sort === col}
                      direction={getSortDirection(paginationState.order)}
                      onClick={sort(col)}
                    >
                      {col === 'dob' ? 'Date of Birth' : col === 'createdAt' ? 'Created At' : col.charAt(0).toUpperCase() + col.slice(1)}
                      {paginationState.sort === col &&
                        (paginationState.order === DESC ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />)}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>ID Number</TableCell>
                <TableCell>KYC Status</TableCell>

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
              ) : customerList && customerList.length > 0 ? (
                filteredCustomers.map((customer, i) => (
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
                        to={`/customer/${customer.id}`}
                        sx={{ textTransform: 'none', color: theme.palette.primary.main, fontSize: 16 }}
                      >
                        {customer.id}
                      </Button>
                    </TableCell>
                    <TableCell>{customer.fullName}</TableCell>
                    <TableCell>{customer.dob ? formatDate(customer.dob, APP_LOCAL_DATE_FORMAT) : null}</TableCell>
                    <TableCell>{customer.createdAt ? formatDate(customer.createdAt, 'dd/MM/yyyy HH:mm') : null}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 100,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={customer.address}
                    >
                      {customer.address}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.idNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.kycStatus || 'Unknown'}
                        size="small"
                        color={getKycStatusColor(customer.kycStatus)}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          component={Link}
                          to={`/customer/${customer.id}`}
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
                        <IconButton onClick={() => handleEditCustomer(customer.id.toString())} size="small" color="default">
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/customer/${customer.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
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

        {/* Pagination remains the same */}
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
      </Box>
    </Paper>
  );
};
