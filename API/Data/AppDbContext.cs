using System;
using API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    //public AppDbContext(DbContextOptions options) : base(options){}
    // used primary constructor

    public DbSet<AppUser> Users { get; set; }

    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }
    // Inorder to return a UTC date since sqlite does not save the date in UTC format 
    // we're going to override a DbContext method called OnModelCreating
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //So we use this when we want to override or configure Entity Framework functionality.
        base.OnModelCreating(modelBuilder);
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v=> DateTime.SpecifyKind(v, DateTimeKind.Utc) 
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
