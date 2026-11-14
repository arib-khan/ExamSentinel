import { getCenterList } from "@/services/CenterServices/centerServices";
import { getExamList } from "@/services/ExamServices/examService";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";
import { getQuestionList } from "@/services/QuestionServices/questionService";
import { getStudentList } from "@/services/StudentServices/studentService";
import { useEffect, useState } from "react";

const useStatisticsData = () => {
   const [upcomingExams, setUpcomingExams] = useState([]);
  const [data, setData] = useState({
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    totalQuestions: 0,
    totalInstitutes: 0,
    activeInstitute:.0,
    totalCenters: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          examsRes,
          studentsRes,
          questionsRes,
          institutesRes,
          centersRes,
        ] = await Promise.all([
          getExamList(),         
          getStudentList(),
          getQuestionList(),
          getInstitutionList(),
          getCenterList(),
        ]);

        const rawExams = examsRes?.data?.data || [];
        const totalExams = examsRes?.data?.data?.length || 0;
       const activeExams = examsRes?.data?.data?.filter(exam => exam.exam_status === "A")?.length || 0;
       const activeInstitute = institutesRes?.data?.data?.filter(inst => inst.inst_status === "A")?.length || 0;

          const today = new Date();
        const upcoming = rawExams
        .filter(
    (exam) =>
      new Date(exam.exam_start_date) > today && exam.exam_status === "A"
  )
          .map((exam) => ({
            exam_id: exam.exam_id,
            name: exam.exam_name,
            date: exam.exam_start_date.split("T")[0],
            students: exam.exam_no_of_students,
            duration: exam.exam_duration,
          }));
          
        setUpcomingExams(upcoming);
        setData({
          totalExams,
          activeExams,
          totalStudents: studentsRes?.data?.result?.length || 0,
          totalQuestions: questionsRes?.data?.result?.length || 0,
          totalInstitutes: institutesRes?.data?.data?.length || 0,
          activeInstitute,
          totalCenters: centersRes?.data?.data?.length || 0,
        });

        setError(null);
      } catch (err) {
        setError(err);
        console.error("Statistics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, upcomingExams, loading, error };
};

export default useStatisticsData;
