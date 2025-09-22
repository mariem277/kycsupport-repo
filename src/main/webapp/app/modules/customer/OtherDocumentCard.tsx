import React from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem, // Use MenuItem for select options
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import GavelIcon from '@mui/icons-material/Gavel';
import axios from 'axios';
import dayjs from 'dayjs'; // Ensure dayjs is imported if used for date formatting

// Re-import types needed
import { DocumentData, CustomerWithDocumentsFormValues } from './CustomerWithDocumentsCreateCard'; // Adjust path as needed

interface OtherDocumentCardProps {
  docIndex: number;
  remove: (index: number) => void;
  isSubmittingForm: boolean;
  cinVerificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export const OtherDocumentCard: React.FC<OtherDocumentCardProps> = ({ docIndex, remove, isSubmittingForm, cinVerificationStatus }) => {
  const theme = useTheme();
  const { control, setValue, getValues } = useFormContext<CustomerWithDocumentsFormValues>();

  // Use useWatch to subscribe to changes for *this specific document*
  const documentType = useWatch({ control, name: `otherDocuments.${docIndex}.fileType` });
  const fileName = useWatch({ control, name: `otherDocuments.${docIndex}.fileName` });
  const qualityScore = useWatch({ control, name: `otherDocuments.${docIndex}.qualityScore` });
  const issues = useWatch({ control, name: `otherDocuments.${docIndex}.issues` });
  const fileUrl = useWatch({ control, name: `otherDocuments.${docIndex}.fileUrl` });
  const content = useWatch({ control, name: `otherDocuments.${docIndex}.content` });
  const verificationStatus = useWatch({ control, name: `otherDocuments.${docIndex}.verificationStatus` });
  const verificationMessage = useWatch({ control, name: `otherDocuments.${docIndex}.verificationMessage` });

  // Helper to convert File to Base64 (copy from parent or ensure available)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
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

  // Handle Other Document Upload/Content and Analysis
  const handleOtherDocumentProcess = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: 'file' | 'text') => {
    // Reset verification status when document content/file changes
    setValue(`otherDocuments.${docIndex}.verificationStatus`, 'NOT_APPLICABLE');
    setValue(`otherDocuments.${docIndex}.verificationMessage`, '');
    setValue(`otherDocuments.${docIndex}.qualityScore`, ''); // Clear score on new input
    setValue(`otherDocuments.${docIndex}.issues`, ''); // Clear issues on new input

    if (type === 'file') {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setValue(`otherDocuments.${docIndex}.fileName`, file.name);
        setValue(`otherDocuments.${docIndex}.fileType`, 'IMAGE');
        setValue(`otherDocuments.${docIndex}.qualityScore`, 'Analyzing...');
        setValue(`otherDocuments.${docIndex}.issues`, '');
        setValue(`otherDocuments.${docIndex}.fileUrl`, ''); // Clear for new upload
        setValue(`otherDocuments.${docIndex}.content`, ''); // Clear content for image

        const formData = new FormData();
        formData.append('file', file);

        try {
          // 1. Upload the file
          const uploadResponse = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const newFileUrl = uploadResponse.data.fileUrl;
          setValue(`otherDocuments.${docIndex}.fileUrl`, newFileUrl);

          // 2. Analyze the image
          const analysisResponse = await axios.post('/api/image-analysis', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setValue(`otherDocuments.${docIndex}.qualityScore`, analysisResponse.data.qualityScore?.toString() || 'N/A');
          setValue(`otherDocuments.${docIndex}.issues`, analysisResponse.data.issues?.join(', ') || 'No issues found.');
        } catch (error) {
          console.error('Error during other document file upload or analysis:', error);
          setValue(`otherDocuments.${docIndex}.qualityScore`, 'Error');
          setValue(`otherDocuments.${docIndex}.issues`, 'Could not process image.');
          setValue(`otherDocuments.${docIndex}.fileUrl`, ''); // Clear fileUrl on error
        }
      } else {
        // If no file selected (e.g., cleared input)
        setValue(`otherDocuments.${docIndex}.fileName`, '');
        setValue(`otherDocuments.${docIndex}.fileUrl`, '');
        setValue(`otherDocuments.${docIndex}.qualityScore`, '');
        setValue(`otherDocuments.${docIndex}.issues`, '');
      }
    } else if (type === 'text') {
      const newContent = (event.target as HTMLTextAreaElement).value;
      setValue(`otherDocuments.${docIndex}.content`, newContent);
      setValue(`otherDocuments.${docIndex}.fileType`, 'TEXT');
      setValue(`otherDocuments.${docIndex}.fileName`, `Text Document ${docIndex + 1}`); // Provide a generic name
      setValue(`otherDocuments.${docIndex}.fileUrl`, ''); // Clear fileUrl as it's a text doc

      if (newContent.trim().length > 0) {
        setValue(`otherDocuments.${docIndex}.qualityScore`, 'Analyzing...');
        setValue(`otherDocuments.${docIndex}.issues`, '');

        try {
          const analysisResponse = await axios.post('/api/text-analysis', { text: newContent });
          setValue(`otherDocuments.${docIndex}.qualityScore`, analysisResponse.data.score?.toString() || 'N/A');
          setValue(`otherDocuments.${docIndex}.issues`, analysisResponse.data.issues?.join(', ') || 'No issues found.');
        } catch (error) {
          console.error('Error during text analysis:', error);
          setValue(`otherDocuments.${docIndex}.qualityScore`, 'Error');
          setValue(`otherDocuments.${docIndex}.issues`, 'Could not process text.');
        }
      } else {
        setValue(`otherDocuments.${docIndex}.qualityScore`, '');
        setValue(`otherDocuments.${docIndex}.issues`, '');
      }
    }
  };

  // Handle Text Document Verification (using /api/v1/verify-user)
  const handleTextDocumentVerification = async () => {
    const customerFullName = getValues('fullName');
    const customerIdNumber = getValues('idNumber');
    const customerDob = getValues('dob');
    const currentDocContent = getValues(`otherDocuments.${docIndex}.content`); // Get current content again

    if (!customerFullName || !customerIdNumber || !customerDob || !currentDocContent) {
      setValue(`otherDocuments.${docIndex}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Customer info or document content is missing.');
      return;
    }

    setValue(`otherDocuments.${docIndex}.verificationStatus`, 'PENDING');
    setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Verifying text content...');

    try {
      const formattedDob = customerDob ? dayjs(customerDob).format('YYYY/MM/DD') : '';

      const verificationPayload = {
        fullName: customerFullName,
        idNumber: customerIdNumber,
        dateOfBirth: formattedDob,
        documentContent: currentDocContent, // Send the text content
        id: 'temp-other-doc-id-' + Date.now(),
        address: getValues('address'),
        phoneNumber: getValues('phone'),
        kycStatus: 'PENDING',
      };

      const verificationResponse = await axios.post('/api/v1/verify-user', verificationPayload);

      if (verificationResponse.data.kycStatus === 'VERIFIED') {
        setValue(`otherDocuments.${docIndex}.verificationStatus`, 'VERIFIED');
        setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Text document verified successfully!');
      } else {
        setValue(`otherDocuments.${docIndex}.verificationStatus`, 'REJECTED');
        setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Text verification failed. Mismatch or issues found.');
      }
    } catch (error) {
      console.error(`Error during text document verification for index ${docIndex}:`, error);
      setValue(`otherDocuments.${docIndex}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${docIndex}.verificationMessage`, 'An error occurred during text verification.');
    }
  };

  // Handle Image Document Face Match Verification (using /api/verify_face_match)
  const handleImageDocumentFaceMatch = async () => {
    const cinFileFromState = getValues('cinFile')?.[0]; // The CIN File object from parent form
    // Get the actual File object for the other doc from the DOM, as fileUrl is just the uploaded path
    const otherDocumentFile = (document.getElementById(`other-doc-upload-${docIndex}`) as HTMLInputElement)?.files?.[0];

    if (!cinFileFromState) {
      setValue(`otherDocuments.${docIndex}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${docIndex}.verificationMessage`, 'CIN document not uploaded for comparison.');
      return;
    }
    if (!otherDocumentFile) {
      setValue(`otherDocuments.${docIndex}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Other image document not uploaded for verification.');
      return;
    }

    setValue(`otherDocuments.${docIndex}.verificationStatus`, 'PENDING');
    setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Verifying face match with CIN...');

    const formData = new FormData();
    formData.append('img1', cinFileFromState);
    formData.append('img2', otherDocumentFile);

    try {
      const verificationResponse = await axios.post('/api/verify_face_match', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = verificationResponse.data; // Assuming result is directly { verified: true/false }

      if (result.verified) {
        setValue(`otherDocuments.${docIndex}.verificationStatus`, 'VERIFIED');
        setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Face match successfully verified!');
      } else {
        setValue(`otherDocuments.${docIndex}.verificationStatus`, 'REJECTED');
        setValue(`otherDocuments.${docIndex}.verificationMessage`, 'Face match failed. No match found or issues.');
      }
    } catch (error) {
      console.error(`Error during face match verification for index ${docIndex}:`, error);
      setValue(`otherDocuments.${docIndex}.verificationStatus`, 'REJECTED');
      setValue(`otherDocuments.${docIndex}.verificationMessage`, 'An error occurred during face match verification.');
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
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
            <TextField
              {...field}
              select
              label="Document Type"
              fullWidth
              SelectProps={{ native: true }}
              onChange={e => {
                field.onChange(e); // Update RHF state
                // Clear related fields when document type changes
                setValue(`otherDocuments.${docIndex}.fileName`, '');
                setValue(`otherDocuments.${docIndex}.fileUrl`, '');
                setValue(`otherDocuments.${docIndex}.content`, '');
                setValue(`otherDocuments.${docIndex}.qualityScore`, '');
                setValue(`otherDocuments.${docIndex}.issues`, '');
                setValue(`otherDocuments.${docIndex}.verificationStatus`, 'NOT_APPLICABLE');
                setValue(`otherDocuments.${docIndex}.verificationMessage`, '');
              }}
            >
              <option value="IMAGE">Image</option>
              <option value="TEXT">Text</option>
            </TextField>
          )}
        />

        {documentType === 'IMAGE' && (
          <>
            <input
              accept="image/*" // Ensure only image files are accepted for image type
              style={{ display: 'none' }}
              id={`other-doc-upload-${docIndex}`}
              type="file"
              onChange={e => handleOtherDocumentProcess(e, 'file')}
            />
            <label htmlFor={`other-doc-upload-${docIndex}`}>
              <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                Upload Image
              </Button>
            </label>
            <Box>
              <Typography variant="body2">**File:** {fileName}</Typography>
              <Typography variant="body2">
                **Quality Score:** {qualityScore === 'Analyzing...' ? <LinearProgress sx={{ width: 100 }} /> : qualityScore}
              </Typography>
              <Typography variant="body2">**Issues:** {issues}</Typography>
            </Box>
          </>
        )}

        {documentType === 'TEXT' && (
          <Controller
            name={`otherDocuments.${docIndex}.content`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Document Content"
                multiline
                rows={4}
                fullWidth
                placeholder="Enter text document content here..."
                onChange={e => handleOtherDocumentProcess(e, 'text')} // Use the content directly
              />
            )}
          />
        )}

        <Box sx={{ mt: 2 }}>
          <Chip
            label={verificationStatus}
            icon={
              verificationStatus === 'VERIFIED' ? (
                <CheckCircleOutlineIcon />
              ) : verificationStatus === 'REJECTED' ? (
                <ErrorOutlineIcon />
              ) : undefined
            }
            color={
              verificationStatus === 'VERIFIED'
                ? 'success'
                : verificationStatus === 'REJECTED'
                  ? 'error'
                  : verificationStatus === 'PENDING'
                    ? 'info'
                    : 'default'
            }
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" display="block" color="text.secondary">
            {verificationMessage}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => (documentType === 'IMAGE' ? handleImageDocumentFaceMatch() : handleTextDocumentVerification())}
            startIcon={documentType === 'IMAGE' ? <FaceRetouchingNaturalIcon /> : <GavelIcon />}
            disabled={
              isSubmittingForm ||
              verificationStatus === 'PENDING' || // Currently verifying
              cinVerificationStatus !== 'VERIFIED' || // Cannot verify other documents if CIN is not verified
              (documentType === 'IMAGE' && !fileUrl) || // Image type requires fileUrl
              (documentType === 'TEXT' && !content?.trim()) // Text type requires content
            }
            sx={{ mt: 1 }}
          >
            Verify Document
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};
