using Microsoft.EntityFrameworkCore;
using StudyService.Models;

namespace StudyService.Data
{
    public class StudyDbContext : DbContext
    {
        public StudyDbContext(DbContextOptions<StudyDbContext> options)
            : base(options)
        {
        }

        public DbSet<StudySession> StudySessions { get; set; }

        public DbSet<QuizResult> QuizResults { get; set; }
    }
}