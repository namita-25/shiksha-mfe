import { getLearnerAttendanceStatus } from '@/services/AttendanceService';
import { formatSelectedDate } from './Helper';
import { LearnerAttendanceProps } from './Interfaces';
import { Role } from './app.constant';

// Helper function to fetch attendance stats
export const fetchAttendanceStats = async (userId: string) => {
  const classId = localStorage.getItem('classId') ?? '';
  const today = new Date();

  const attendanceRequest: LearnerAttendanceProps = {
    filters: {
      contextId: classId,
      fromDate: formatSelectedDate(today),
      toDate: formatSelectedDate(today),
      scope: Role.STUDENT,
      userId: userId,
    },
  };

  try {
    const response = await getLearnerAttendanceStatus(attendanceRequest);
    const attendanceStats = response?.data?.attendanceList;
    return attendanceStats;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    // throw error;
  }
};
