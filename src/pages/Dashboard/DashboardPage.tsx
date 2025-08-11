import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import PaymentLinkGenerator from '../../components/module-specific/sales/PaymentLinkGenerator/PaymentLinkGenerator';
import type { UserRole, Lead } from '../../components/module-specific/sales/PaymentLinkGenerator/PaymentLinkGenerator';

import './DashboardPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const DashboardPage: React.FC = () => {
  // Sample user role for demonstration
  const userRole: UserRole = 'Sales Manager';

  // Sample lead data
  const [leadData] = useState<Lead>({
    id: 'lead-001',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567'
  });

  // Handle payment link generation
  const handlePaymentLinkGenerated = (link: string) => {
    console.log('Payment link generated:', link);
    // Here you could show a notification, save to database, etc.
  };



  // Sales Performance Chart Data
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Target',
        data: [15000, 15000, 15000, 15000, 15000, 15000],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
    ],
  };

  // Employee Distribution Chart Data
  const employeeData = {
    labels: ['Sales', 'Marketing', 'Development', 'Support', 'Management'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Chart options
  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      title: {
        display: true,
        text: 'Sales Performance',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const employeeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      title: {
        display: true,
        text: 'Employee Distribution',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to the HR & Admin Management System</p>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-wrapper">
            <Line data={salesData} options={salesChartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-wrapper">
            <Doughnut data={employeeData} options={employeeChartOptions} />
          </div>
        </div>
      </div>

      {/* Payment Link Generator Section */}
      <div className="payment-link-section">
        <PaymentLinkGenerator
          lead={leadData}
          defaultAmount={1500}
          currency="USD"
          successUrl="https://example.com/payment-success"
          cancelUrl="https://example.com/payment-cancel"
          labels={{
            title: "Generate Payment Link",
            subtitle: "Create secure payment links for your clients",
            generateButton: "Generate Payment Link"
          }}
          theme={{
            variant: "default",
            size: "medium"
          }}
          onGenerated={handlePaymentLinkGenerated}
          userRole={userRole}
          disabled={false}
        />
      </div>



    </div>
  );
};

export default DashboardPage; 