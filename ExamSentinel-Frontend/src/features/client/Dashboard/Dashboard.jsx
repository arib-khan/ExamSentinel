import React, { useState, useEffect } from 'react';
import {
  Users, FileText, Building, BookOpen,
  TrendingUp,
  BarChart3, Plus, ChevronRight,
  TrendingDown
} from 'lucide-react';
import useStatisticsData from '@/services/DashboardServices/hooks/useStatisticsData';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Enhanced mock data for dashboard insights
const dashboardData = {
  overview: {
    totalExams: 45,
    activeExams: 8,
    totalStudents: 2847,
    totalQuestions: 12450,
    totalInstitutes: 23,
    totalCenters: 67
  },
  recentActivity: [
    { type: 'exam', message: 'New exam "Computer Science Final" scheduled', time: '2 hours ago', status: 'success' },
    { type: 'question', message: 'Question bank updated with 89 new questions', time: '2 days ago', status: 'info' }
  ],
  upcomingExams: [
    { name: 'Mathematics Final', date: '2025-08-02', students: 245, duration: 120 },
    { name: 'Physics Midterm', date: '2025-08-05', students: 189, duration: 90 },
    { name: 'Chemistry Test', date: '2025-08-08', students: 167, duration: 75 },
    { name: 'Biology Assessment', date: '2025-08-12', students: 203, duration: 105 },
    { name: 'Mathematics Final', date: '2025-08-02', students: 245, duration: 120 },
    { name: 'Physics Midterm', date: '2025-08-05', students: 189, duration: 90 },
    { name: 'Chemistry Test', date: '2025-08-08', students: 167, duration: 75 },
    { name: 'Biology Assessment', date: '2025-08-12', students: 203, duration: 105 }
  ],
  systemHealth: {
    serverStatus: 'online',
    databaseStatus: 'online',
    storageUsed: 67,
    activeConnections: 1247
  },
  monthlyStats: {
    examsCompleted: 28,
    studentsRegistered: 1456,
    questionsAdded: 342,
    averageScore: 78.5
  }
};

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-600',
    green: 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-600',
    orange: 'border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-600',
    purple: 'border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-600',
    indigo: 'border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-600',
    red: 'border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-600',
  };
  return (
    <Card className={`cursor-pointer transition hover:shadow-lg border ${colorClasses[color] || ''} dark:border-muted-foreground/30`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className="text-xs mt-2">
            <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend >= 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />} {Math.abs(trend)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};



const QuickActionCard = ({ title, description, icon: Icon, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-600',
    green: 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-600',
    orange: 'border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-600',
    purple: 'border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-600'
  };

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition hover:shadow-lg border ${colorClasses[color] || ''} dark:border-muted-foreground/30`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
const ActivityFeed = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      {/* <ScrollArea className="h-48 px-4"> */}
      <div className='h-48 px-4 overflow-y-auto'>
        <ul className="space-y-3">
          {activities.map((activity, idx) => (
            <li key={idx} className="text-sm">
              <div className="flex justify-between">
                <span>{activity.message}</span>
                <Badge variant="outline" className="text-xs">
                  {activity.time}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* </ScrollArea> */}
    </CardContent>
  </Card>
);

const UpcomingExamsCard = ({ exams, navigate }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Upcoming Exams</CardTitle>
      {/* <Button variant="link" onClick={() => navigate('/client/exams/list')} className="cursor-pointer">View All</Button> */}
    </CardHeader>
    <CardContent className="p-0">
      <div className='h-60 px-4 overflow-y-auto'>
        <ul className="divide-y text-sm">
          {exams.length > 0 ? exams.map((exam, idx) => (
            <li
              key={idx}
              className="py-2 cursor-pointer hover:text-primary"
              onClick={() => navigate('/admin/exams/list', { state: { initialSearch: exam.name } })}
            >
              <div className="bg-muted-foreground/10 p-2 rounded-md flex justify-between items-center">
                <div>
                  <div className="font-medium">{exam.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {exam.date} • {exam.students} students • {exam.duration}min
                  </div>
                </div>
                <div>
                  <Button variant="outline" className="h-8 w-8 rounded-full cursor-pointer">
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </li>
          ))
            : <li className="py-2 text-muted-foreground">No upcoming exams  </li>}
        </ul>
      </div>
      {/* </ScrollArea> */}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, upcomingExams, loading, error } = useStatisticsData();





  // Navigation functions (you'll replace these with your actual navigation)
  const navigateToInstitution = () => navigate("/client/institution/list");
  const navigateToStudents = () => navigate("/client/students/list");
  const navigateToQuestions = () => navigate("/client/questions/bulk-upload");
  const navigateToInstitutes = () => navigate("/client/institution/list");
  const navigateToCenters = () => navigate("/client/center/list");

  const examTrend = data.totalExams > 0
    ? Math.round((data.activeExams / data.totalExams) * 100)
    : 0;
  const instituteTrend = data.totalInstitutes > 0
    ? Math.round((data.activeInstitute / data.totalInstitutes) * 100)
    : 0;
  const studentTrend = data.totalStudents > 0
    ? Math.round((data.totalStudents / data.totalStudents) * 100)
    : 0;
  const centerTrend = data.totalCenters > 0
    ? Math.round((data.totalCenters / data.totalCenters) * 100)
    : 0;
  // const questionTrend = data.totalQuestions > 0
  //   ? Math.round((data.totalQuestions / data.totalQuestions) * 100)
  //   : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Exams"
            value={data.totalExams}
            subtitle={`${data.activeExams} active Exams`}
            icon={BookOpen}
            color="blue"
            trend={examTrend}
            onClick={navigateToInstitution}
          />
          <MetricCard
            title="Students"
            value={data.totalStudents.toLocaleString()}
            subtitle="Registered users"
            icon={Users}
            color="green"
            trend={studentTrend}
            onClick={navigateToStudents}
          />
          {/* <MetricCard
            title="Questions"
            value={data.totalQuestions.toLocaleString()}
            subtitle="In question bank"
            icon={FileText}
            color="purple"
            trend={questionTrend}
            onClick={navigateToQuestions}
          /> */}
          <MetricCard
            title="Institutes"
            value={data.totalInstitutes}
            subtitle={`${data.activeInstitute} active institutes`}
            icon={Building}
            color="orange"
            trend={instituteTrend}
            onClick={navigateToInstitutes}
          />

        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-400 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <QuickActionCard
              title="Manage Students"
              description="Add, edit, or view student registrations"
              icon={Users}
              color="green"
              onClick={navigateToStudents}
            />
            <QuickActionCard
              title="Question Upload"
              description="Add or upload questions in the database"
              icon={FileText}
              color="purple"
              onClick={navigateToQuestions}
            />
            {/* <QuickActionCard
              title="View Reports"
              description="Generate and download exam reports"
              icon={BarChart3}
              color="orange"
              onClick={navigateToReports}
            /> */}
            <QuickActionCard
              title="Create New Institute"
              description="Add or modify Institution  details"
              icon={Plus}
              color="blue"
              onClick={navigateToInstitution}
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={dashboardData.recentActivity} />
          </div>

          {/* Upcoming Exams */}
          <div className="lg:col-span-1">
            <UpcomingExamsCard exams={upcomingExams} navigate={navigate} />
          </div>
        </div>

        <div className="mb-8 mt-4">
          {/* System Health */}
          {/* <div className="lg:col-span-1">
            <SystemHealthCard health={dashboardData.systemHealth} />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;