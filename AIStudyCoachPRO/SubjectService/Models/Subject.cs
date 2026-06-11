namespace SubjectService.Models
{
    public class Subject
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime ExamDeadline { get; set; }

        public string Priority { get; set; } = "Medium";

        public List<Topic> Topics { get; set; } = new List<Topic>();
    }
}