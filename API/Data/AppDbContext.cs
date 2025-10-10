/* This sets up the connection string and other configurations required for Entity Framework to interact with your database reliably.
Constructor: Your AppDbContext constructor usually accepts options from the DbContextOptions<T> to configure the context 
AppDbContext leverages Entity Framework (EF), which is an ORM that automates data access tasks. It translates your code into SQL commands to interact with the database.
    This abstraction reduces the need for manual SQL queries, making it easier and less error-prone to handle database operations.
Centralized Database Management: By using AppDbContext, you encapsulate all database interactions within one class. 
    This makes your codebase cleaner and easier to maintain. 
    The DbContext manages object caching and tracking changes, simplifying the process of managing data states.
Combines Patterns: DbContext inherently implements the Unit of Work and Repository patterns, 
    This means you can perform operations over multiple entities in a single transaction, ensuring data consistency.
Configuration and Dependency Injection: The AppDbContext is easily configurable via dependency injection.    
    This means you can manage connection strings and other configurations in a central location (like Startup.cs), 
Support for Migrations: EF, through AppDbContext, supports database migrations, 
    helping you manage changes to your database schema over time without losing existing data.
AppDbContext is crucial for simplifying database interactions, maintaining organized code, and leveraging EF to automate many tedious tasks related to data access.
*/

using System;
using API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    //public AppDbContext(DbContextOptions options) : base(options){}
    // commented because : used primary constructor

    public DbSet<AppUser> Users { get; set; }

    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }
    
    public DbSet<MemberLike> Likes { get; set; }

    // Inorder to return a UTC date since sqlite does not save the date in UTC format 
    // we're going to override a DbContext method called OnModelCreating

    // we'll use the ModelBuilder to configure the entity to get the functionality we want for Likes feature
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //So we use this when we want to override or configure Entity Framework functionality.
        base.OnModelCreating(modelBuilder);

        //MemberLike does not have a Id : we want our primary key to be a combination of SourceMemberId and TargetMemberId, 
        // and that's what we accomplished by configuring haskey.
        modelBuilder.Entity<MemberLike>()
        .HasKey(x => new  {x.SourceMemberId , x.TargetMemberId});

        modelBuilder.Entity<MemberLike>()
            .HasOne(s => s.SourceMember)
            .WithMany(t => t.LikedMembers)
            .HasForeignKey(s => s.SourceMemberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MemberLike>()
            .HasOne(s => s.TargetMember)
            .WithMany(t => t.LikedByMembers)
            .HasForeignKey(s => s.TargetMemberId)
            .OnDelete(DeleteBehavior.NoAction);


        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
            }
        }
    }

}
