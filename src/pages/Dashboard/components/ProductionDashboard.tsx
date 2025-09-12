import React from 'react';
import {
  DashboardContainer,
  DashboardSection,
  OverviewCards,
  DataList,
  ProgressBar,
  StatusBadge,
  MetricsGrid,
  QuickActions,
  OverviewCardData,
  DataListItem,
  MetricData,
  ActionCategory
} from '../../../components/dashboard';

const ProductionDashboard = () => {
  // Production Overview Data
  const productionOverviewData: OverviewCardData[] = [
    {
      id: 'active-projects',
      title: 'Active Projects',
      value: '12',
      subtitle: 'Currently in progress',
      change: { value: '+2', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: 'blue'
      }
    },
    {
      id: 'completed-projects',
      title: 'Completed Projects',
      value: '45',
      subtitle: 'This quarter',
      change: { value: '+8', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'green'
      }
    },
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: '156',
      subtitle: 'Across all projects',
      change: { value: '+15', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        color: 'orange'
      }
    },
    {
      id: 'team-members',
      title: 'Team Members',
      value: '67',
      subtitle: 'Active developers',
      change: { value: '+3', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
        color: 'purple'
      }
    }
  ];

  // Project Data
  const projectData: DataListItem[] = [
    {
      id: 1,
      name: 'E-commerce Platform',
      status: 'In Progress',
      progress: 75,
      team: 'Frontend Team',
      deadline: '2024-02-15',
      priority: 'High'
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      status: 'In Progress',
      progress: 45,
      team: 'Mobile Team',
      deadline: '2024-03-01',
      priority: 'Medium'
    },
    {
      id: 3,
      name: 'API Integration',
      status: 'Almost Done',
      progress: 90,
      team: 'Backend Team',
      deadline: '2024-01-30',
      priority: 'High'
    },
    {
      id: 4,
      name: 'Database Migration',
      status: 'Behind Schedule',
      progress: 30,
      team: 'DevOps Team',
      deadline: '2024-03-15',
      priority: 'Critical'
    }
  ];

  // Task Data
  const taskData: DataListItem[] = [
    {
      id: 1,
      title: 'Implement user authentication',
      project: 'E-commerce Platform',
      assignee: 'John Smith',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2024-01-20'
    },
    {
      id: 2,
      title: 'Fix responsive design issues',
      project: 'Mobile App Redesign',
      assignee: 'Sarah Johnson',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '2024-01-22'
    },
    {
      id: 3,
      title: 'Write unit tests',
      project: 'API Integration',
      assignee: 'Mike Chen',
      priority: 'Low',
      status: 'Completed',
      dueDate: '2024-01-18'
    }
  ];

  // Task Statistics
  const taskStats: MetricData[] = [
    {
      id: 'total',
      label: 'Total',
      value: '156',
      color: 'blue'
    },
    {
      id: 'completed',
      label: 'Completed',
      value: '89',
      color: 'green'
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: '45',
      color: 'orange'
    },
    {
      id: 'pending',
      label: 'Pending',
      value: '22',
      color: 'purple'
    }
  ];

  // Development Metrics
  const developmentMetrics: MetricData[] = [
    {
      id: 'code-coverage',
      label: 'Code Coverage',
      value: '87.5%',
      color: 'green'
    },
    {
      id: 'bugs-found',
      label: 'Bugs Found',
      value: '12',
      color: 'red'
    },
    {
      id: 'bugs-resolved',
      label: 'Bugs Resolved',
      value: '8',
      color: 'green'
    },
    {
      id: 'avg-review-time',
      label: 'Avg Review Time',
      value: '2.3 days',
      color: 'blue'
    }
  ];

  // Quick Actions Data
  const quickActionsData: ActionCategory[] = [
    {
      id: 'project-management',
      title: 'Project Management',
      actions: [
        {
          id: 'create-project',
          label: 'Create Project',
          icon: '📋',
          onClick: () => console.log('Create Project'),
          color: 'blue'
        },
        {
          id: 'project-assignment',
          label: 'Project Assignment',
          icon: '👥',
          onClick: () => console.log('Project Assignment'),
          color: 'blue'
        },
        {
          id: 'project-timeline',
          label: 'Project Timeline',
          icon: '📅',
          onClick: () => console.log('Project Timeline'),
          color: 'blue'
        }
      ]
    },
    {
      id: 'task-management',
      title: 'Task Management',
      actions: [
        {
          id: 'assign-tasks',
          label: 'Assign Tasks',
          icon: '✅',
          onClick: () => console.log('Assign Tasks'),
          color: 'green'
        },
        {
          id: 'task-progress',
          label: 'Task Progress',
          icon: '📊',
          onClick: () => console.log('Task Progress'),
          color: 'green'
        },
        {
          id: 'task-reports',
          label: 'Task Reports',
          icon: '📈',
          onClick: () => console.log('Task Reports'),
          color: 'green'
        }
      ]
    },
    {
      id: 'development-collaboration',
      title: 'Development & Collaboration',
      actions: [
        {
          id: 'code-reviews',
          label: 'Code Reviews',
          icon: '🔍',
          onClick: () => console.log('Code Reviews'),
          color: 'purple'
        },
        {
          id: 'project-chat',
          label: 'Project Chat',
          icon: '💬',
          onClick: () => console.log('Project Chat'),
          color: 'purple'
        },
        {
          id: 'file-sharing',
          label: 'File Sharing',
          icon: '📁',
          onClick: () => console.log('File Sharing'),
          color: 'purple'
        }
      ]
    }
  ];

  return (
    <DashboardContainer
      title="Production Dashboard"
      subtitle="Project management, development tracking, and team collaboration"
    >
      <OverviewCards data={productionOverviewData} />
      
      <DashboardSection
        title="Project Management"
        actions={{
          primary: { label: 'Create Project', onClick: () => console.log('Create Project') },
          secondary: { label: 'View All', onClick: () => console.log('View All Projects') }
        }}
        tabs={[
          { label: 'Active Projects', active: true, onClick: () => console.log('Active Projects') },
          { label: 'Project Timeline', active: false, onClick: () => console.log('Project Timeline') },
          { label: 'Project Logs', active: false, onClick: () => console.log('Project Logs') }
        ]}
      >
        <DataList
          data={projectData}
          renderItem={(project) => (
            <div className="project-item">
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="project-badges">
                  <StatusBadge status={project.priority} type="priority" />
                  <StatusBadge status={project.status} type="status" />
                </div>
              </div>
              <div className="project-details">
                <div className="project-info">
                  <p><strong>Team:</strong> {project.team}</p>
                  <p><strong>Deadline:</strong> {project.deadline}</p>
                </div>
                <div className="project-progress">
                  <ProgressBar
                    value={project.progress}
                    label="Progress"
                    color="blue"
                  />
                </div>
              </div>
            </div>
          )}
        />
      </DashboardSection>

      <DashboardSection
        title="Task Management"
        actions={{
          primary: { label: 'Assign Task', onClick: () => console.log('Assign Task') },
          secondary: { label: 'Task Reports', onClick: () => console.log('Task Reports') }
        }}
      >
        <div className="task-stats">
          <div className="task-stat-card">
            <h3>Task Overview</h3>
            <MetricsGrid data={taskStats} columns={4} />
          </div>
        </div>
        
        <div className="today-tasks">
          <h3>Today's Tasks</h3>
          <DataList
            data={taskData}
            renderItem={(task) => (
              <div className="task-item">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{task.project} • {task.assignee}</p>
                  <span className="task-due">Due: {task.dueDate}</span>
                </div>
                <div className="task-status">
                  <StatusBadge status={task.priority} type="priority" />
                  <StatusBadge status={task.status} type="status" />
                </div>
              </div>
            )}
          />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Development Tracking"
        actions={{
          primary: { label: 'Code Reviews', onClick: () => console.log('Code Reviews') },
          secondary: { label: 'Quality Metrics', onClick: () => console.log('Quality Metrics') }
        }}
      >
        <div className="development-content">
          <div className="code-reviews">
            <h3>Recent Code Reviews</h3>
            <DataList
              data={[
                {
                  id: 1,
                  project: 'E-commerce Platform',
                  reviewer: 'Alice Johnson',
                  files: 12,
                  status: 'Approved',
                  date: '2024-01-15'
                },
                {
                  id: 2,
                  project: 'Mobile App Redesign',
                  reviewer: 'Bob Wilson',
                  files: 8,
                  status: 'Pending',
                  date: '2024-01-16'
                }
              ]}
              renderItem={(review) => (
                <div className="review-item">
                  <div className="review-info">
                    <h4>{review.project}</h4>
                    <p>Reviewer: {review.reviewer} • {review.files} files</p>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-status">
                    <StatusBadge status={review.status} type="status" />
                  </div>
                </div>
              )}
            />
          </div>
          
          <div className="quality-metrics">
            <h3>Quality Metrics</h3>
            <MetricsGrid data={developmentMetrics} columns={2} />
          </div>
        </div>
      </DashboardSection>

      <QuickActions categories={quickActionsData} />
    </DashboardContainer>
  );
};

export default ProductionDashboard;