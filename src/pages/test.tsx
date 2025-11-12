import React, { useState } from 'react';
import { MetricCard } from '../components/common/Dashboard/MetricCard';
import { MetricGrid } from '../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../components/common/Dashboard/ChartWidget';
import ProgressBar from '../components/common/ProgressBar/ProgressBar';

// Common Components
import Accordion from '../components/common/unused_common/Accordion/Accordion';
import Badge from '../components/common/Badge/Badge';
import Button from '../components/common/Button/Button';
import Card from '../components/common/Card/Card';
import Modal from '../components/common/Modal/Modal';
import Dropdown from '../components/common/unused_common/Dropdown/Dropdown';
import type { DropdownOption } from '../components/common/unused_common/Dropdown/Dropdown';
import Notification from '../components/common/Notification/Notification';
import Loading from '../components/common/Loading/Loading';
import Tabs from '../components/common/Tabs/Tabs';
import type { TabItem } from '../components/common/Tabs/Tabs';
import Tooltip from '../components/common/Tooltip/Tooltip';

// Additional Common Components
import ChatBox from '../components/common/ChatBox/ChatBox';
import DatePicker from '../components/common/unused_common/DatePicker/DatePicker';
import FilterBar from '../components/common/unused_common/FilterBar/FilterBar';
import Form from '../components/common/Form/Form';
import Pagination from '../components/common/Pagination/Pagination';
import RichTextEditor from '../components/common/RichTextEditor/RichTextEditor';
import SearchBar from '../components/common/SearchBar/SearchBar';
import TimePicker from '../components/common/TimePicker/TimePicker';
import type { Time } from '../components/common/TimePicker/TimePicker';

import type { 
  MetricData, 
  ChartData, 
  ActivityItem, 
  QuickActionItem 
} from '../types/dashboard';

const testPage: React.FC = () => {
  // State for interactive components
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState('tab1');
  const [showNotification, setShowNotification] = useState(false);
  
  // Additional state for new components
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Time | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [richTextValue, setRichTextValue] = useState('');

  // Dashboard Components Data
  const dashboardMetrics: MetricData[] = [
    {
      title: 'Total Revenue',
      value: '$2,847,392',
      change: '+12.5%',
      changeType: 'positive',
      icon: '💰',
      subtitle: 'This month'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8.2%',
      changeType: 'positive',
      icon: '👥',
      subtitle: 'Currently online'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-0.5%',
      changeType: 'negative',
      icon: '📈',
      subtitle: 'Last 30 days'
    },
    {
      title: 'Support Tickets',
      value: '47',
      change: '+15%',
      changeType: 'negative',
      icon: '🎫',
      subtitle: 'Pending resolution'
    }
  ];

  const chartData: ChartData[] = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 700 }
  ];

  const salesDistributionData: ChartData[] = [
    { name: 'Online Sales', value: 45 },
    { name: 'Retail Stores', value: 25 },
    { name: 'Mobile App', value: 20 },
    { name: 'Phone Orders', value: 10 }
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'New user registration',
      description: 'John Doe registered for the platform',
      time: '2 minutes ago',
      type: 'success',
      user: 'System'
    },
    {
      id: '2',
      title: 'Payment processed',
      description: 'Payment of $1,200 received from ABC Corp',
      time: '15 minutes ago',
      type: 'info',
      user: 'Payment System'
    },
    {
      id: '3',
      title: 'System maintenance',
      description: 'Scheduled maintenance completed successfully',
      time: '1 hour ago',
      type: 'info',
      user: 'Admin'
    },
    {
      id: '4',
      title: 'Failed login attempt',
      description: 'Multiple failed attempts from IP 192.168.1.100',
      time: '2 hours ago',
      type: 'warning',
      user: 'Security System'
    }
  ];

  const quickActions: QuickActionItem[] = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: '👤',
      href: '/users/add',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Generate Report',
      description: 'Create system reports',
      icon: '📊',
      href: '/reports',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: '⚙️',
      href: '/settings',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'View Logs',
      description: 'Check system logs',
      icon: '📋',
      href: '/logs',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // Progress Bar Data
  const progressData = [
    { label: 'Project Alpha', value: 75, color: 'blue' as const },
    { label: 'Project Beta', value: 45, color: 'emerald' as const },
    { label: 'Project Gamma', value: 90, color: 'purple' as const },
    { label: 'Project Delta', value: 30, color: 'amber' as const },
    { label: 'Project Epsilon', value: 60, color: 'rose' as const },
    { label: 'Project Zeta', value: 85, color: 'teal' as const },
    { label: 'Project Eta', value: 15, color: 'indigo' as const },
    { label: 'Project Theta', value: 100, color: 'cyan' as const }
  ];

  // Common Components Data
  const accordionData = [
    {
      title: 'What is React?',
      content: 'React is a JavaScript library for building user interfaces, particularly web applications. It was created by Facebook and is now maintained by Meta and the community.',
      defaultExpanded: true
    },
    {
      title: 'What are React Hooks?',
      content: 'React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8 and allow you to write stateful logic without writing a class.',
      defaultExpanded: false
    },
    {
      title: 'What is JSX?',
      content: 'JSX is a syntax extension for JavaScript that looks similar to HTML. It allows you to write HTML-like code in your JavaScript files, making it easier to create and understand the structure of your React components.',
      defaultExpanded: false
    }
  ];

  const badgeData = [
    { text: 'Success', variant: 'success' as const, size: 'md' as const },
    { text: 'Error', variant: 'danger' as const, size: 'md' as const },
    { text: 'Warning', variant: 'warning' as const, size: 'md' as const },
    { text: 'Info', variant: 'info' as const, size: 'md' as const },
    { text: 'Primary', variant: 'primary' as const, size: 'lg' as const },
    { text: 'Secondary', variant: 'secondary' as const, size: 'sm' as const },
    { text: 'Dismissible', variant: 'outline-primary' as const, dismissible: true },
    { text: 'Clickable', variant: 'soft-success' as const, clickable: true }
  ];

  const buttonData = [
    { text: 'Primary Button', variant: 'primary' as const, size: 'md' as const },
    { text: 'Secondary Button', variant: 'secondary' as const, size: 'md' as const },
    { text: 'Success Button', variant: 'success' as const, size: 'lg' as const },
    { text: 'Danger Button', variant: 'danger' as const, size: 'sm' as const },
    { text: 'Outline Button', variant: 'outline' as const, size: 'md' as const },
    { text: 'Ghost Button', variant: 'ghost' as const, size: 'md' as const },
    { text: 'Loading Button', variant: 'primary' as const, loading: true },
    { text: 'Disabled Button', variant: 'primary' as const, disabled: true }
  ];

  const dropdownOptions: DropdownOption[] = [
    { value: 'option1', label: 'Option 1', description: 'First option' },
    { value: 'option2', label: 'Option 2', description: 'Second option' },
    { value: 'option3', label: 'Option 3', description: 'Third option', disabled: true },
    { value: 'option4', label: 'Option 4', description: 'Fourth option' },
    { value: 'option5', label: 'Option 5', description: 'Fifth option' }
  ];

  const tabData: TabItem[] = [
    {
      id: 'tab1',
      label: 'Overview',
      content: <div className="p-4"><h3 className="text-lg font-semibold mb-2">Overview Content</h3><p>This is the overview tab content with some sample information.</p></div>,
      icon: '📊'
    },
    {
      id: 'tab2',
      label: 'Details',
      content: <div className="p-4"><h3 className="text-lg font-semibold mb-2">Details Content</h3><p>This is the details tab content with more specific information.</p></div>,
      icon: '📋'
    },
    {
      id: 'tab3',
      label: 'Settings',
      content: <div className="p-4"><h3 className="text-lg font-semibold mb-2">Settings Content</h3><p>This is the settings tab content for configuration options.</p></div>,
      icon: '⚙️',
      disabled: false
    }
  ];

  const notificationData = [
    { type: 'success' as const, title: 'Success!', message: 'Your action was completed successfully.' },
    { type: 'error' as const, title: 'Error!', message: 'Something went wrong. Please try again.' },
    { type: 'warning' as const, title: 'Warning!', message: 'Please check your input before proceeding.' },
    { type: 'info' as const, title: 'Info', message: 'Here is some useful information for you.' }
  ];

  const loadingData = [
    { type: 'spinner' as const, size: 'md' as const, theme: 'primary' as const },
    { type: 'dots' as const, size: 'lg' as const, theme: 'success' as const },
    { type: 'pulse' as const, size: 'sm' as const, theme: 'warning' as const },
    { type: 'bounce' as const, size: 'md' as const, theme: 'error' as const },
    { type: 'wave' as const, size: 'lg' as const, theme: 'secondary' as const }
  ];

  // Additional sample data for new components
  const additionalChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const additionalChatMessages = [
    { id: '1', type: 'text' as const, content: 'Hello! How can I help you?', sender: { id: 'bot', name: 'Bot', avatar: '' }, timestamp: new Date() },
    { id: '2', type: 'text' as const, content: 'I need help with my account', sender: { id: 'user', name: 'User', avatar: '' }, timestamp: new Date() },
    { id: '3', type: 'text' as const, content: 'Sure! What specific help do you need?', sender: { id: 'bot', name: 'Bot', avatar: '' }, timestamp: new Date() }
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' }
  ];

  const formFields = [
    { name: 'firstName', label: 'First Name', type: 'text' as const, required: true },
    { name: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'age', label: 'Age', type: 'text' as const, required: false }
  ];

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];


  const paginationData = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10
  };


  const ComponentCard = ({ 
    title, 
    icon, 
    color = 'bg-blue-500', 
    children 
  }: { 
    title: string; 
    icon: string; 
    color?: string; 
    children: React.ReactNode 
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white font-semibold text-lg`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const SectionHeader = ({ 
    title, 
    description, 
    gradient = 'from-blue-500 to-purple-600' 
  }: { 
    title: string; 
    description?: string; 
    gradient?: string 
  }) => (
    <div className="mb-10">
      <div className="flex items-center space-x-4 mb-3">
        <div className={`w-1 h-8 bg-gradient-to-b ${gradient} rounded-full`}></div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-600 ml-6 text-sm">{description}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-bold">⚡</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Comprehensive overview of all dashboard components</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="text-lg font-semibold text-gray-900">2 minutes ago</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xl">👤</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Components Section */}
        <section className="mb-16">
          <SectionHeader 
            title="Dashboard Components" 
            description="Core dashboard widgets and data visualization components"
            gradient="from-blue-500 to-indigo-600"
          />
          
          <div className="space-y-8">
            {/* Stats Overview */}
            <ComponentCard title="Stats Overview" icon="📊" color="bg-blue-500">
              <MetricGrid 
                title="Dashboard Metrics"
                metrics={dashboardMetrics}
                columns={4}
                headerColor="from-blue-50 to-transparent"
                headerGradient="from-blue-500 to-indigo-600"
                cardSize="md"
                className="border-0 shadow-none bg-transparent"
              />
            </ComponentCard>

            {/* Individual Metric Cards */}
            <ComponentCard title="Individual Metric Cards" icon="📈" color="bg-green-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardMetrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ))}
              </div>
            </ComponentCard>

            {/* Metric Grid */}
            <ComponentCard title="Metric Grid" icon="⚡" color="bg-purple-500">
              <MetricGrid 
                title="Key Performance Indicators" 
                metrics={dashboardMetrics} 
                columns={4} 
              />
            </ComponentCard>

            {/* Chart Widgets */}
            <ComponentCard title="Chart Widgets" icon="📊" color="bg-orange-500">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ChartWidget 
                  title="Revenue Trend" 
                  data={chartData} 
                  type="line" 
                  height={300} 
                />
                <ChartWidget 
                  title="Sales Distribution" 
                  data={salesDistributionData} 
                  type="pie" 
                  height={300} 
                />
              </div>
            </ComponentCard>

            {/* Quick Actions & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ComponentCard title="Quick Actions" icon="⚡" color="bg-red-500">
                <QuickActionCard 
                  title="Administrative Actions" 
                  actions={quickActions} 
                />
              </ComponentCard>

              <ComponentCard title="Activity Feed" icon="🔄" color="bg-indigo-500">
                <ActivityFeed 
                  title="Recent Activities" 
                  activities={activities} 
                  maxItems={5} 
                />
              </ComponentCard>
            </div>

            

            {/* Progress Bars */}
            <ComponentCard title="Progress Bars" icon="📈" color="bg-teal-500">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {progressData.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <ProgressBar 
                        label={item.label}
                        value={item.value}
                        color={item.color}
                        animated={true}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Special Progress Bar Examples */}
                <div className="mt-8 space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Special Examples</h4>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <ProgressBar 
                      label="Animated Progress"
                      value={65}
                      color="indigo"
                      animated={true}
                    />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <ProgressBar 
                      label="Static Progress"
                      value={80}
                      color="emerald"
                      animated={false}
                    />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <ProgressBar 
                      label="Pink Progress Bar"
                      value={40}
                      color="pink"
                      animated={true}
                    />
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </section>

        {/* Common Components Section */}
        <section className="mb-16">
          <SectionHeader 
            title="Common Components" 
            description="Reusable UI components for building interfaces"
            gradient="from-green-500 to-teal-600"
          />
          
          <div className="space-y-8">
            {/* Accordion */}
            <ComponentCard title="Accordion" icon="📋" color="bg-blue-500">
              <div className="space-y-4">
                {accordionData.map((item, index) => (
                  <Accordion
                    key={index}
                    title={item.title}
                    content={item.content}
                    defaultExpanded={item.defaultExpanded}
                    customClass="border border-gray-200 rounded-lg"
                  />
                ))}
              </div>
            </ComponentCard>

            {/* Badges */}
            <ComponentCard title="Badges" icon="🏷️" color="bg-purple-500">
              <div className="flex flex-wrap gap-4">
                {badgeData.map((badge, index) => (
                  <Badge
                    key={index}
                    text={badge.text}
                    variant={badge.variant}
                    size={badge.size}
                    dismissible={badge.dismissible}
                    clickable={badge.clickable}
                    onDismiss={() => console.log('Badge dismissed')}
                    onClick={() => console.log('Badge clicked')}
                  />
                ))}
              </div>
            </ComponentCard>

            {/* Buttons */}
            <ComponentCard title="Buttons" icon="🔘" color="bg-red-500">
              <div className="flex flex-wrap gap-4">
                {buttonData.map((button, index) => (
                  <Button
                    key={index}
                    text={button.text}
                    variant={button.variant}
                    size={button.size}
                    loading={button.loading}
                    disabled={button.disabled}
                    onClick={() => console.log(`${button.text} clicked`)}
                  />
                ))}
              </div>
            </ComponentCard>

            {/* Cards */}
            <ComponentCard title="Cards" icon="🃏" color="bg-indigo-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  title="Basic Card"
                  subtitle="A simple card with title and content"
                  size="md"
                  variant="default"
                  hoverable
                >
                  <p className="text-gray-600">This is a basic card with some content inside.</p>
                </Card>
                
                <Card
                  title="Elevated Card"
                  subtitle="A card with elevation"
                  size="md"
                  variant="elevated"
                  shadow="lg"
                  hoverable
                >
                  <p className="text-gray-600">This card has a more prominent shadow.</p>
                </Card>
                
                <Card
                  title="Outlined Card"
                  subtitle="A card with border"
                  size="md"
                  variant="outlined"
                  bordered
                  hoverable
                >
                  <p className="text-gray-600">This card has a visible border.</p>
                </Card>
              </div>
            </ComponentCard>

            {/* Dropdown */}
            <ComponentCard title="Dropdown" icon="📋" color="bg-yellow-500">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select an option:
                  </label>
                  <Dropdown
                    options={dropdownOptions}
                    value={selectedDropdownValue}
                    placeholder="Choose an option..."
                    searchable
                    clearable
                    onSelect={(value) => setSelectedDropdownValue(value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Simple dropdown:
                  </label>
                  <Dropdown
                    options={dropdownOptions.slice(0, 3)}
                    placeholder="Select option..."
                    size="sm"
                  />
                </div>
              </div>
            </ComponentCard>

            {/* Modal */}
            <ComponentCard title="Modal" icon="🪟" color="bg-pink-500">
              <div className="space-y-4">
                <Button
                  text="Open Modal"
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                />
                <p className="text-sm text-gray-600">
                  Click the button above to open a modal dialog.
                </p>
              </div>
            </ComponentCard>

            {/* Notifications */}
            <ComponentCard title="Notifications" icon="🔔" color="bg-orange-500">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {notificationData.map((notification, index) => (
                    <Button
                      key={index}
                      text={`Show ${notification.type}`}
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotification(true)}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Click buttons above to show different notification types.
                </p>
              </div>
              </ComponentCard>

            {/* Loading */}
            <ComponentCard title="Loading" icon="⏳" color="bg-teal-500">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loadingData.map((loading, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg text-center">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                        {loading.type} - {loading.size}
                      </h4>
                      <Loading
                        type={loading.type}
                        size={loading.size}
                        theme={loading.theme}
                        message={`Loading ${loading.type}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              </ComponentCard>

            {/* Tabs */}
            <ComponentCard title="Tabs" icon="📑" color="bg-cyan-500">
              <div className="space-y-4">
                <Tabs
                  tabs={tabData}
                  activeTab={activeTab}
                  onTabChange={(tabId) => setActiveTab(tabId)}
                  showIcons
                  variant="pills"
                  size="md"
                />
            </div>
            </ComponentCard>

        {/* Tooltip */}
        <ComponentCard title="Tooltip" icon="💬" color="bg-emerald-500">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="This is a tooltip on the top" position="top">
              <Button text="Top Tooltip" variant="outline" />
            </Tooltip>
            
            <Tooltip content="This is a tooltip on the bottom" position="bottom">
              <Button text="Bottom Tooltip" variant="outline" />
            </Tooltip>
            
            <Tooltip content="This is a tooltip on the left" position="left">
              <Button text="Left Tooltip" variant="outline" />
            </Tooltip>
            
            <Tooltip content="This is a tooltip on the right" position="right">
              <Button text="Right Tooltip" variant="outline" />
            </Tooltip>
            
            <Tooltip content="This tooltip has a click trigger" trigger="click">
              <Button text="Click Tooltip" variant="primary" />
            </Tooltip>
          </div>
        </ComponentCard>

        {/* Chart */}
        <ComponentCard title="Chart" icon="📊" color="bg-blue-500">
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600">Chart component placeholder</p>
              <p className="text-sm text-gray-500">Data: {JSON.stringify(additionalChartData.labels)}</p>
            </div>
          </div>
        </ComponentCard>

        {/* ChatBox */}
        <ComponentCard title="ChatBox" icon="💬" color="bg-green-500">
          <div className="space-y-4">
            <ChatBox
              messages={additionalChatMessages}
              currentUser={{ id: 'user', name: 'User', avatar: '' }}
              onSendMessage={(message: string) => console.log('Sending:', message)}
            />
          </div>
        </ComponentCard>

        {/* DataTable */}
        <ComponentCard title="DataTable" icon="📋" color="bg-purple-500">
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-600 mb-2">DataTable component placeholder</p>
              <div className="space-y-2">
                {tableData.map((item, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <p><strong>Name:</strong> {item.name}</p>
                    <p><strong>Email:</strong> {item.email}</p>
                    <p><strong>Role:</strong> {item.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* DatePicker */}
        <ComponentCard title="DatePicker" icon="📅" color="bg-orange-500">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date:
              </label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Choose a date..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range:
              </label>
              <DatePicker
                placeholder="Select date range..."
              />
            </div>
          </div>
        </ComponentCard>

        {/* FileUpload */}
        <ComponentCard title="FileUpload" icon="📁" color="bg-indigo-500">
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600">FileUpload component placeholder</p>
              <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
            </div>
          </div>
        </ComponentCard>

        {/* FilterBar */}
        <ComponentCard title="FilterBar" icon="🔍" color="bg-pink-500">
          <div className="space-y-4">
            <FilterBar
              filters={filterOptions.map((option, index) => ({
                id: `filter-${index}`,
                type: 'select' as const,
                key: option.value,
                label: option.label,
                options: [option]
              }))}
              onFilterChange={(filters) => console.log('Filters changed:', filters)}
            />
          </div>
        </ComponentCard>

        {/* Form */}
        <ComponentCard title="Form" icon="📝" color="bg-teal-500">
          <div className="space-y-4">
            <Form
              fields={formFields}
              onSubmit={(data) => console.log('Form submitted:', data)}
            />
          </div>
        </ComponentCard>

        {/* ImageUpload */}
        <ComponentCard title="ImageUpload" icon="🖼️" color="bg-cyan-500">
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600">ImageUpload component placeholder</p>
              <p className="text-sm text-gray-500">Upload images here</p>
            </div>
          </div>
        </ComponentCard>

        {/* Pagination */}
        <ComponentCard title="Pagination" icon="📄" color="bg-yellow-500">
          <div className="space-y-4">
            <Pagination
              currentPage={currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={setCurrentPage}
              showFirstLast
              showPrevNext
              size="md"
            />
          </div>
        </ComponentCard>

        {/* RichTextEditor */}
        <ComponentCard title="RichTextEditor" icon="✏️" color="bg-red-500">
          <div className="space-y-4">
            <RichTextEditor
              value={richTextValue}
              onChange={setRichTextValue}
              placeholder="Start typing..."
            />
          </div>
        </ComponentCard>

        {/* SearchBar */}
        <ComponentCard title="SearchBar" icon="🔍" color="bg-gray-500">
          <div className="space-y-4">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search..."
              onSearch={(query) => console.log('Searching for:', query)}
              showClearButton
            />
          </div>
        </ComponentCard>

        {/* TimePicker */}
        <ComponentCard title="TimePicker" icon="⏰" color="bg-violet-500">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time:
              </label>
              <TimePicker
                value={selectedTime || undefined}
                onChange={setSelectedTime}
                placeholder="Choose time..."
                format="12h"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                24h Format:
              </label>
              <TimePicker
                placeholder="Choose time..."
                format="24h"
              />
            </div>
          </div>
        </ComponentCard>
      </div>
    </section>

    {/* Design System Section */}
    <section className="mb-16">
      <SectionHeader 
        title="Design System" 
        description="Typography and theme components"
        gradient="from-purple-500 to-pink-600"
      />
      
      <div className="space-y-8">
        {/* Typography */}
        <ComponentCard title="Typography" icon="🔤" color="bg-purple-500">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Heading 1</h1>
              <h2 className="text-3xl font-semibold text-gray-800 mb-2">Heading 2</h2>
              <h3 className="text-2xl font-medium text-gray-700 mb-2">Heading 3</h3>
              <h4 className="text-xl font-medium text-gray-600 mb-2">Heading 4</h4>
              <h5 className="text-lg font-medium text-gray-600 mb-2">Heading 5</h5>
              <h6 className="text-base font-medium text-gray-600 mb-2">Heading 6</h6>
            </div>
            <div>
              <p className="text-lg text-gray-700 mb-2">Large paragraph text</p>
              <p className="text-base text-gray-600 mb-2">Regular paragraph text</p>
              <p className="text-sm text-gray-500 mb-2">Small paragraph text</p>
              <p className="text-xs text-gray-400 mb-2">Extra small paragraph text</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Bold text</p>
              <p className="font-semibold text-gray-800">Semibold text</p>
              <p className="font-medium text-gray-700">Medium text</p>
              <p className="font-normal text-gray-600">Normal text</p>
              <p className="font-light text-gray-500">Light text</p>
            </div>
          </div>
        </ComponentCard>

        {/* Theme */}
        <ComponentCard title="Theme" icon="🎨" color="bg-pink-500">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Color Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Blue</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Green</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Red</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Purple</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">4px (1)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">8px (2)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">12px (3)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">16px (4)</span>
                </div>
              </div>
            </div>
          </div>
            </ComponentCard>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">ℹ️</span>
              </div>
              <p className="text-sm text-gray-600">
                This dashboard showcases all available component variations
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Built with React & Tailwind CSS</span>
              <span>•</span>
              <span>Version 2.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample Modal"
        description="This is a sample modal dialog to demonstrate the Modal component."
        size="md"
        showCloseButton
        closeOnBackdropClick
        closeOnEscape
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Modal Content</h3>
          <p className="text-gray-600 mb-4">
            This is the content area of the modal. You can put any content here including forms, 
            images, text, or other components.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            />
            <Button
              text="Confirm"
              variant="primary"
              onClick={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      </Modal>

      {/* Notifications */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notificationData.map((notification, index) => (
            <Notification
              key={index}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              visible={showNotification}
              position="top-right"
              autoDismiss
              dismissTimeout={3000}
              onHide={() => setShowNotification(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default testPage;