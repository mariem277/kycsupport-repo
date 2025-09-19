import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  ChevronRight as NextIcon,
  ChevronLeft as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as CheckCircleOutlineIcon, // NEW
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'; // useWatch is new
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { KycStatus } from 'app/shared/model/enumerations/kyc-status.model';
import { createEntity as createCustomer } from './customer.reducer';
import axios from 'axios';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
interface CustomerWithDocumentsCreateCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Type for the overall form data
type DocumentData = {
  id?: string;
  fileUrl?: string; // This will store the object name from the upload API
  qualityScore?: string;
  issues?: string;
  fileName?: string; // To display the original file name
  fileType: 'IMAGE' | 'TEXT'; // New field to distinguish document type
  content?: string; // For text documents
  // Any other fields specific to your Document entity
};

type CustomerWithDocumentsFormValues = {
  // Step 1: Customer Information
  fullName: string;
  phone: string;
  dob: string | null;
  idNumber: string;
  address: string;
  kycStatus: KycStatus; // Default to PENDING initially

  // Step 2: CIN Document
  cinFile?: FileList | null;
  cinDocument: DocumentData; // Object to hold CIN details after upload/analysis
  cinVerificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  cinVerificationMessage?: string;

  // Step 3: Other Documents
  otherDocuments: DocumentData[]; // Array of other documents
};

const defaultDocumentData: DocumentData = {
  fileUrl: '',
  qualityScore: '',
  issues: '',
  fileName: '',
  fileType: 'IMAGE', // Default to image for other docs
  content: '',
};

export const CustomerWithDocumentsCreateCard: React.FC<CustomerWithDocumentsCreateCardProps> = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Overall form submission status

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger, // To manually trigger validation
    formState: { errors, isValid },
  } = useForm<CustomerWithDocumentsFormValues>({
    mode: 'onTouched', // Validate on blur or change
    shouldUnregister: true,
    defaultValues: {
      fullName: '',
      phone: '',
      dob: null,
      idNumber: '',
      address: '',
      kycStatus: KycStatus.PENDING,
      cinDocument: defaultDocumentData,
      cinVerificationStatus: 'PENDING',
      cinVerificationMessage: '',
      otherDocuments: [], // Initialize as an empty array
    },
  });

  // For managing the dynamic "other documents"
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherDocuments',
  });

  // Watch for changes in CIN file input
  const cinFile = useWatch({ control, name: 'cinFile' });
  const cinVerificationStatus = useWatch({ control, name: 'cinVerificationStatus' });
  const cinVerificationMessage = useWatch({ control, name: 'cinVerificationMessage' });
  // --- Step Content Definitions ---
  const steps = ['Customer Information', 'Add CIN', 'Add Other Documents'];

  const handleNext = async () => {
    let stepIsValid = true;
    if (activeStep === 0) {
      stepIsValid = await trigger(['fullName', 'phone', 'dob', 'idNumber', 'address']);
    } else if (activeStep === 1) {
      stepIsValid = await trigger(['cinDocument.fileUrl', 'cinDocument.qualityScore', 'cinDocument.issues']);
      // Also ensure CIN verification is done and successful before moving on
      const cinVerification = getValues('cinVerificationStatus');
      if (cinVerification !== 'VERIFIED') {
        alert('Please verify CIN information before proceeding.');
        stepIsValid = false;
      }
    }

    if (stepIsValid) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  // --- API INTERACTION FUNCTIONS ---

  // Handle CIN File Upload and Analysis
  const handleCinFileUploadAndAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('cinFile', e.target.files); // Store the FileList in the form state
      setValue('cinDocument.fileName', file.name);
      setValue('cinDocument.fileType', 'IMAGE');
      setValue('cinDocument.qualityScore', 'Analyzing...');
      setValue('cinDocument.issues', '');
      setValue('cinVerificationStatus', 'PENDING');
      setValue('cinVerificationMessage', 'Uploading and analyzing CIN...');

      const formData = new FormData();
      formData.append('file', file);

      try {
        // 1. Upload the file
        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newFileUrl = uploadResponse.data.fileUrl; // Assuming your API returns { fileUrl: "..." }
        setValue('cinDocument.fileUrl', newFileUrl);

        // 2. Analyze the image
        const analysisResponse = await axios.post('/api/image-analysis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setValue('cinDocument.qualityScore', analysisResponse.data.qualityScore.toString());
        setValue('cinDocument.issues', analysisResponse.data.issues?.join(', ') || 'No issues found.');
        setValue('cinVerificationMessage', 'CIN analysis complete. Please proceed to verify.');
        trigger(['cinDocument.qualityScore', 'cinDocument.issues']); // Trigger validation for these fields
      } catch (error) {
        console.error('Error during CIN file upload or analysis:', error);
        setValue('cinDocument.qualityScore', 'Error');
        setValue('cinDocument.issues', 'Could not process CIN image.');
        setValue('cinVerificationMessage', 'Failed to upload or analyze CIN. Please try again.');
        setValue('cinDocument.fileUrl', ''); // Clear fileUrl on error
      }
    }
  };

  // Handle CIN Information Verification
  const handleCinInformationVerification = async () => {
    const customerInfo = getValues(['fullName', 'idNumber']);
    const cinDoc = getValues('cinDocument');

    if (!cinDoc.fileUrl || !getValues('fullName') || !getValues('idNumber')) {
      setValue('cinVerificationMessage', 'Please provide customer information and upload CIN first.');
      setValue('cinVerificationStatus', 'REJECTED');
      return;
    }

    setValue('cinVerificationStatus', 'PENDING');
    setValue('cinVerificationMessage', 'Verifying CIN against customer information...');

    try {
      // This is the new API call you mentioned for CIN verification
      // You'll need to confirm the exact endpoint and payload.
      // Assuming it takes customer info and the fileUrl/content of the CIN
      const verificationResponse = await axios.post('/api/customer-cin-verification', {
        customerFullName: getValues('fullName'),
        customerIdNumber: getValues('idNumber'),
        cinDocumentUrl: cinDoc.fileUrl, // or cinDoc.content if it's text-based
        // Potentially pass analysis results too
        cinQualityScore: cinDoc.qualityScore,
        cinIssues: cinDoc.issues,
      });

      if (verificationResponse.data.isVerified) {
        setValue('cinVerificationStatus', 'VERIFIED');
        setValue('cinVerificationMessage', verificationResponse.data.message || 'CIN information verified successfully!');
      } else {
        setValue('cinVerificationStatus', 'REJECTED');
        setValue('cinVerificationMessage', verificationResponse.data.message || 'CIN verification failed. Mismatch or issues found.');
      }
    } catch (error) {
      console.error('Error during CIN verification:', error);
      setValue('cinVerificationStatus', 'REJECTED');
      setValue('cinVerificationMessage', 'An error occurred during CIN verification.');
    }
  };

  // Handle Other Document Upload/Content and Analysis
  const handleOtherDocumentProcess = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: 'file' | 'text',
  ) => {
    if (type === 'file') {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setValue(`otherDocuments.${index}.fileName`, file.name);
        setValue(`otherDocuments.${index}.fileType`, 'IMAGE');
        setValue(`otherDocuments.${index}.qualityScore`, 'Analyzing...');
        setValue(`otherDocuments.${index}.issues`, '');

        const formData = new FormData();
        formData.append('file', file);

        try {
          // 1. Upload the file
          const uploadResponse = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const newFileUrl = uploadResponse.data.fileUrl;
          setValue(`otherDocuments.${index}.fileUrl`, newFileUrl);

          // 2. Analyze the image
          const analysisResponse = await axios.post('/api/image-analysis', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setValue(`otherDocuments.${index}.qualityScore`, analysisResponse.data.qualityScore.toString());
          setValue(`otherDocuments.${index}.issues`, analysisResponse.data.issues?.join(', ') || 'No issues found.');
        } catch (error) {
          console.error('Error during other document file upload or analysis:', error);
          setValue(`otherDocuments.${index}.qualityScore`, 'Error');
          setValue(`otherDocuments.${index}.issues`, 'Could not process image.');
          setValue(`otherDocuments.${index}.fileUrl`, ''); // Clear fileUrl on error
        }
      }
    } else if (type === 'text') {
      const content = (event.target as HTMLTextAreaElement).value;
      setValue(`otherDocuments.${index}.content`, content);
      setValue(`otherDocuments.${index}.fileType`, 'TEXT');
      setValue(`otherDocuments.${index}.fileName`, `Text Document ${index + 1}`); // Provide a generic name

      if (content.trim().length > 0) {
        setValue(`otherDocuments.${index}.qualityScore`, 'Analyzing...');
        setValue(`otherDocuments.${index}.issues`, '');

        try {
          // Assuming a text analysis API
          const analysisResponse = await axios.post('/api/text-analysis', { text: content });
          setValue(`otherDocuments.${index}.qualityScore`, analysisResponse.data.score?.toString() || 'N/A');
          setValue(`otherDocuments.${index}.issues`, analysisResponse.data.issues?.join(', ') || 'No issues found.');
        } catch (error) {
          console.error('Error during text analysis:', error);
          setValue(`otherDocuments.${index}.qualityScore`, 'Error');
          setValue(`otherDocuments.${index}.issues`, 'Could not process text.');
        }
      } else {
        setValue(`otherDocuments.${index}.qualityScore`, '');
        setValue(`otherDocuments.${index}.issues`, '');
      }
    }
  };

  // --- FINAL SUBMISSION ---
  const onSubmit = async (data: CustomerWithDocumentsFormValues) => {
    setIsSubmittingForm(true);
    // eslint-disable-next-line no-console
    console.log('Final form submission data:', data);

    try {
      // Structure data for the final API call
      const finalCustomerData = {
        fullName: data.fullName,
        phone: data.phone,
        dob: data.dob ? dayjs(data.dob).toISOString() : null,
        idNumber: data.idNumber,
        address: data.address,
        kycStatus: data.kycStatus,
        // Any other customer fields
      };

      const documentsToSave = [];

      // Add CIN document
      if (data.cinDocument.fileUrl) {
        documentsToSave.push({
          fileUrl: data.cinDocument.fileUrl,
          qualityScore: data.cinDocument.qualityScore,
          issues: data.cinDocument.issues,
          fileName: data.cinDocument.fileName,
          fileType: data.cinDocument.fileType,
          // content: not applicable for CIN as it's an image
          documentType: 'CIN', // Custom type to distinguish
        });
      }

      // Add other documents
      data.otherDocuments.forEach(doc => {
        if (doc.fileUrl || doc.content) {
          documentsToSave.push({
            fileUrl: doc.fileUrl,
            qualityScore: doc.qualityScore,
            issues: doc.issues,
            fileName: doc.fileName,
            fileType: doc.fileType,
            content: doc.content,
            documentType: 'OTHER', // Custom type for other docs
          });
        }
      });

      // Assuming a new API endpoint for combined customer and document creation
      // Example: POST /api/customers-with-documents
      const createResponse = await axios.post('/api/customers-with-documents', {
        customer: finalCustomerData,
        documents: documentsToSave,
      });

      // Handle success

      onSuccess?.(); // Trigger refresh of main customer list
      onClose(); // Close the modal
      reset(); // Reset form
    } catch (error) {
      alert('Failed to create customer and documents. Please try again.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // --- RENDER FUNCTION ---
  return (
    <Card
      elevation={6}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: '80%', md: '70%', lg: '60%' }, // Responsive width
        borderRadius: 3,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
            Create Customer with Documents
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {/* Step 1: Customer Information */}
                {index === 0 && (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <Controller
                          name="fullName"
                          control={control}
                          rules={{ required: 'Full Name is required.' }}
                          render={({ field, fieldState }) => (
                            <TextField
                              label="Full Name"
                              fullWidth
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              value={field.value}
                              onChange={field.onChange}
                              inputRef={field.ref}
                            />
                          )}
                        />
                        <Controller
                          name="phone"
                          control={control}
                          rules={{ required: 'Phone is required.' }}
                          render={({ field, fieldState }) => (
                            <TextField
                              label="Phone"
                              fullWidth
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              value={field.value}
                              onChange={field.onChange}
                              inputRef={field.ref}
                            />
                          )}
                        />
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <Controller
                          name="dob"
                          control={control}
                          rules={{ required: 'Date of Birth is required.' }}
                          render={({ field, fieldState }) => (
                            <DatePicker
                              label="Date of Birth"
                              value={field.value ? new Date(field.value) : null}
                              onChange={date => field.onChange(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  InputLabelProps: { shrink: true },
                                  error: !!fieldState.error,
                                  helperText: fieldState.error?.message,
                                },
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="idNumber"
                          control={control}
                          rules={{ required: 'ID Number is required.' }}
                          render={({ field, fieldState }) => (
                            <TextField
                              label="ID Number"
                              value={field.value}
                              onChange={field.onChange}
                              inputRef={field.ref}
                              fullWidth
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                            />
                          )}
                        />
                      </Stack>
                      <Controller
                        name="address"
                        control={control}
                        rules={{ required: 'Address is required.' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            label="Address"
                            multiline
                            rows={2}
                            fullWidth
                            value={field.value}
                            onChange={field.onChange}
                            inputRef={field.ref}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Stack>
                  </LocalizationProvider>
                )}

                {/* Step 2: Add CIN */}
                {index === 1 && (
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Upload CIN Document
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="cin-file-upload"
                      type="file"
                      onChange={handleCinFileUploadAndAnalysis}
                    />
                    <label htmlFor="cin-file-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} disabled={isSubmittingForm}>
                        Upload CIN Image
                      </Button>
                    </label>

                    {getValues('cinDocument.fileName') && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">**File:** {getValues('cinDocument.fileName')}</Typography>
                        <Typography variant="body2">
                          **Quality Score:**{' '}
                          {getValues('cinDocument.qualityScore') === 'Analyzing...' ? (
                            <LinearProgress sx={{ width: 100 }} />
                          ) : (
                            getValues('cinDocument.qualityScore')
                          )}
                        </Typography>
                        <Typography variant="body2">**Issues:** {getValues('cinDocument.issues')}</Typography>
                        <Chip
                          label={cinVerificationStatus}
                          icon={
                            getValues('cinVerificationStatus') === 'VERIFIED' ? (
                              <CheckCircleOutlineIcon />
                            ) : getValues('cinVerificationStatus') === 'REJECTED' ? (
                              <ErrorOutlineIcon />
                            ) : undefined
                          }
                          color={
                            getValues('cinVerificationStatus') === 'VERIFIED'
                              ? 'success'
                              : getValues('cinVerificationStatus') === 'REJECTED'
                                ? 'error'
                                : 'info'
                          }
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {cinVerificationMessage}
                        </Typography>
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCinInformationVerification}
                      startIcon={<CheckCircleOutlineIcon />}
                      disabled={
                        !getValues('cinDocument.fileUrl') || // No file uploaded
                        getValues('cinDocument.qualityScore') === 'Analyzing...' || // Still analyzing
                        getValues('cinVerificationStatus') === 'VERIFIED' || // Already verified
                        isSubmittingForm // Overall form is submitting
                      }
                      sx={{ mt: 2 }}
                    >
                      Verify CIN Information
                    </Button>
                  </Stack>
                )}

                {/* Step 3: Add Other Documents */}
                {index === 2 && (
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Add Other Supporting Documents
                    </Typography>
                    {fields.map((item, docIndex) => (
                      <Card key={item.id} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                        <IconButton onClick={() => remove(docIndex)} size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                          Document {docIndex + 1}
                        </Typography>
                        <Stack spacing={2}>
                          <Controller
                            name={`otherDocuments.${docIndex}.fileType`}
                            control={control}
                            render={({ field }) => (
                              <TextField {...field} select label="Document Type" fullWidth SelectProps={{ native: true }}>
                                <option value="IMAGE">Image</option>
                                <option value="TEXT">Text</option>
                              </TextField>
                            )}
                          />

                          {getValues(`otherDocuments.${docIndex}.fileType`) === 'IMAGE' ? (
                            <>
                              <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id={`other-doc-upload-${docIndex}`}
                                type="file"
                                onChange={e => handleOtherDocumentProcess(docIndex, e, 'file')}
                              />
                              <label htmlFor={`other-doc-upload-${docIndex}`}>
                                <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                                  Upload Image
                                </Button>
                              </label>
                              {getValues(`otherDocuments.${docIndex}.fileName`) && (
                                <Box>
                                  <Typography variant="body2">**File:** {getValues(`otherDocuments.${docIndex}.fileName`)}</Typography>
                                  <Typography variant="body2">
                                    **Quality Score:** {getValues(`otherDocuments.${docIndex}.qualityScore`)}
                                  </Typography>
                                  <Typography variant="body2">**Issues:** {getValues(`otherDocuments.${docIndex}.issues`)}</Typography>
                                </Box>
                              )}
                            </>
                          ) : (
                            <Controller
                              name={`otherDocuments.${docIndex}.content`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Document Content (Text)"
                                  multiline
                                  rows={4}
                                  fullWidth
                                  onChange={e => handleOtherDocumentProcess(docIndex, e, 'text')}
                                />
                              )}
                            />
                          )}
                        </Stack>
                      </Card>
                    ))}
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => append(defaultDocumentData)} sx={{ mt: 2 }}>
                      Add Another Document
                    </Button>
                  </Stack>
                )}

                {/* Navigation Buttons for each step */}
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Button
                    color="inherit"
                    disabled={activeStep === 0 || isSubmittingForm}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                    startIcon={<BackIcon />}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit(onSubmit)}
                      startIcon={<SaveIcon />}
                      disabled={isSubmittingForm || getValues('cinVerificationStatus') !== 'VERIFIED'}
                      sx={{
                        backgroundColor: theme.palette.success.main,
                        '&:hover': {
                          backgroundColor: theme.palette.success.dark,
                        },
                      }}
                    >
                      {isSubmittingForm ? 'Saving All...' : 'Save All Data'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext} endIcon={<NextIcon />} disabled={isSubmittingForm}>
                      Next
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {isSubmittingForm && (
          <Box sx={{ width: '100%', mt: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Processing request, please wait...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
