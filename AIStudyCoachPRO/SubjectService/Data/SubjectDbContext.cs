using Microsoft.EntityFrameworkCore;
using SubjectService.Models;

namespace SubjectService.Data
{
    public class SubjectDbContext : DbContext
    {
        public SubjectDbContext(DbContextOptions<SubjectDbContext> options)
            : base(options)
        {
        }

        public DbSet<Subject> Subjects { get; set; }

        public DbSet<Topic> Topics { get; set; }
    }
}