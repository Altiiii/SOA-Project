namespace SubjectService.DTOs
{
    public class CreateSubjectDto
    {
        public int UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime ExamDeadline { get; set; }

        public string Priority { get; set; } = "Medium";
    }
}