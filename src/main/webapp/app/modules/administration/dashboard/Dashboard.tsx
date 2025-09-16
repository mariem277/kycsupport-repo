import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  Mail as MailIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';

type DocumentGroup = {
  documents: number;
  customers: number;
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios
      .get('/api/admin/dashboard')
      .then(res => {
        // eslint-disable-next-line no-console
        console.log('API Response:', res.data);
        setData(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  if (!data) {
    return <Typography>Loading dashboard...</Typography>;
  }

  // Pie chart data
  const pieData = [
    { id: 0, value: data.customerInfo.pendingCustomers, label: 'Pending', color: '#d580ff' },
    { id: 1, value: data.customerInfo.verifiedCustomers, label: 'Verified', color: '#eabfff' },
    { id: 2, value: data.customerInfo.rejectedCustomers, label: 'Rejected', color: '#3c005a' },
  ];

  // Bar chart data
  const groupedDocs: DocumentGroup[] = data.customerDocumentCounts
    ? Object.values(
        data.customerDocumentCounts.reduce((acc: Record<number, DocumentGroup>, c: any) => {
          if (!acc[c.documentCount]) {
            acc[c.documentCount] = { documents: c.documentCount, customers: 0 };
          }
          acc[c.documentCount].customers += 1;
          return acc;
        }, {}),
      )
    : [];

  type Status = 'Pending' | 'Verified' | 'Rejected';

  const statusColors: Record<Status, string> = {
    Pending: '#d580ff',
    Verified: '#eabfff',
    Rejected: '#3c005a',
  };

  const mapKycStatus = (kycStatus: string): Status => {
    switch (kycStatus) {
      case 'VERIFIED':
        return 'Verified';
      case 'REJECTED':
        return 'Rejected';
      case 'PENDING':
      default:
        return 'Pending';
    }
  };

  const groupedByStatus: Record<number, Record<Status, number>> = data.customerDocumentCounts.reduce(
    (acc, c: any) => {
      const docCount = c.documentCount;
      const status = mapKycStatus(c.kycStatus);
      if (!acc[docCount]) acc[docCount] = { Pending: 0, Verified: 0, Rejected: 0 };
      acc[docCount][status] += 1;
      return acc;
    },
    {} as Record<number, Record<Status, number>>,
  );

  const barData = Object.entries(groupedByStatus).map(([documents, counts]) => ({
    documents: Number(documents),
    ...counts,
  }));

  return (
    <Stack spacing={4} sx={{ padding: '24px' }}>
      {/* Top Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 3 }} flexWrap="wrap" justifyContent="space-between">
        {[
          {
            icon: <MailIcon fontSize="large" color="primary" />,
            title: 'Mails Sent',
            value: data.mailStats.totalEmailsSent,
          },
          {
            icon: <PersonAddIcon fontSize="large" color="secondary" />,
            title: 'New Customers this month',
            value: data.customerInfo.customersAddedThisMonth,
          },
          {
            icon: <GroupIcon fontSize="large" color="primary" />,
            title: 'Agents trust our solution',
            value: data.totalUsers,
          },
          {
            icon: <CheckCircleIcon fontSize="large" color="primary" />,
            title: 'Face Matches',
            value: data.countFaceMatch,
          },
        ].map((card, index) => (
          <Card
            key={index}
            sx={{
              flex: '1 1 200px',
              minWidth: 100,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
              '&:hover': {
                transform: 'rotate(-3deg) scale(1.03)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                backgroundColor: 'rgba(63, 81, 181, 0.1)',
              },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {card.icon}
              <div>
                <Typography variant="subtitle2">{card.title}</Typography>
                <Typography variant="h6">{card.value}</Typography>
              </div>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Charts Section */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Card
          sx={{
            flex: '1',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
            '&:hover': {
              transform: 'rotate(-3deg) scale(1.03)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
              backgroundColor: 'rgba(63, 81, 181, 0.1)',
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Status Distribution
            </Typography>
            <PieChart
              series={[
                {
                  data: pieData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30 },
                  innerRadius: 60,
                },
              ]}
              width={400}
              height={300}
            >
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="bold">
                {data.customerInfo.totalCustomers}
              </text>
            </PieChart>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: '1',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
            '&:hover': {
              transform: 'rotate(-3deg) scale(1.03)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
              backgroundColor: 'rgba(63, 81, 181, 0.1)',
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Document Count
            </Typography>
            {groupedDocs.length > 0 ? (
              <BarChart
                xAxis={[{ id: 'documentCounts', dataKey: 'documents', label: 'Number of Documents' }]}
                yAxis={[{ id: 'customerCounts', label: 'Number of Customers' }]}
                series={[
                  { dataKey: 'Pending', label: 'Pending', color: statusColors.Pending },
                  { dataKey: 'Verified', label: 'Verified', color: statusColors.Verified },
                  { dataKey: 'Rejected', label: 'Rejected', color: statusColors.Rejected },
                ]}
                dataset={barData}
                width={500}
                height={300}
              />
            ) : (
              <Typography>No document data available</Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};

export default Dashboard;
