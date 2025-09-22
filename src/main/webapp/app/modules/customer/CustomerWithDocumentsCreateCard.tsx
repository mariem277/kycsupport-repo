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
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural'; // New icon
import GavelIcon from '@mui/icons-material/Gavel';

interface CustomerWithDocumentsCreateCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Type for the overall form data
export type DocumentData = {
  id?: string;
  fileUrl?: string; // This will store the object name from the upload API
  qualityScore?: string;
  issues?: string;
  fileName?: string; // To display the original file name
  fileType: 'IMAGE' | 'TEXT'; // New field to distinguish document type
  content?: string; // For text documents
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_APPLICABLE'; // New
  verificationMessage?: string; // New
};

export type CustomerWithDocumentsFormValues = {
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
  verificationStatus: 'NOT_APPLICABLE', // Default
  verificationMessage: '', // New
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
  const supportingDocuments = useWatch({ control, name: 'otherDocuments' });

  // --- Step Content Definitions ---
  const steps = ['Customer Information', 'Add CIN', 'Add Other Documents'];

  const handleNext = async () => {
    let stepIsValid = true;
    if (activeStep === 0) {
      stepIsValid = await trigger(['fullName', 'phone', 'dob', 'idNumber', 'address']);
      const customerFullName = getValues('fullName');
      const customerIdNumber = getValues('idNumber');
      const customerDob = getValues('dob');
      // eslint-disable-next-line no-console
      console.log('customerFullName:', customerFullName, ' (Type:', typeof customerFullName, ')');
      // eslint-disable-next-line no-console
      console.log('customerIdNumber:', customerIdNumber, ' (Type:', typeof customerIdNumber, ')');
      // eslint-disable-next-line no-console
      console.log('customerDob:', customerDob, ' (Type:', typeof customerDob, ')');
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

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          // Remove the data:image/jpeg;base64, prefix
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to Base64.'));
        }
      };

      reader.onerror = errorEvent => {
        const message = errorEvent.target?.error?.message || 'An error occurred while reading the file.';
        reject(new Error(message));
      };
    });
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
    const customerInfo = getValues(['fullName', 'idNumber', 'dob']);
    const cinDoc = getValues('cinDocument');
    const cinFileFromState = getValues('cinFile')?.[0]; // Get the actual File object

    const customerFullName = getValues('fullName');
    const customerIdNumber = getValues('idNumber');
    const customerDob = getValues('dob');
    // eslint-disable-next-line no-console
    console.log('customerFullName:', customerFullName, ' (Type:', typeof customerFullName, ')');
    // eslint-disable-next-line no-console
    console.log('customerIdNumber:', customerIdNumber, ' (Type:', typeof customerIdNumber, ')');
    // eslint-disable-next-line no-console
    console.log('customerDob:', customerDob, ' (Type:', typeof customerDob, ')');
    // eslint-disable-next-line no-console
    console.log('cinFileFromState:', cinFileFromState, ' (Is File object:', cinFileFromState instanceof File, ')');
    if (!cinFileFromState || !getValues('fullName') || !getValues('idNumber') || !getValues('dob')) {
      setValue('cinVerificationMessage', 'Please provide customer information (Full Name, ID, DOB) and upload CIN first.');
      setValue('cinVerificationStatus', 'REJECTED');
      return;
    }

    setValue('cinVerificationStatus', 'PENDING');
    setValue('cinVerificationMessage', 'Verifying CIN against customer information...');

    try {
      const base64Image = await fileToBase64(cinFileFromState);

      // Format dob for the backend (YYYY/MM/DD)
      const formattedDob = getValues('dob') ? dayjs(getValues('dob')).format('YYYY/MM/DD') : '';

      const verificationPayload = {
        fullName: getValues('fullName'),
        idNumber: getValues('idNumber'),
        dateOfBirth: formattedDob, // Use the formatted DOB
        documentImageBase64: base64Image, // Pass the Base64 string
        // The backend `TestUser` also has `id`, `address`, `phoneNumber`, `kycStatus`.
        // You might need to send dummy values for these if the backend requires them,
        // or modify the backend DTO for this specific endpoint.
        // For now, assuming only `fullName`, `idNumber`, `dateOfBirth`, `documentImageBase64` are used for verification logic.
        // It might be better to send the current customer's ID if available.
        id: 'temp-id-' + Date.now(), // Provide a temporary ID for the backend
        address: getValues('address'),
        phoneNumber: getValues('phone'),
        kycStatus: 'PENDING', // Initial status
      };

      // This is the API call to your /api/v1/verify-user endpoint
      const verificationResponse = await axios.post('/api/v1/verify-user', verificationPayload);

      if (verificationResponse.data.kycStatus === 'VERIFIED') {
        setValue('cinVerificationStatus', 'VERIFIED');
        setValue('cinVerificationMessage', 'CIN information verified successfully!');
      } else {
        setValue('cinVerificationStatus', 'REJECTED');
        setValue('cinVerificationMessage', 'CIN verification failed. Mismatch or issues found.');
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
    // Reset verification status when document content/file changes
    setValue(`otherDocuments.${index}.verificationStatus`, 'NOT_APPLICABLE');
    setValue(`otherDocuments.${index}.verificationMessage`, '');

    if (type === 'file') {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setValue(`otherDocuments.${index}.fileName`, file.name);
        setValue(`otherDocuments.${index}.qualityScore`, 'Analyzing...');
        setValue(`otherDocuments.${index}.issues`, '');
        setValue(`otherDocuments.${index}.fileUrl`, ''); // Clear for new upload

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
        setValue(`otherDocuments.${index}.fileUrl`, ''); // Clear fileUrl as it's a text doc

        try {
          // Assuming a text analysis API (might be separate from verify-user for content quality)
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

  // Handle Text Document Verification (using /api/v1/verify-user)
  const handleTextDocumentVerification = async (index: number) => {
    const currentDoc = getValues(`otherDocuments.${index}`);
    const customerFullName = getValues('fullName');
    const customerIdNumber = getValues('idNumber');
    const customerDob = getValues('dob');

    if (!customerFullName || !customerIdNumber || !customerDob || !currentDoc.content) {
      setValue(`otherDocuments.${index}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${index}.verificationMessage`, 'Customer info or document content is missing.');
      return;
    }

    setValue(`otherDocuments.${index}.verificationStatus`, 'PENDING');
    setValue(`otherDocuments.${index}.verificationMessage`, 'Verifying text content...');

    try {
      const textBase64 = btoa(unescape(encodeURIComponent(currentDoc.content || '')));
      const formattedDob = customerDob ? dayjs(customerDob).format('YYYY/MM/DD') : '';

      const verificationPayload = {
        fullName: customerFullName,
        idNumber: customerIdNumber,
        dateOfBirth: formattedDob,
        documentImageBase64: textBase64,
        // Assuming backend can accept this for text verification
        id: 'temp-other-doc-id-' + Date.now(),
        address: getValues('address'),
        phoneNumber: getValues('phone'),
        kycStatus: 'PENDING',
      };

      const verificationResponse = await axios.post('/api/v1/verify-user', verificationPayload);

      if (verificationResponse.data.kycStatus === 'VERIFIED') {
        setValue(`otherDocuments.${index}.verificationStatus`, 'VERIFIED');
        setValue(`otherDocuments.${index}.verificationMessage`, 'Text document verified successfully!');
      } else {
        setValue(`otherDocuments.${index}.verificationStatus`, 'REJECTED');
        setValue(`otherDocuments.${index}.verificationMessage`, 'Text verification failed. Mismatch or issues found.');
      }
    } catch (error) {
      console.error(`Error during text document verification for index ${index}:`, error);
      setValue(`otherDocuments.${index}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${index}.verificationMessage`, 'An error occurred during text verification.');
    }
  };

  // Handle Image Document Face Match Verification (using /api/verify_face_match)
  const handleImageDocumentFaceMatch = async (index: number) => {
    const cinFileFromState = getValues('cinFile')?.[0]; // The CIN File object
    const otherDocumentFile = (document.getElementById(`other-doc-upload-${index}`) as HTMLInputElement)?.files?.[0]; // Get the actual File object for the other doc

    if (!cinFileFromState) {
      setValue(`otherDocuments.${index}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${index}.verificationMessage`, 'CIN document not uploaded for comparison.');
      return;
    }
    if (!otherDocumentFile) {
      setValue(`otherDocuments.${index}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${index}.verificationMessage`, 'Other image document not uploaded for verification.');
      return;
    }

    setValue(`otherDocuments.${index}.verificationStatus`, 'PENDING');
    setValue(`otherDocuments.${index}.verificationMessage`, 'Verifying face match with CIN...');

    const formData = new FormData();
    formData.append('img1', cinFileFromState);
    formData.append('img2', otherDocumentFile);

    try {
      const verificationResponse = await axios.post('/api/verify_face_match', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = verificationResponse.data; // Assuming result is directly 'match' or 'no_match' or a JSON with status

      if (result.verified) {
        // Adjust based on your actual API response structure
        setValue(`otherDocuments.${index}.verificationStatus`, 'VERIFIED');
        setValue(`otherDocuments.${index}.verificationMessage`, 'Face match successfully verified!');
      } else {
        setValue(`otherDocuments.${index}.verificationStatus`, 'REJECTED');
        setValue(`otherDocuments.${index}.verificationMessage`, 'Face match failed. No match found or issues.');
      }
    } catch (error) {
      console.error(`Error during face match verification for index ${index}:`, error);
      setValue(`otherDocuments.${index}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${index}.verificationMessage`, 'An error occurred during face match verification.');
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
                {/*
                  Modify conditional rendering here.
                  Instead of `index === 0`, `index === 1`, use `activeStep >= index`
                  and visually hide previous steps.
                */}
                <Box
                  sx={{
                    // Conditionally display or hide
                    display: activeStep === index ? 'block' : 'none',
                    // Keep elements mounted if their index is less than or equal to the active step
                    // This ensures their RHF state remains
                    // For earlier steps, they are still mounted but display: 'none'
                  }}
                >
                  {/* Step 1: Customer Information */}
                  <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Stack spacing={3} sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={2}>
                          <Controller
                            name="fullName"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Full Name is required.' }}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
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
                  </Box>

                  {/* Step 2: Add CIN */}
                  <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
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
                          !getValues('cinFile') || // Changed from fileUrl to cinFile for correct check
                          getValues('cinDocument.qualityScore') === 'Analyzing...' || // Still analyzing
                          getValues('cinVerificationStatus') === 'VERIFIED' || // Already verified
                          isSubmittingForm // Overall form is submitting
                        }
                        sx={{ mt: 2 }}
                      >
                        Verify CIN Information
                      </Button>
                    </Stack>
                  </Box>

                  {/* Step 3: Add Other Documents */}
                  <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
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

                            <input
                              accept="*"
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
                            <Box>
                              <Typography variant="body2">**File:** {getValues(`otherDocuments.${docIndex}.fileName`)}</Typography>
                              <Typography variant="body2">
                                **Quality Score:**{' '}
                                {getValues(`otherDocuments.${docIndex}.qualityScore`) === 'Analyzing...' ? (
                                  <LinearProgress sx={{ width: 100 }} />
                                ) : (
                                  getValues(`otherDocuments.${docIndex}.qualityScore`)
                                )}
                              </Typography>
                              <Typography variant="body2">**Issues:** {getValues(`otherDocuments.${docIndex}.issues`)}</Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Chip
                                label={getValues(`otherDocuments.${docIndex}.verificationStatus`)}
                                icon={
                                  getValues(`otherDocuments.${docIndex}.verificationStatus`) === 'VERIFIED' ? (
                                    <CheckCircleOutlineIcon />
                                  ) : getValues(`otherDocuments.${docIndex}.verificationStatus`) === 'REJECTED' ? (
                                    <ErrorOutlineIcon />
                                  ) : undefined
                                }
                                color={
                                  getValues(`otherDocuments.${docIndex}.verificationStatus`) === 'VERIFIED'
                                    ? 'success'
                                    : getValues(`otherDocuments.${docIndex}.verificationStatus`) === 'REJECTED'
                                      ? 'error'
                                      : getValues(`otherDocuments.${docIndex}.verificationStatus`) === 'PENDING'
                                        ? 'info'
                                        : 'default'
                                }
                                sx={{ mt: 1 }}
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                {getValues(`otherDocuments.${docIndex}.verificationMessage`)}
                              </Typography>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  getValues(`otherDocuments.${docIndex}.fileType`) === 'IMAGE'
                                    ? handleImageDocumentFaceMatch(docIndex)
                                    : handleTextDocumentVerification(docIndex)
                                }
                                startIcon={
                                  getValues(`otherDocuments.${docIndex}.fileType`) === 'IMAGE' ? (
                                    <FaceRetouchingNaturalIcon />
                                  ) : (
                                    <GavelIcon />
                                  )
                                } // Example icons
                                disabled={
                                  isSubmittingForm ||
                                  getValues(`otherDocuments.${docIndex}.verificationStatus`) === 'PENDING' || // Currently verifying
                                  (getValues(`otherDocuments.${docIndex}.fileType`) === 'IMAGE' &&
                                    !getValues(`otherDocuments.${docIndex}.fileUrl`)) ||
                                  getValues('cinVerificationStatus') !== 'VERIFIED' // Cannot verify other documents if CIN is not verified
                                }
                                sx={{ mt: 1 }}
                              >
                                Verify Document
                              </Button>
                            </Box>
                          </Stack>
                        </Card>
                      ))}
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => append(defaultDocumentData)} sx={{ mt: 2 }}>
                        Add Another Document
                      </Button>
                    </Stack>
                  </Box>
                </Box>{' '}
                {/* End of Box for step content */}
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
